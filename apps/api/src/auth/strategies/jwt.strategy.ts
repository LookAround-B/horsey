import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { SessionService } from '../session.service';
import { JwtAccessPayload } from '../interfaces';

/**
 * JWT access token strategy.
 * - Extracts token from Authorization Bearer header ONLY
 * - Validates signature, expiry, jti
 * - Checks user isActive, isBanned
 * - Checks session is not revoked
 * - Checks passwordChangedAt < iat
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly sessionService: SessionService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(
        'JWT_ACCESS_SECRET',
        'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
      ),
      algorithms: ['HS256'],
    });
  }

  async validate(payload: JwtAccessPayload): Promise<{
    id: string;
    role: string;
    name: string;
    email: string | null;
    phone: string | null;
    sessionId: string;
    emailVerified: boolean;
  }> {
    if (!payload.sub || !payload.jti || !payload.sessionId) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Fetch user from DB
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        role: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        isBanned: true,
        passwordChangedAt: true,
        emailVerified: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.isBanned) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if password was changed after token was issued
    if (user.passwordChangedAt && payload.iat) {
      const passwordChangedTimestamp = Math.floor(
        user.passwordChangedAt.getTime() / 1000,
      );
      if (passwordChangedTimestamp > payload.iat) {
        throw new UnauthorizedException('Invalid credentials');
      }
    }

    // Validate session is still active
    const sessionValid = await this.sessionService.validateSession(
      payload.sessionId,
    );
    if (!sessionValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      phone: user.phone,
      sessionId: payload.sessionId,
      emailVerified: user.emailVerified,
    };
  }
}
