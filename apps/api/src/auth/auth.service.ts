import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private googleClient: OAuth2Client;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get('GOOGLE_CLIENT_ID'),
    );
  }

  // ─── Google OAuth (Primary Auth Flow) ──────────────────────────────────

  /**
   * Exchange a Google ID token for Horsey JWT tokens.
   *
   * Flow:
   * 1. Verify Google ID token against Google's public keys
   * 2. Extract user info (email, name, picture, sub)
   * 3. Find or create user in the database
   * 4. Generate and return Horsey access + refresh tokens
   */
  async googleAuth(
    idToken: string,
  ): Promise<{ accessToken: string; refreshToken: string; user: any }> {
    let googleUser: {
      email: string;
      name: string;
      picture?: string;
      sub: string;
    };

    try {
      const clientId = this.configService.get('GOOGLE_CLIENT_ID');

      if (clientId && clientId !== '...') {
        // Production: Verify the Google ID token with Google's public keys
        const ticket = await this.googleClient.verifyIdToken({
          idToken,
          audience: clientId,
        });
        const payload = ticket.getPayload();

        if (!payload) {
          throw new UnauthorizedException('Invalid Google token payload');
        }

        googleUser = {
          email: payload.email!,
          name: payload.name || payload.email!,
          picture: payload.picture,
          sub: payload.sub,
        };
      } else {
        // Dev fallback: decode JWT without verification
        const payload = this.jwtService.decode(idToken) as any;
        if (!payload?.email) {
          throw new UnauthorizedException('Invalid token — no email found');
        }
        googleUser = {
          email: payload.email,
          name: payload.name || payload.email,
          picture: payload.picture,
          sub: payload.sub || payload.email,
        };
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      this.logger.error(`Google token verification failed: ${error}`);
      throw new UnauthorizedException('Invalid Google token');
    }

    if (!googleUser?.email) {
      throw new UnauthorizedException('Google token missing email');
    }

    // Find or create user by googleId or email
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [{ googleId: googleUser.sub }, { email: googleUser.email }],
      },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name,
          avatarUrl: googleUser.picture,
          googleId: googleUser.sub,
          emailVerified: true,
        },
      });
      this.logger.log(`New user created via Google: ${googleUser.email}`);
    } else if (!user.googleId) {
      // Link Google account to existing user
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: googleUser.sub,
          avatarUrl: user.avatarUrl || googleUser.picture,
          emailVerified: true,
        },
      });
      this.logger.log(`Linked Google account to user: ${user.email}`);
    }

    const tokens = await this.generateTokens(user.id, user.role);

    // Store hashed refresh token
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: await bcrypt.hash(tokens.refreshToken, 10) },
    });

    return {
      ...tokens,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  // ─── OTP Flow (Legacy — kept for backward compat) ──────────────────────

  /**
   * Send OTP via Twilio Verify.
   * In development, logs the OTP instead of sending SMS.
   */
  async sendOtp(phone: string): Promise<{ message: string }> {
    const twilioSid = this.configService.get('TWILIO_ACCOUNT_SID');

    if (!twilioSid || twilioSid === '...') {
      // Dev mode: skip Twilio
      this.logger.warn(`[DEV] OTP requested for ${phone} — use code 123456`);
      return { message: 'OTP sent successfully (dev mode)' };
    }

    try {
      const twilio = require('twilio')(
        twilioSid,
        this.configService.get('TWILIO_AUTH_TOKEN'),
      );

      await twilio.verify.v2
        .services(this.configService.get('TWILIO_VERIFY_SERVICE_SID'))
        .verifications.create({ to: phone, channel: 'sms' });

      return { message: 'OTP sent successfully' };
    } catch (error) {
      this.logger.error(`Failed to send OTP: ${error}`);
      throw new BadRequestException('Failed to send OTP');
    }
  }

  /**
   * Verify OTP and issue JWT tokens.
   * Creates user if they don't exist.
   */
  async verifyOtp(
    phone: string,
    code: string,
    name?: string,
  ): Promise<{ accessToken: string; refreshToken: string; user: any }> {
    const twilioSid = this.configService.get('TWILIO_ACCOUNT_SID');

    // Verify OTP
    if (twilioSid && twilioSid !== '...') {
      try {
        const twilio = require('twilio')(
          twilioSid,
          this.configService.get('TWILIO_AUTH_TOKEN'),
        );

        const verification = await twilio.verify.v2
          .services(this.configService.get('TWILIO_VERIFY_SERVICE_SID'))
          .verificationChecks.create({ to: phone, code });

        if (verification.status !== 'approved') {
          throw new UnauthorizedException('Invalid OTP');
        }
      } catch (error) {
        if (error instanceof UnauthorizedException) throw error;
        this.logger.error(`OTP verification failed: ${error}`);
        throw new BadRequestException('OTP verification failed');
      }
    } else {
      // Dev mode: accept 123456
      if (code !== '123456') {
        throw new UnauthorizedException('Invalid OTP (dev mode: use 123456)');
      }
    }

    // Find or create user
    let user = await this.prisma.user.findUnique({ where: { phone } });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone,
          name: name || 'New User',
        },
      });
    }

    const tokens = await this.generateTokens(user.id, user.role);

    // Store hashed refresh token
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: await bcrypt.hash(tokens.refreshToken, 10) },
    });

    return {
      ...tokens,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  // ─── Token Management ──────────────────────────────────────────────────

  /**
   * Refresh access token using a valid refresh token.
   */
  async refreshTokens(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    let payload: any;

    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get(
          'JWT_REFRESH_SECRET',
          'horsey-refresh-secret-dev',
        ),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('User not found or logged out');
    }

    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.generateTokens(user.id, user.role);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: await bcrypt.hash(tokens.refreshToken, 10) },
    });

    return tokens;
  }

  /**
   * Logout: clear refresh token.
   */
  async logout(userId: string): Promise<{ message: string }> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    return { message: 'Logged out successfully' };
  }

  /**
   * Generate access + refresh token pair.
   */
  private async generateTokens(
    userId: string,
    role: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: userId, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
        secret: this.configService.get('JWT_SECRET', 'horsey-jwt-secret-dev'),
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
        secret: this.configService.get(
          'JWT_REFRESH_SECRET',
          'horsey-refresh-secret-dev',
        ),
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
