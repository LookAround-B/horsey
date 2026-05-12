import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(configService: ConfigService) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID', '');
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET', '');
    const apiUrl = configService.get<string>('API_URL', 'http://localhost:3001/api/v1');

    // Always call super first - use dummy values if not configured
    super({
      clientID: clientID || 'dummy-client-id',
      clientSecret: clientSecret || 'dummy-secret',
      callbackURL: `${apiUrl}/auth/google/callback`,
      scope: ['email', 'profile'],
    });

    if (!clientID || clientID === '...' || clientID === 'dummy-client-id') {
      this.logger.warn('⚠️  Google OAuth not configured — strategy will not work');
    } else {
      this.logger.log('✅ Google OAuth strategy initialized');
    }
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): void {
    const email = profile.emails?.[0]?.value;
    done(null, {
      googleId: profile.id,
      email,
      name: profile.displayName || email || 'User',
      avatarUrl: profile.photos?.[0]?.value,
    });
  }
}
