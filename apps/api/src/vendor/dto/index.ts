import { IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateVendorDto {
  @IsString()
  businessName: string;

  @IsOptional()
  @IsString()
  gstNumber?: string;

  @IsOptional()
  @IsString()
  panNumber?: string;
}

export class ReviewVendorDto {
  @IsString()
  action: 'APPROVED' | 'REJECTED' | 'MORE_INFO_REQUESTED' | 'SUSPENDED' | 'TERMINATED';

  @IsOptional()
  @IsString()
  note?: string;
}
