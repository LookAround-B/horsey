import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { SessionService } from './session.service';
import { PasswordService } from './password.service';
import { AuditService } from './audit.service';
import { OtpService } from './otp.service';
import { EncryptionService } from './encryption.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { AppleStrategy } from './strategies/apple.strategy';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_ACCESS_SECRET', 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2'),
        signOptions: { expiresIn: config.get('JWT_ACCESS_EXPIRES_IN', '15m') },
      }),
    }),
    NotificationsModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService, TokenService, SessionService, PasswordService,
    AuditService, OtpService, EncryptionService,
    JwtStrategy, JwtRefreshStrategy, LocalStrategy, GoogleStrategy, AppleStrategy,
  ],
  exports: [AuthService, TokenService, SessionService, PasswordService, AuditService, PassportModule],
})
export class AuthModule {}
