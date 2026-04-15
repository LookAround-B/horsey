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

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

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

  /**
   * Google OAuth: exchange Google ID token for app JWT tokens.
   */
  async googleAuth(
    idToken: string,
  ): Promise<{ accessToken: string; refreshToken: string; user: any }> {
    // In production, verify the Google ID token
    // For now, decode it (the frontend sends user info)
    let googleUser: { email: string; name: string; picture?: string; sub: string };

    try {
      // Decode the JWT (in production, verify with Google's public keys)
      const payload = this.jwtService.decode(idToken) as any;
      googleUser = {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        sub: payload.sub,
      };
    } catch {
      throw new UnauthorizedException('Invalid Google token');
    }

    if (!googleUser?.email) {
      throw new UnauthorizedException('Google token missing email');
    }

    // Find or create user
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
        },
      });
    } else if (!user.googleId) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { googleId: googleUser.sub, avatarUrl: user.avatarUrl || googleUser.picture },
      });
    }

    const tokens = await this.generateTokens(user.id, user.role);

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

  /**
   * Refresh access token using a valid refresh token.
   */
  async refreshTokens(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    let payload: any;

    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET', 'horsey-refresh-secret-dev'),
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
        secret: this.configService.get('JWT_REFRESH_SECRET', 'horsey-refresh-secret-dev'),
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
