import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy {
  private readonly logger = new Logger(GoogleStrategy.name);
  private strategy: InstanceType<typeof Strategy> | null = null;

  constructor(private configService: ConfigService) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID', '');
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET', '');

    if (!clientID || clientID === '...') {
      this.logger.warn('⚠️  Google OAuth not configured — skipping strategy registration');
      return;
    }

    class ConcreteGoogleStrategy extends PassportStrategy(Strategy, 'google') {
      constructor() {
        super({
          clientID,
          clientSecret,
          callbackURL: `${configService.get<string>('API_URL', 'http://localhost:3001/api/v1')}/auth/google/callback`,
          scope: ['email', 'profile'],
        });
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

    this.strategy = new ConcreteGoogleStrategy();
  }
}
