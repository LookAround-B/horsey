import { IsString, IsNotEmpty, IsOptional, IsInt, IsNumber, IsArray, IsBoolean, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateHorseDto {
  @ApiProperty() @IsString() @IsNotEmpty() name: string;
  @ApiProperty() @IsString() @IsNotEmpty() breed: string;
  @ApiProperty() @IsInt() @Min(0) @Type(() => Number) age: number;
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) disciplines?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() passportNo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() color?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() gender?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) height?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() registrationNo?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) mediaUrls?: string[];
  @ApiPropertyOptional() @IsOptional() @IsBoolean() forSale?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Type(() => Number) price?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() location?: string;
}

export class UpdateHorseDto extends CreateHorseDto {}
