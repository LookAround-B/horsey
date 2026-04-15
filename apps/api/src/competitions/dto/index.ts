import {
  IsString, IsNotEmpty, IsOptional, IsInt, IsEnum, IsDateString, Min, IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateCompetitionDto {
  @ApiProperty() @IsString() @IsNotEmpty() name: string;
  @ApiProperty() @IsString() @IsNotEmpty() discipline: string;
  @ApiProperty() @IsString() @IsNotEmpty() level: string;
  @ApiPropertyOptional() @IsOptional() @IsString() ageCategory?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() arenaSize?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() format?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() testSheetId?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) @Type(() => Number) maxJudges?: number;
  @ApiPropertyOptional() @IsOptional() @IsDateString() startTime?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Type(() => Number) orderOfGo?: number;
  // Show Jumping specific
  @ApiPropertyOptional() @IsOptional() @IsInt() @Type(() => Number) courseLength?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Type(() => Number) obstacles?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Type(() => Number) efforts?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Type(() => Number) speedMPerMin?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Type(() => Number) timeAllowed?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Type(() => Number) heightMin?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Type(() => Number) heightMax?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Type(() => Number) spread?: number;
}

export class CreateEntryDto {
  @ApiProperty() @IsString() @IsNotEmpty() horseId: string;
}

export class GenerateDrawDto {
  @ApiPropertyOptional({ description: 'Seed for deterministic draw generation' })
  @IsOptional() @IsInt() @Type(() => Number) seed?: number;
}
