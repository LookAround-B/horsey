import {
  Controller, Post, Get, Delete, Body, Param, Req, Res, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import {
  RegisterDto, LoginDto, RefreshTokenDto, VerifyEmailDto, ResendVerificationDto,
  SendOtpDto, VerifyOtpDto, GoogleAuthDto, GoogleExchangeDto,
  ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto,
  VerifyMfaDto, ConfirmMfaDto, DisableMfaDto,
} from './dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
    private readonly auditService: AuditService,
  ) {}

  private getIp(req: Request): string {
    return this.auditService.extractIpFromRequest(req);
  }

  private getUserAgent(req: Request): string | undefined {
    return req.headers['user-agent']?.substring(0, 512);
  }

  private setRefreshCookie(res: Response, rawRefreshToken: string): void {
    res.cookie('refresh_token', rawRefreshToken, this.tokenService.getRefreshCookieOptions());
  }

  private clearRefreshCookie(res: Response): void {
    res.cookie('refresh_token', '', this.tokenService.getClearRefreshCookieOptions());
  }

  // ─── REGISTER ─────────────────────────────────────────────────────────────

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 3, ttl: 3600000 } })
  @ApiOperation({ summary: 'Register with email + password' })
  async register(@Body() dto: RegisterDto, @Req() req: Request) {
    return this.authService.register({
      email: dto.email, password: dto.password, name: dto.name, role: dto.role,
      ipAddress: this.getIp(req), userAgent: this.getUserAgent(req),
    });
  }

  // ─── LOGIN ────────────────────────────────────────────────────────────────

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 900000 } })
  @ApiOperation({ summary: 'Login with email + password' })
  async login(@Body() dto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login({
      email: dto.email, password: dto.password,
      ipAddress: this.getIp(req), userAgent: this.getUserAgent(req),
    });
    if (result.mfaRequired) {
      return { mfaRequired: true, mfaSessionToken: result.mfaSessionToken };
    }
    const resultWithRefresh = result as { accessToken: string; rawRefreshToken?: string; user: Record<string, unknown> };
    if (resultWithRefresh.rawRefreshToken) {
      this.setRefreshCookie(res, resultWithRefresh.rawRefreshToken);
    }
    return { accessToken: result.accessToken, user: result.user };
  }

  // ─── REFRESH ──────────────────────────────────────────────────────────────

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 300000 } })
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const rawRefreshToken = req.cookies?.refresh_token;
    if (!rawRefreshToken) throw new Error('No refresh token');
    const result = await this.authService.refresh(rawRefreshToken, this.getIp(req), this.getUserAgent(req));
    this.setRefreshCookie(res, result.rawRefreshToken);
    return { accessToken: result.accessToken };
  }

  // ─── LOGOUT ───────────────────────────────────────────────────────────────

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and invalidate session' })
  async logout(
    @CurrentUser() user: { id: string; sessionId: string },
    @Req() req: Request, @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.logout(
      user.id, user.sessionId, req.cookies?.refresh_token,
      this.getIp(req), this.getUserAgent(req),
    );
    this.clearRefreshCookie(res);
    return result;
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout all sessions' })
  async logoutAll(
    @CurrentUser('id') userId: string,
    @Req() req: Request, @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.logoutAll(userId, this.getIp(req), this.getUserAgent(req));
    this.clearRefreshCookie(res);
    return result;
  }

  // ─── EMAIL VERIFICATION ───────────────────────────────────────────────────

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 900000 } })
  @ApiOperation({ summary: 'Verify email using token' })
  async verifyEmail(@Body() dto: VerifyEmailDto, @Req() req: Request) {
    return this.authService.verifyEmail(dto.token, this.getIp(req));
  }

  @Public()
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 3600000 } })
  @ApiOperation({ summary: 'Resend email verification link' })
  async resendVerification(@Body() dto: ResendVerificationDto, @Req() req: Request) {
    return this.authService.resendVerification(dto.email, this.getIp(req), this.getUserAgent(req));
  }

  // ─── PASSWORD RESET ───────────────────────────────────────────────────────

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 3600000 } })
  @ApiOperation({ summary: 'Send password reset email' })
  async forgotPassword(@Body() dto: ForgotPasswordDto, @Req() req: Request) {
    return this.authService.forgotPassword(dto.email, this.getIp(req), this.getUserAgent(req));
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 900000 } })
  @ApiOperation({ summary: 'Reset password using token from email' })
  async resetPassword(@Body() dto: ResetPasswordDto, @Req() req: Request) {
    return this.authService.resetPassword(dto.token, dto.newPassword, this.getIp(req), this.getUserAgent(req));
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password (requires current password)' })
  async changePassword(
    @CurrentUser() user: { id: string; sessionId: string },
    @Body() dto: ChangePasswordDto, @Req() req: Request,
  ) {
    return this.authService.changePassword(
      user.id, user.sessionId, dto.currentPassword, dto.newPassword,
      this.getIp(req), this.getUserAgent(req),
    );
  }

  // ─── PHONE OTP ────────────────────────────────────────────────────────────

  @Public()
  @Post('otp/send')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 600000 } })
  @ApiOperation({ summary: 'Send OTP to phone number' })
  async sendOtp(@Body() dto: SendOtpDto, @Req() req: Request) {
    return this.authService.sendOtp(dto.phone, this.getIp(req), this.getUserAgent(req));
  }

  @Public()
  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 600000 } })
  @ApiOperation({ summary: 'Verify OTP and get tokens' })
  async verifyOtp(@Body() dto: VerifyOtpDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.verifyOtp(
      dto.phone, dto.code, dto.name, this.getIp(req), this.getUserAgent(req),
    );
    if (result.rawRefreshToken) this.setRefreshCookie(res, result.rawRefreshToken);
    return { accessToken: result.accessToken, user: result.user };
  }

  // ─── GOOGLE OAUTH ─────────────────────────────────────────────────────────

  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Redirect to Google OAuth' })
  googleLogin() { /* Guard redirects */ }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const profile = req.user as { googleId: string; email?: string; name: string; avatarUrl?: string };
    const code = await this.authService.handleGoogleAuth(profile, this.getIp(req), this.getUserAgent(req));
    const frontendUrl = this.configService?.get?.('FRONTEND_URL') || process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?code=${code}`);
  }

  private get configService() {
    return (this.authService as unknown as { configService: { get: (key: string) => string } }).configService;
  }

  @Public()
  @Post('google/exchange')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exchange one-time code for tokens' })
  async googleExchange(@Body() dto: GoogleExchangeDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.exchangeOAuthCode(dto.code, this.getIp(req), this.getUserAgent(req));
    if (result.rawRefreshToken) this.setRefreshCookie(res, result.rawRefreshToken);
    return { accessToken: result.accessToken, user: result.user };
  }

  // ─── GOOGLE AUTH (ID Token exchange — backward compat) ────────────────────

  @Public()
  @Post('google/token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exchange Google ID token for JWT tokens (backward compat)' })
  async googleAuth(@Body() dto: GoogleAuthDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.googleAuth(dto.idToken, this.getIp(req), this.getUserAgent(req));
    if (result.rawRefreshToken) this.setRefreshCookie(res, result.rawRefreshToken);
    return { accessToken: result.accessToken, user: result.user };
  }

  // ─── MFA ──────────────────────────────────────────────────────────────────

  @Post('mfa/enable')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enable MFA — returns secret + QR URL' })
  async enableMfa(@CurrentUser('id') userId: string) {
    return this.authService.enableMfa(userId);
  }

  @Post('mfa/confirm')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm MFA setup with TOTP code' })
  async confirmMfa(@CurrentUser('id') userId: string, @Body() dto: ConfirmMfaDto, @Req() req: Request) {
    return this.authService.confirmMfa(userId, dto.totp, this.getIp(req));
  }

  @Public()
  @Post('mfa/verify')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 600000 } })
  @ApiOperation({ summary: 'Verify MFA TOTP during login' })
  async verifyMfa(@Body() dto: VerifyMfaDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.verifyMfa(dto.userId, dto.totp, this.getIp(req), this.getUserAgent(req));
    const resultWithRefresh = result as { accessToken: string; rawRefreshToken?: string; user: Record<string, unknown> };
    if (resultWithRefresh.rawRefreshToken) this.setRefreshCookie(res, resultWithRefresh.rawRefreshToken);
    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('mfa/disable')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disable MFA — requires password + TOTP' })
  async disableMfa(@CurrentUser('id') userId: string, @Body() dto: DisableMfaDto, @Req() req: Request) {
    return this.authService.disableMfa(userId, dto.password, dto.totp, this.getIp(req));
  }

  // ─── SESSION MANAGEMENT ───────────────────────────────────────────────────

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List active sessions' })
  async getSessions(@CurrentUser('id') userId: string) {
    return this.authService.getSessions(userId);
  }

  @Delete('sessions/:sessionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke a specific session' })
  async revokeSession(
    @CurrentUser() user: { id: string; sessionId: string },
    @Param('sessionId') sessionId: string, @Req() req: Request,
  ) {
    return this.authService.revokeSession(user.id, sessionId, user.sessionId, this.getIp(req));
  }
}
