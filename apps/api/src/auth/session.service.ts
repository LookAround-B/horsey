import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Create a new session. The session token is stored as SHA-256 hash.
   * Returns the raw session token (to be included in JWT) and the session ID.
   */
  async createSession(params: {
    userId: string;
    ipAddress: string;
    userAgent?: string;
    deviceFingerprint?: string;
  }): Promise<{ sessionId: string; rawSessionToken: string }> {
    const rawSessionToken = crypto.randomBytes(32).toString('hex');
    const sessionTokenHash = this.hashToken(rawSessionToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 day session

    const session = await this.prisma.session.create({
      data: {
        userId: params.userId,
        sessionToken: sessionTokenHash,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent?.substring(0, 512),
        deviceFingerprint: params.deviceFingerprint,
        expiresAt,
      },
    });

    return {
      sessionId: session.id,
      rawSessionToken,
    };
  }

  /**
   * Validate a session exists, is not revoked, and not expired.
   */
  async validateSession(sessionId: string): Promise<boolean> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) return false;
    if (session.isRevoked) return false;
    if (session.expiresAt < new Date()) return false;

    // Update lastUsedAt
    await this.prisma.session.update({
      where: { id: sessionId },
      data: { lastUsedAt: new Date() },
    }).catch(() => {
      // Non-critical — don't fail the request
    });

    return true;
  }

  /**
   * Revoke a specific session.
   */
  async revokeSession(sessionId: string): Promise<void> {
    await this.prisma.session.update({
      where: { id: sessionId },
      data: { isRevoked: true },
    });
  }

  /**
   * Revoke all sessions for a user.
   */
  async revokeAllSessions(userId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });
  }

  /**
   * Revoke all sessions EXCEPT the current one.
   */
  async revokeOtherSessions(userId: string, currentSessionId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: {
        userId,
        isRevoked: false,
        id: { not: currentSessionId },
      },
      data: { isRevoked: true },
    });
  }

  /**
   * Get all active sessions for a user (for session management UI).
   * Never returns the session token hash.
   */
  async getActiveSessions(userId: string): Promise<Array<{
    id: string;
    deviceFingerprint: string | null;
    userAgent: string | null;
    ipAddress: string | null;
    lastUsedAt: Date;
    createdAt: Date;
  }>> {
    return this.prisma.session.findMany({
      where: {
        userId,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        deviceFingerprint: true,
        userAgent: true,
        ipAddress: true,
        lastUsedAt: true,
        createdAt: true,
      },
      orderBy: { lastUsedAt: 'desc' },
    });
  }

  /**
   * SHA-256 hash a raw token.
   */
  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
