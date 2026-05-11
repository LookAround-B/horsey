import {
  Injectable, UnauthorizedException, BadRequestException, Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { TokenService } from './token.service';
import { SessionService } from './session.service';
import { PasswordService } from './password.service';
import { AuditService } from './audit.service';
import { OtpService } from './otp.service';
import { EncryptionService } from './encryption.service';
import { AuthEvent, UserRole } from 'database';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly maxLoginAttempts: number;
  private readonly lockoutDurationMin: number;
  // One-time codes for OAuth callback (code → { userId, expiresAt })
  private readonly oauthCodes = new Map<string, { userId: string; expiresAt: number }>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
    private readonly sessionService: SessionService,
    private readonly passwordService: PasswordService,
    private readonly auditService: AuditService,
    private readonly otpService: OtpService,
    private readonly encryptionService: EncryptionService,
    private readonly notificationsService: NotificationsService,
  ) {
    this.maxLoginAttempts = parseInt(configService.get('MAX_LOGIN_ATTEMPTS', '5'), 10);
    this.lockoutDurationMin = parseInt(configService.get('LOCKOUT_DURATION_MINUTES', '15'), 10);
  }

  // ─── REGISTER ─────────────────────────────────────────────────────────────

  async register(params: {
    email: string; password: string; name: string; role?: UserRole;
    ipAddress: string; userAgent?: string;
  }) {
    this.passwordService.validateStrength(params.password, { email: params.email, name: params.name });

    const existing = await this.prisma.user.findUnique({ where: { email: params.email } });
    if (existing) {
      this.auditService.log({
        event: AuthEvent.REGISTER_EMAIL, ipAddress: params.ipAddress,
        userAgent: params.userAgent, success: false,
        failureReason: 'Email already registered',
        metadata: { email: this.auditService.maskEmail(params.email) },
      });
      // Anti-enumeration: same response
      return { message: 'Registration successful. Please verify your email.' };
    }

    const passwordHash = await this.passwordService.hash(params.password);
    const rawVerifyToken = crypto.randomBytes(32).toString('hex');
    const verifyTokenHash = this.tokenService.hashToken(rawVerifyToken);
    const verifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.prisma.user.create({
      data: {
        email: params.email, name: params.name, passwordHash,
        role: params.role || UserRole.BUYER, emailVerified: false,
        emailVerifyToken: verifyTokenHash, emailVerifyTokenExpiry: verifyExpiry,
      },
    });

    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');
    this.notificationsService.sendEmail(
      params.email, 'Verify your Horsey email',
      `<h2>Email Verification</h2><p>Click below to verify your email.</p><p><a href="${frontendUrl}/verify-email?token=${rawVerifyToken}" style="padding:12px 24px;background:#f97316;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;">Verify Email</a></p>`,
    ).catch(() => {});

    this.auditService.log({
      event: AuthEvent.REGISTER_EMAIL, ipAddress: params.ipAddress,
      userAgent: params.userAgent, success: true,
      metadata: { email: this.auditService.maskEmail(params.email) },
    });

    return { message: 'Registration successful. Please verify your email.' };
  }

  // ─── LOGIN ────────────────────────────────────────────────────────────────

  async login(params: {
    email: string; password: string; ipAddress: string; userAgent?: string;
  }): Promise<{ accessToken: string; user: Record<string, unknown>; mfaRequired?: boolean; mfaSessionToken?: string }> {
    const user = await this.prisma.user.findUnique({ where: { email: params.email } });

    if (!user || !user.passwordHash) {
      await this.passwordService.dummyCompare();
      await this.artificialDelay();
      this.auditService.log({
        event: AuthEvent.LOGIN_FAILED, ipAddress: params.ipAddress,
        userAgent: params.userAgent, success: false, failureReason: 'User not found',
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.isBanned) {
      await this.passwordService.dummyCompare();
      await this.artificialDelay();
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      await this.passwordService.dummyCompare();
      await this.artificialDelay();
      this.auditService.log({
        userId: user.id, event: AuthEvent.LOGIN_BLOCKED,
        ipAddress: params.ipAddress, userAgent: params.userAgent,
        success: false, failureReason: 'Account locked',
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await this.passwordService.compare(params.password, user.passwordHash);
    if (!isValid) {
      await this.artificialDelay();
      const attempts = user.failedLoginAttempts + 1;
      if (attempts >= this.maxLoginAttempts) {
        const lockedUntil = new Date(Date.now() + this.lockoutDurationMin * 60 * 1000);
        await this.prisma.user.update({
          where: { id: user.id },
          data: { failedLoginAttempts: 0, lockedUntil },
        });
        this.auditService.log({
          userId: user.id, event: AuthEvent.ACCOUNT_LOCKED,
          ipAddress: params.ipAddress, userAgent: params.userAgent,
          success: false, failureReason: `Locked after ${this.maxLoginAttempts} failed attempts`,
        });
        if (user.email) {
          this.notificationsService.sendEmail(user.email, 'Account Locked',
            '<p>Your Horsey account has been temporarily locked due to multiple failed login attempts.</p>',
          ).catch(() => {});
        }
      } else {
        await this.prisma.user.update({
          where: { id: user.id }, data: { failedLoginAttempts: attempts },
        });
      }
      this.auditService.log({
        userId: user.id, event: AuthEvent.LOGIN_FAILED,
        ipAddress: params.ipAddress, userAgent: params.userAgent,
        success: false, failureReason: 'Invalid password',
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.emailVerified) {
      throw new BadRequestException('Please verify your email first');
    }

    // MFA check
    if (user.mfaEnabled) {
      const mfaSessionToken = crypto.randomBytes(32).toString('hex');
      this.oauthCodes.set(`mfa:${mfaSessionToken}`, {
        userId: user.id, expiresAt: Date.now() + 5 * 60 * 1000,
      });
      return { accessToken: '', user: {}, mfaRequired: true, mfaSessionToken };
    }

    return this.completeLogin(user, params.ipAddress, params.userAgent);
  }

  private async completeLogin(
    user: { id: string; role: UserRole; name: string; email: string | null; emailVerified: boolean; avatarUrl: string | null },
    ipAddress: string, userAgent?: string,
  ) {
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0, lockedUntil: null,
        lastLoginAt: new Date(), lastLoginIp: ipAddress,
        lastLoginUserAgent: userAgent?.substring(0, 512),
      },
    });

    const { sessionId } = await this.sessionService.createSession({
      userId: user.id, ipAddress, userAgent,
    });

    const { accessToken, rawRefreshToken } = await this.tokenService.generateTokenPair({
      userId: user.id, role: user.role, sessionId, ipAddress, userAgent,
    });

    this.auditService.log({
      userId: user.id, event: AuthEvent.LOGIN_EMAIL,
      ipAddress, userAgent, success: true,
    });

    return {
      accessToken,
      rawRefreshToken,
      user: {
        id: user.id, email: user.email, name: user.name,
        role: user.role, emailVerified: user.emailVerified,
      },
    } as { accessToken: string; rawRefreshToken?: string; user: Record<string, unknown> };
  }

  // ─── REFRESH ──────────────────────────────────────────────────────────────

  async refresh(rawRefreshToken: string, ipAddress: string, userAgent?: string) {
    const result = await this.tokenService.rotateRefreshToken(rawRefreshToken, ipAddress, userAgent);
    this.auditService.log({
      userId: result.userId, event: AuthEvent.TOKEN_REFRESH,
      ipAddress, userAgent, success: true,
    });
    return { accessToken: result.accessToken, rawRefreshToken: result.rawRefreshToken };
  }

  // ─── LOGOUT ───────────────────────────────────────────────────────────────

  async logout(userId: string, sessionId: string, refreshTokenCookie: string | undefined, ipAddress: string, userAgent?: string) {
    if (refreshTokenCookie) {
      const hash = this.tokenService.hashToken(refreshTokenCookie);
      await this.tokenService.revokeFamilyByTokenHash(hash);
    }
    await this.sessionService.revokeSession(sessionId);
    this.auditService.log({ userId, event: AuthEvent.LOGOUT, ipAddress, userAgent, success: true });
    return { message: 'Logged out successfully' };
  }

  async logoutAll(userId: string, ipAddress: string, userAgent?: string) {
    await this.tokenService.revokeAllUserTokens(userId);
    await this.sessionService.revokeAllSessions(userId);
    this.auditService.log({ userId, event: AuthEvent.LOGOUT_ALL, ipAddress, userAgent, success: true });
    return { message: 'All sessions terminated' };
  }

  // ─── EMAIL VERIFICATION ───────────────────────────────────────────────────

  async verifyEmail(token: string, ipAddress: string) {
    const tokenHash = this.tokenService.hashToken(token);
    const user = await this.prisma.user.findFirst({
      where: { emailVerifyToken: tokenHash, emailVerifyTokenExpiry: { gt: new Date() } },
    });
    if (!user) throw new BadRequestException('Invalid or expired verification token');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, emailVerifyToken: null, emailVerifyTokenExpiry: null },
    });
    this.auditService.log({ userId: user.id, event: AuthEvent.EMAIL_VERIFIED, ipAddress, success: true });
    return { message: 'Email verified successfully' };
  }

  async resendVerification(email: string, ipAddress: string, userAgent?: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && !user.emailVerified) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = this.tokenService.hashToken(rawToken);
      await this.prisma.user.update({
        where: { id: user.id },
        data: { emailVerifyToken: tokenHash, emailVerifyTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000) },
      });
      const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');
      this.notificationsService.sendEmail(email, 'Verify your Horsey email',
        `<p><a href="${frontendUrl}/verify-email?token=${rawToken}">Verify Email</a></p>`,
      ).catch(() => {});
      this.auditService.log({ userId: user.id, event: AuthEvent.EMAIL_VERIFY_SENT, ipAddress, userAgent, success: true });
    }
    return { message: 'If this email is registered, a verification link has been sent.' };
  }

  // ─── PASSWORD RESET ───────────────────────────────────────────────────────

  async forgotPassword(email: string, ipAddress: string, userAgent?: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = this.tokenService.hashToken(rawToken);
      await this.prisma.user.update({
        where: { id: user.id },
        data: { passwordResetToken: tokenHash, passwordResetExpiry: new Date(Date.now() + 60 * 60 * 1000) },
      });
      const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');
      this.notificationsService.sendEmail(email, 'Reset your Horsey password',
        `<p><a href="${frontendUrl}/reset-password?token=${rawToken}">Reset Password</a></p>`,
      ).catch(() => {});
      this.auditService.log({ userId: user.id, event: AuthEvent.PASSWORD_RESET_REQUESTED, ipAddress, userAgent, success: true });
    }
    return { message: 'If this email is registered, a reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string, ipAddress: string, userAgent?: string) {
    const tokenHash = this.tokenService.hashToken(token);
    const user = await this.prisma.user.findFirst({
      where: { passwordResetToken: tokenHash, passwordResetExpiry: { gt: new Date() } },
    });
    if (!user) throw new BadRequestException('Invalid or expired reset token');

    this.passwordService.validateStrength(newPassword, { email: user.email, name: user.name });
    if (user.passwordHash) {
      const same = await this.passwordService.isSameAsCurrentPassword(newPassword, user.passwordHash);
      if (same) throw new BadRequestException('New password must be different from current password');
    }

    const passwordHash = await this.passwordService.hash(newPassword);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, passwordChangedAt: new Date(), passwordResetToken: null, passwordResetExpiry: null },
    });
    await this.tokenService.revokeAllUserTokens(user.id);
    await this.sessionService.revokeAllSessions(user.id);

    if (user.email) {
      this.notificationsService.sendEmail(user.email, 'Password Changed', '<p>Your password was changed. If this was not you, contact support.</p>').catch(() => {});
    }
    this.auditService.log({ userId: user.id, event: AuthEvent.PASSWORD_RESET_COMPLETED, ipAddress, userAgent, success: true });
    return { message: 'Password reset successful. Please log in again.' };
  }

  async changePassword(userId: string, sessionId: string, currentPassword: string, newPassword: string, ipAddress: string, userAgent?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.passwordHash) throw new UnauthorizedException('Invalid credentials');

    const valid = await this.passwordService.compare(currentPassword, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    this.passwordService.validateStrength(newPassword, { email: user.email, name: user.name });
    const same = await this.passwordService.isSameAsCurrentPassword(newPassword, user.passwordHash);
    if (same) throw new BadRequestException('New password must be different from current password');

    const passwordHash = await this.passwordService.hash(newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash, passwordChangedAt: new Date() },
    });
    await this.sessionService.revokeOtherSessions(userId, sessionId);

    if (user.email) {
      this.notificationsService.sendEmail(user.email, 'Password Changed', '<p>Your password was changed.</p>').catch(() => {});
    }
    this.auditService.log({ userId, event: AuthEvent.PASSWORD_CHANGED, ipAddress, userAgent, success: true });
    return { message: 'Password changed successfully' };
  }

  // ─── PHONE OTP ────────────────────────────────────────────────────────────

  async sendOtp(phone: string, ipAddress: string, userAgent?: string) {
    await this.otpService.sendOtp(phone);
    this.auditService.log({ event: AuthEvent.PHONE_OTP_SENT, ipAddress, userAgent, success: true, metadata: { phone: phone.slice(0, 4) + '****' } });
    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(phone: string, code: string, name: string | undefined, ipAddress: string, userAgent?: string) {
    const isValid = await this.otpService.verifyOtp(phone, code);
    if (!isValid) throw new UnauthorizedException('Invalid OTP');

    let user = await this.prisma.user.findUnique({ where: { phone } });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = await this.prisma.user.create({
        data: { phone, name: name || 'New User', phoneVerified: true },
      });
    } else {
      await this.prisma.user.update({ where: { id: user.id }, data: { phoneVerified: true } });
    }

    const { sessionId } = await this.sessionService.createSession({ userId: user.id, ipAddress, userAgent });
    const { accessToken, rawRefreshToken } = await this.tokenService.generateTokenPair({
      userId: user.id, role: user.role, sessionId, ipAddress, userAgent,
    });

    this.auditService.log({
      userId: user.id,
      event: isNewUser ? AuthEvent.REGISTER_PHONE : AuthEvent.LOGIN_PHONE,
      ipAddress, userAgent, success: true,
    });

    return {
      accessToken, rawRefreshToken,
      user: { id: user.id, name: user.name, phone: user.phone, role: user.role },
    };
  }

  // ─── GOOGLE OAUTH ─────────────────────────────────────────────────────────

  async handleGoogleAuth(profile: { googleId: string; email?: string; name: string; avatarUrl?: string }, ipAddress: string, userAgent?: string) {
    let user = await this.prisma.user.findFirst({
      where: { OR: [{ googleId: profile.googleId }, ...(profile.email ? [{ email: profile.email }] : [])] },
    });

    let isNewUser = false;
    if (!user) {
      isNewUser = true;
      user = await this.prisma.user.create({
        data: {
          email: profile.email, name: profile.name, avatarUrl: profile.avatarUrl,
          googleId: profile.googleId, emailVerified: true,
        },
      });
    } else if (!user.googleId) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { googleId: profile.googleId, emailVerified: true, avatarUrl: user.avatarUrl || profile.avatarUrl },
      });
    }

    // Generate one-time code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.oauthCodes.set(code, { userId: user.id, expiresAt: Date.now() + 30000 });

    this.auditService.log({
      userId: user.id,
      event: isNewUser ? AuthEvent.REGISTER_GOOGLE : AuthEvent.LOGIN_GOOGLE,
      ipAddress, userAgent, success: true,
    });

    return code;
  }

  async exchangeOAuthCode(code: string, ipAddress: string, userAgent?: string) {
    const entry = this.oauthCodes.get(code);
    if (!entry || entry.expiresAt < Date.now()) {
      throw new UnauthorizedException('Invalid or expired code');
    }
    this.oauthCodes.delete(code);

    const user = await this.prisma.user.findUnique({ where: { id: entry.userId } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const { sessionId } = await this.sessionService.createSession({ userId: user.id, ipAddress, userAgent });
    const { accessToken, rawRefreshToken } = await this.tokenService.generateTokenPair({
      userId: user.id, role: user.role, sessionId, ipAddress, userAgent,
    });

    return {
      accessToken, rawRefreshToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  }

  // ─── GOOGLE AUTH (ID TOKEN EXCHANGE — backward compat) ────────────────────

  async googleAuth(idToken: string, ipAddress: string, userAgent?: string) {
    const { OAuth2Client } = require('google-auth-library');
    const clientId = this.configService.get('GOOGLE_CLIENT_ID');
    const client = new OAuth2Client(clientId);

    let googleUser: { email: string; name: string; picture?: string; sub: string };
    try {
      if (clientId && clientId !== '...') {
        const ticket = await client.verifyIdToken({ idToken, audience: clientId });
        const payload = ticket.getPayload();
        if (!payload) throw new UnauthorizedException('Invalid Google token');
        googleUser = { email: payload.email!, name: payload.name || payload.email!, picture: payload.picture, sub: payload.sub };
      } else {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.decode(idToken);
        if (!decoded?.email) throw new UnauthorizedException('Invalid token');
        googleUser = { email: decoded.email, name: decoded.name || decoded.email, picture: decoded.picture, sub: decoded.sub || decoded.email };
      }
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Invalid Google token');
    }

    const code = await this.handleGoogleAuth(
      { googleId: googleUser.sub, email: googleUser.email, name: googleUser.name, avatarUrl: googleUser.picture },
      ipAddress, userAgent,
    );
    return this.exchangeOAuthCode(code, ipAddress, userAgent);
  }

  // ─── MFA ──────────────────────────────────────────────────────────────────

  async enableMfa(userId: string) {
    const { authenticator } = require('otplib');
    const secret = authenticator.generateSecret();
    const encrypted = this.encryptionService.encrypt(secret);

    await this.prisma.user.update({ where: { id: userId }, data: { mfaSecret: encrypted } });

    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
    const otpAuthUrl = authenticator.keyuri(user?.email || userId, 'Horsey', secret);

    // Generate backup codes
    const backupCodes: string[] = [];
    const hashedCodes: string[] = [];
    for (let i = 0; i < 10; i++) {
      const code = crypto.randomBytes(5).toString('hex');
      backupCodes.push(code);
      hashedCodes.push(this.tokenService.hashToken(code));
    }
    await this.prisma.user.update({
      where: { id: userId }, data: { mfaBackupCodes: JSON.stringify(hashedCodes) },
    });

    return { secret, qrCodeUrl: otpAuthUrl, backupCodes };
  }

  async confirmMfa(userId: string, totp: string, ipAddress: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.mfaSecret) throw new BadRequestException('MFA not initialized');

    const { authenticator } = require('otplib');
    const secret = this.encryptionService.decrypt(user.mfaSecret);
    const isValid = authenticator.verify({ token: totp, secret });
    if (!isValid) throw new BadRequestException('Invalid TOTP code');

    await this.prisma.user.update({ where: { id: userId }, data: { mfaEnabled: true } });
    this.auditService.log({ userId, event: AuthEvent.MFA_ENABLED, ipAddress, success: true });
    return { message: 'MFA enabled successfully' };
  }

  async verifyMfa(mfaSessionToken: string, totp: string, ipAddress: string, userAgent?: string) {
    const entry = this.oauthCodes.get(`mfa:${mfaSessionToken}`);
    if (!entry || entry.expiresAt < Date.now()) {
      throw new UnauthorizedException('Invalid or expired MFA session');
    }

    const user = await this.prisma.user.findUnique({ where: { id: entry.userId } });
    if (!user || !user.mfaSecret) throw new UnauthorizedException('Invalid credentials');

    const { authenticator } = require('otplib');
    const secret = this.encryptionService.decrypt(user.mfaSecret);
    let isValid = authenticator.verify({ token: totp, secret });

    // Try backup codes if TOTP fails
    if (!isValid && user.mfaBackupCodes) {
      const codes: string[] = JSON.parse(user.mfaBackupCodes);
      const hashedInput = this.tokenService.hashToken(totp);
      const idx = codes.indexOf(hashedInput);
      if (idx !== -1) {
        isValid = true;
        codes.splice(idx, 1);
        await this.prisma.user.update({
          where: { id: user.id }, data: { mfaBackupCodes: JSON.stringify(codes) },
        });
      }
    }

    if (!isValid) {
      this.auditService.log({ userId: user.id, event: AuthEvent.MFA_VERIFY_FAILED, ipAddress, userAgent, success: false });
      throw new UnauthorizedException('Invalid credentials');
    }

    this.oauthCodes.delete(`mfa:${mfaSessionToken}`);
    return this.completeLogin(user, ipAddress, userAgent);
  }

  async disableMfa(userId: string, password: string, totp: string, ipAddress: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.passwordHash || !user.mfaSecret) throw new UnauthorizedException('Invalid credentials');

    const passwordValid = await this.passwordService.compare(password, user.passwordHash);
    if (!passwordValid) throw new UnauthorizedException('Invalid credentials');

    const { authenticator } = require('otplib');
    const secret = this.encryptionService.decrypt(user.mfaSecret);
    const totpValid = authenticator.verify({ token: totp, secret });
    if (!totpValid) throw new UnauthorizedException('Invalid TOTP code');

    await this.prisma.user.update({
      where: { id: userId }, data: { mfaEnabled: false, mfaSecret: null, mfaBackupCodes: null },
    });

    if (user.email) {
      this.notificationsService.sendEmail(user.email, 'MFA Disabled', '<p>MFA was disabled on your account.</p>').catch(() => {});
    }
    this.auditService.log({ userId, event: AuthEvent.MFA_DISABLED, ipAddress, success: true });
    return { message: 'MFA disabled successfully' };
  }

  // ─── SESSIONS ─────────────────────────────────────────────────────────────

  async getSessions(userId: string) {
    return this.sessionService.getActiveSessions(userId);
  }

  async revokeSession(userId: string, sessionId: string, currentSessionId: string, ipAddress: string) {
    if (sessionId === currentSessionId) throw new BadRequestException('Use /logout to end current session');
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    if (!session || session.userId !== userId) throw new BadRequestException('Session not found');

    await this.sessionService.revokeSession(sessionId);
    this.auditService.log({ userId, event: AuthEvent.SESSION_REVOKED, ipAddress, success: true, metadata: { sessionId } });
    return { message: 'Session revoked' };
  }

  // ─── HELPERS ──────────────────────────────────────────────────────────────

  private async artificialDelay(): Promise<void> {
    const delay = 200 + Math.floor(Math.random() * 300);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}
