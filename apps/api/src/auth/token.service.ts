import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { SessionService } from './session.service';
import { AuditService } from './audit.service';
import { UserRole, AuthEvent } from 'database';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpiresIn: string;
  private readonly refreshExpiresInMs: number;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly sessionService: SessionService,
    private readonly auditService: AuditService,
  ) {
    this.accessSecret = this.configService.get<string>(
      'JWT_ACCESS_SECRET',
      'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
    );
    this.refreshSecret = this.configService.get<string>(
      'JWT_REFRESH_SECRET',
      'f0e1d2c3b4a5f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e1',
    );
    this.accessExpiresIn = this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m');

    // Parse refresh token expiry (default 7d)
    const refreshExpiry = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');
    this.refreshExpiresInMs = this.parseExpiryToMs(refreshExpiry);
  }

  /**
   * Generate an access token + opaque refresh token pair.
   * Access token is a JWT, refresh token is a crypto random hex string stored hashed in DB.
   */
  async generateTokenPair(params: {
    userId: string;
    role: UserRole;
    sessionId: string;
    ipAddress: string;
    userAgent?: string;
    familyId?: string;
  }): Promise<{
    accessToken: string;
    rawRefreshToken: string;
  }> {
    const jti = uuidv4();

    // Sign access token
    const accessToken = await this.jwtService.signAsync(
      {
        sub: params.userId,
        role: params.role,
        sessionId: params.sessionId,
        jti,
      },
      {
        secret: this.accessSecret,
        expiresIn: this.accessExpiresIn,
      },
    );

    // Generate opaque refresh token
    const rawRefreshToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawRefreshToken);
    const familyId = params.familyId || uuidv4();
    const expiresAt = new Date(Date.now() + this.refreshExpiresInMs);

    // Store hashed refresh token in DB
    await this.prisma.refreshToken.create({
      data: {
        userId: params.userId,
        tokenHash,
        familyId,
        expiresAt,
        userAgent: params.userAgent?.substring(0, 512),
        ipAddress: params.ipAddress,
      },
    });

    return { accessToken, rawRefreshToken };
  }

  /**
   * Rotate a refresh token. Implements:
   * - Reuse detection (revoked token presented → revoke entire family)
   * - Token rotation (old token revoked, new token issued)
   */
  async rotateRefreshToken(
    rawToken: string,
    ipAddress: string,
    userAgent?: string,
  ): Promise<{
    accessToken: string;
    rawRefreshToken: string;
    userId: string;
  }> {
    const tokenHash = this.hashToken(rawToken);

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // REUSE DETECTION: If token is already revoked, someone is replaying it
    if (storedToken.isRevoked) {
      this.logger.warn(
        `🔴 REFRESH TOKEN REUSE DETECTED for user ${storedToken.userId} from IP ${ipAddress}`,
      );

      // Revoke the entire family
      await this.revokeTokenFamily(storedToken.familyId);

      // Revoke all sessions for this user
      await this.sessionService.revokeAllSessions(storedToken.userId);

      // Log the security event
      this.auditService.log({
        userId: storedToken.userId,
        event: AuthEvent.TOKEN_REFRESH_REUSE_DETECTED,
        ipAddress,
        userAgent,
        success: false,
        failureReason: 'Refresh token reuse detected — possible token theft',
        metadata: { familyId: storedToken.familyId },
      });

      throw new UnauthorizedException('Invalid credentials');
    }

    // Check expiry
    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check user is still active
    if (!storedToken.user.isActive || storedToken.user.isBanned) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate new token pair
    const newRawRefreshToken = crypto.randomBytes(32).toString('hex');
    const newTokenHash = this.hashToken(newRawRefreshToken);
    const expiresAt = new Date(Date.now() + this.refreshExpiresInMs);
    const jti = uuidv4();

    // Find active session for user
    const activeSession = await this.prisma.session.findFirst({
      where: {
        userId: storedToken.userId,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastUsedAt: 'desc' },
    });

    const sessionId = activeSession?.id || 'unknown';

    // Sign new access token
    const accessToken = await this.jwtService.signAsync(
      {
        sub: storedToken.userId,
        role: storedToken.user.role,
        sessionId,
        jti,
      },
      {
        secret: this.accessSecret,
        expiresIn: this.accessExpiresIn,
      },
    );

    // Revoke old token and create new one in a transaction
    await this.prisma.$transaction([
      this.prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { isRevoked: true, replacedByHash: newTokenHash },
      }),
      this.prisma.refreshToken.create({
        data: {
          userId: storedToken.userId,
          tokenHash: newTokenHash,
          familyId: storedToken.familyId,
          expiresAt,
          userAgent: userAgent?.substring(0, 512),
          ipAddress,
        },
      }),
    ]);

    // Update session lastUsedAt
    if (activeSession) {
      await this.prisma.session.update({
        where: { id: activeSession.id },
        data: { lastUsedAt: new Date() },
      }).catch(() => { /* non-critical */ });
    }

    return {
      accessToken,
      rawRefreshToken: newRawRefreshToken,
      userId: storedToken.userId,
    };
  }

  /**
   * Revoke all tokens in a family.
   */
  async revokeTokenFamily(familyId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { familyId },
      data: { isRevoked: true },
    });
  }

  /**
   * Revoke all token families for a user.
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });
  }

  /**
   * Revoke the family that contains a specific token hash.
   */
  async revokeFamilyByTokenHash(tokenHash: string): Promise<void> {
    const token = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      select: { familyId: true },
    });
    if (token) {
      await this.revokeTokenFamily(token.familyId);
    }
  }

  /**
   * Verify an access token and return the payload.
   */
  verifyAccessToken(token: string): {
    sub: string;
    role: UserRole;
    sessionId: string;
    jti: string;
    iat: number;
    exp: number;
  } {
    return this.jwtService.verify(token, { secret: this.accessSecret });
  }

  /**
   * SHA-256 hash a raw token for storage.
   */
  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Get refresh token cookie options.
   */
  getRefreshCookieOptions(): {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none';
    path: string;
    maxAge: number;
  } {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/api/v1/auth/refresh',
      maxAge: this.refreshExpiresInMs,
    };
  }

  /**
   * Get options to clear the refresh cookie.
   */
  getClearRefreshCookieOptions(): {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none';
    path: string;
    maxAge: number;
  } {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/api/v1/auth/refresh',
      maxAge: 0,
    };
  }

  private parseExpiryToMs(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000; // default 7d
    const value = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: return 7 * 24 * 60 * 60 * 1000;
    }
  }
}
