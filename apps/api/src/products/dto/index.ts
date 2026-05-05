import {
  IsString, IsOptional, IsNumber, IsBoolean, IsArray,
  IsEnum, ValidateNested, Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ListingStatus } from 'database';

export class CreateProductDto {
  @IsString()
  categoryId: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsEnum(ListingStatus)
  status?: ListingStatus;

  @IsOptional()
  @IsNumber()
  inventory?: number;

  @IsOptional()
  @IsNumber()
  lowStockAlert?: number;

  @IsOptional()
  @IsBoolean()
  freightRequired?: boolean;

  @IsOptional()
  attributes?: Record<string, any>;

  @IsOptional()
  scheduledAt?: string;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsEnum(ListingStatus)
  status?: ListingStatus;

  @IsOptional()
  @IsNumber()
  inventory?: number;

  @IsOptional()
  @IsBoolean()
  freightRequired?: boolean;

  @IsOptional()
  attributes?: Record<string, any>;
}

export class ProductSearchDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  categorySlug?: string;

  @IsOptional()
  minPrice?: number;

  @IsOptional()
  maxPrice?: number;

  @IsOptional()
  @IsString()
  vendorId?: string;

  @IsOptional()
  featured?: boolean;

  @IsOptional()
  page?: number;

  @IsOptional()
  pageSize?: number;

  @IsOptional()
  @IsString()
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'rating';
}
