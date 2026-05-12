import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, Min } from 'class-validator';

export class AddToCartDto {
  @IsString()
  productId: string;

  @IsOptional()
  @IsString()
  variantId?: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CheckoutDto {
  @IsArray()
  subOrders: SubOrderCheckoutItem[];
}

export class SubOrderCheckoutItem {
  @IsString()
  vendorId: string;

  @IsString()
  addressId: string;

  @IsOptional()
  @IsString()
  shippingMethod?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  buyerAttestation?: boolean;

  @IsOptional()
  @IsBoolean()
  vetCheckRequested?: boolean;

  @IsOptional()
  @IsBoolean()
  escrowRequested?: boolean;
}

export class DeclineSubOrderDto {
  @IsString()
  reason: string;
}

export class ShipSubOrderDto {
  @IsString()
  trackingNumber: string;

  @IsOptional()
  @IsString()
  shippingMethod?: string;
}
