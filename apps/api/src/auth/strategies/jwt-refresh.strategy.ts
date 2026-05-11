import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

/**
 * JWT refresh token strategy.
 * Extracts the refresh token from the httpOnly cookie ONLY.
 * Not from body, not from Authorization header.
 */
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          // Extract from httpOnly cookie only
          return req?.cookies?.refresh_token || null;
        },
      ]),
      ignoreExpiration: true, // We validate expiry ourselves in token.service
      secretOrKey: configService.get<string>(
        'JWT_REFRESH_SECRET',
        'f0e1d2c3b4a5f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e1',
      ),
      passReqToCallback: true,
    });
  }

  validate(req: Request): { refreshToken: string } {
    const refreshToken = req?.cookies?.refresh_token;
    if (!refreshToken) {
      return { refreshToken: '' };
    }
    return { refreshToken };
  }
}
