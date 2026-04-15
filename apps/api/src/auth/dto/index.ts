import { IsString, IsNotEmpty, IsOptional, IsEmail, Matches, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({ example: '+919876543210', description: 'Phone number with country code' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{6,14}$/, { message: 'Phone number must be in E.164 format (e.g. +919876543210)' })
  phone: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: '+919876543210' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{6,14}$/, { message: 'Phone number must be in E.164 format' })
  phone: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  @Length(4, 6)
  code: string;

  @ApiPropertyOptional({ example: 'Samer Khan' })
  @IsOptional()
  @IsString()
  name?: string;
}

export class GoogleAuthDto {
  @ApiProperty({ description: 'Google OAuth ID token' })
  @IsString()
  @IsNotEmpty()
  idToken: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
