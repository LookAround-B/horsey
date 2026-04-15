import {
  IsString, IsNotEmpty, IsOptional, IsDateString, IsBoolean,
  IsNumber, IsArray, IsEnum, IsInt, Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';

export class CreateEventDto {
  @ApiProperty() @IsString() @IsNotEmpty() name: string;
  @ApiProperty() @IsString() @IsNotEmpty() description: string;
  @ApiProperty() @IsDateString() startDate: string;
  @ApiProperty() @IsDateString() endDate: string;
  @ApiProperty() @IsString() @IsNotEmpty() venue: string;
  @ApiPropertyOptional() @IsOptional() @IsString() address?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() city?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() state?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) latitude?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) longitude?: number;
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) disciplines?: string[];
  @ApiPropertyOptional() @IsOptional() @IsBoolean() efiSanctioned?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() feiSanctioned?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() bannerUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() contactEmail?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() contactPhone?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Type(() => Number) maxEntries?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Type(() => Number) entryFee?: number;
  @ApiPropertyOptional() @IsOptional() @IsDateString() registrationDeadline?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() rules?: string;
}

export class UpdateEventDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() startDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() endDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() venue?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() address?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() city?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() state?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) latitude?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) longitude?: number;
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) disciplines?: string[];
  @ApiPropertyOptional() @IsOptional() @IsBoolean() efiSanctioned?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() feiSanctioned?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() bannerUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() contactEmail?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() contactPhone?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Type(() => Number) maxEntries?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Type(() => Number) entryFee?: number;
  @ApiPropertyOptional() @IsOptional() @IsDateString() registrationDeadline?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() rules?: string;
}

export class EventQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() discipline?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() startDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() endDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() city?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() state?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() level?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) latitude?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) longitude?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) radiusKm?: number;
  @ApiPropertyOptional() @IsOptional() @Transform(({ value }) => value === 'true') efiSanctioned?: boolean;
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @IsInt() @Min(1) @Type(() => Number) page?: number;
  @ApiPropertyOptional({ default: 12 }) @IsOptional() @IsInt() @Min(1) @Type(() => Number) pageSize?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
}
