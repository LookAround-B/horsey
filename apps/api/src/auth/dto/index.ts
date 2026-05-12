import {
  IsString, IsNotEmpty, IsOptional, IsEmail, IsEnum, IsIn,
  Matches, MinLength, MaxLength, Length,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from 'database';

// ─── Helper: Strip HTML tags ────────────────────────────────────────────────
const noHtml = Matches(/^[^<>]*$/, { message: 'HTML tags are not allowed' });

// ─── Register ───────────────────────────────────────────────────────────────

export class RegisterDto {
  @ApiProperty({ example: 'rider@example.com' })
  @IsEmail({}, { message: 'Invalid email address' })
  @MaxLength(254, { message: 'Email must not exceed 254 characters' })
  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase().trim() : value))
  email!: string;

  @ApiProperty({ example: 'SecurePass123!', minLength: 10 })
  @IsString()
  @MinLength(10, { message: 'Password must be at least 10 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~])/, {
    message: 'Password must contain uppercase, lowercase, digit, and special character',
  })
  password!: string;

  @ApiProperty({ example: 'Rohit Sharma' })
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  @Matches(/^[a-zA-Z\s'\-]+$/, { message: 'Name may only contain letters, spaces, hyphens, and apostrophes' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name!: string;

  @ApiPropertyOptional({ enum: ['BUYER', 'VENDOR'] })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be BUYER or VENDOR' })
  @IsIn([UserRole.BUYER, UserRole.VENDOR], { message: 'Cannot self-register as ADMIN' })
  role?: UserRole;
}

// ─── Login ──────────────────────────────────────────────────────────────────

export class LoginDto {
  @ApiProperty({ example: 'rider@example.com' })
  @IsEmail({}, { message: 'Invalid email address' })
  @MaxLength(254)
  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase().trim() : value))
  email!: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @MinLength(1, { message: 'Password is required' })
  @MaxLength(128)
  password!: string;
}

// ─── Refresh Token ──────────────────────────────────────────────────────────

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token (sent via cookie, but kept for backward compat)' })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}

// ─── Verify Email ───────────────────────────────────────────────────────────

export class VerifyEmailDto {
  @ApiProperty({ description: 'Email verification token' })
  @IsString()
  @IsNotEmpty({ message: 'Token is required' })
  token!: string;
}

// ─── Resend Verification ────────────────────────────────────────────────────

export class ResendVerificationDto {
  @ApiProperty({ example: 'rider@example.com' })
  @IsEmail({}, { message: 'Invalid email address' })
  @MaxLength(254)
  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase().trim() : value))
  email!: string;
}

// ─── Phone OTP ──────────────────────────────────────────────────────────────

export class SendOtpDto {
  @ApiProperty({ example: '+919876543210', description: 'Phone number in E.164 format' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{6,14}$/, { message: 'Phone number must be in E.164 format (e.g. +919876543210)' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  phone!: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: '+919876543210' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{6,14}$/, { message: 'Phone number must be in E.164 format' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  phone!: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  @Length(4, 6, { message: 'OTP code must be 4-6 digits' })
  code!: string;

  @ApiPropertyOptional({ example: 'Rohit Sharma' })
  @IsOptional()
  @IsString()
  name?: string;
}

// ─── Google Auth ────────────────────────────────────────────────────────────

export class GoogleAuthDto {
  @ApiProperty({ description: 'Google OAuth ID token' })
  @IsString()
  @IsNotEmpty()
  idToken!: string;
}

export class GoogleExchangeDto {
  @ApiProperty({ description: 'One-time code from Google OAuth callback' })
  @IsString()
  @IsNotEmpty()
  code!: string;
}

// ─── Forgot / Reset Password ────────────────────────────────────────────────

export class ForgotPasswordDto {
  @ApiProperty({ example: 'rider@example.com' })
  @IsEmail({}, { message: 'Invalid email address' })
  @MaxLength(254)
  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase().trim() : value))
  email!: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'Reset token from email' })
  @IsString()
  @IsNotEmpty({ message: 'Token is required' })
  token!: string;

  @ApiProperty({ example: 'NewSecurePass123!', minLength: 10 })
  @IsString()
  @MinLength(10, { message: 'Password must be at least 10 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~])/, {
    message: 'Password must contain uppercase, lowercase, digit, and special character',
  })
  newPassword!: string;
}

// ─── Change Password ────────────────────────────────────────────────────────

export class ChangePasswordDto {
  @ApiProperty({ description: 'Current password' })
  @IsString()
  @MinLength(1, { message: 'Current password is required' })
  @MaxLength(128)
  currentPassword!: string;

  @ApiProperty({ description: 'New password', minLength: 10 })
  @IsString()
  @MinLength(10, { message: 'Password must be at least 10 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~])/, {
    message: 'Password must contain uppercase, lowercase, digit, and special character',
  })
  newPassword!: string;
}

// ─── MFA ────────────────────────────────────────────────────────────────────

export class VerifyMfaDto {
  @ApiProperty({ description: 'User ID (from MFA-required response)' })
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({ description: 'TOTP code or backup code' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(20)
  totp!: string;
}

export class ConfirmMfaDto {
  @ApiProperty({ description: 'TOTP code from authenticator app' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'TOTP code must be exactly 6 digits' })
  totp!: string;
}

export class DisableMfaDto {
  @ApiProperty({ description: 'Current password' })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiProperty({ description: 'TOTP code from authenticator app' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'TOTP code must be exactly 6 digits' })
  totp!: string;
}
