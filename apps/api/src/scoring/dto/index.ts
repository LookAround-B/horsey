import { IsString, IsNotEmpty, IsOptional, IsArray, IsNumber, IsInt, Min, Max, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class MovementMarkDto {
  @ApiProperty() @IsInt() movementNumber: number;
  @ApiProperty() @IsNumber() @Min(0) @Max(10) mark: number;
  @ApiProperty() @IsInt() coefficient: number;
  @ApiProperty() @IsNumber() points: number;
  @ApiPropertyOptional() @IsOptional() @IsString() remark?: string;
}

class CollectiveMarkDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsNumber() @Min(0) @Max(10) mark: number;
  @ApiProperty() @IsInt() coefficient: number;
  @ApiProperty() @IsNumber() points: number;
}

class QualityMarksDto {
  @ApiProperty() @IsNumber() @Min(0) @Max(10) position: number;
  @ApiProperty() @IsNumber() @Min(0) @Max(10) aids: number;
  @ApiProperty() @IsNumber() @Min(0) @Max(10) precision: number;
  @ApiProperty() @IsNumber() @Min(0) @Max(10) impression: number;
}

export class SubmitDressageScoreDto {
  @ApiProperty() @IsString() @IsNotEmpty() entryId: string;
  @ApiProperty() @IsString() @IsNotEmpty() competitionId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() judgePosition?: string;

  @ApiProperty({ type: [MovementMarkDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MovementMarkDto)
  movementMarks: MovementMarkDto[];

  @ApiProperty({ type: [CollectiveMarkDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CollectiveMarkDto)
  collectiveMarks: CollectiveMarkDto[];

  @ApiPropertyOptional({ type: QualityMarksDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => QualityMarksDto)
  qualityMarks?: QualityMarksDto;

  @ApiProperty({ default: 0 }) @IsInt() @Min(0) @Max(3) errorCount: number;
}

export class SubmitShowJumpingScoreDto {
  @ApiProperty() @IsString() @IsNotEmpty() entryId: string;
  @ApiProperty() @IsString() @IsNotEmpty() competitionId: string;
  @ApiProperty() @IsInt() @Min(0) faults: number;
  @ApiProperty() @IsInt() @Min(0) @Max(3) refusals: number;
  @ApiProperty() @IsNumber() @Min(0) roundTime: number;
  @ApiProperty() @IsNumber() @Min(0) timeAllowed: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) jumpOffFaults?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) jumpOffTime?: number;
}

class TentPeggingRunDto {
  @ApiProperty() @IsInt() runNumber: number;
  @ApiProperty() @IsInt() pegSize: number;
  @ApiProperty() @IsInt() @Min(0) points: number;
  @ApiProperty() carried: boolean;
}

export class SubmitTentPeggingScoreDto {
  @ApiProperty() @IsString() @IsNotEmpty() entryId: string;
  @ApiProperty() @IsString() @IsNotEmpty() competitionId: string;

  @ApiProperty({ type: [TentPeggingRunDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TentPeggingRunDto)
  lanceRuns: TentPeggingRunDto[];

  @ApiProperty({ type: [TentPeggingRunDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TentPeggingRunDto)
  swordRuns: TentPeggingRunDto[];
}

export class UpdateScoreDto {
  @ApiPropertyOptional() @IsOptional() @IsArray() movementMarks?: any[];
  @ApiPropertyOptional() @IsOptional() @IsArray() collectiveMarks?: any[];
  @ApiPropertyOptional() @IsOptional() qualityMarks?: any;
  @ApiPropertyOptional() @IsOptional() @IsInt() errorCount?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() faults?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() refusals?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() roundTime?: number;
}
