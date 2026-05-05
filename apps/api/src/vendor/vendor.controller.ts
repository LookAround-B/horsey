import {
  Controller, Get, Post, Patch, Body, Param, Query,
  UseGuards, Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthRequest } from '../common/types/request';
import { UserRole } from 'database';
import { VendorService } from './vendor.service';
import { CreateVendorDto, ReviewVendorDto } from './dto';

@Controller('vendors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VendorController {
  constructor(private vendorService: VendorService) {}

  @Post('apply')
  apply(@Req() req: AuthRequest, @Body() dto: CreateVendorDto) {
    return this.vendorService.applyAsVendor(req.user.id, dto);
  }

  @Get('me')
  @Roles(UserRole.VENDOR)
  getMyProfile(@Req() req: AuthRequest) {
    return this.vendorService.getMyVendorProfile(req.user.id);
  }

  @Post('me/kyc')
  @Roles(UserRole.VENDOR)
  uploadKyc(
    @Req() req: AuthRequest,
    @Body() body: { type: string; url: string },
  ) {
    return this.vendorService.uploadKycDocument(req.user.id, body.type, body.url);
  }

  @Get('me/analytics')
  @Roles(UserRole.VENDOR)
  getAnalytics(@Req() req: AuthRequest) {
    return this.vendorService.getVendorAnalytics(req.user.id);
  }

  @Get('applications')
  @Roles(UserRole.ADMIN)
  listApplications(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.vendorService.listPendingApplications(page, pageSize);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  getVendor(@Param('id') id: string) {
    return this.vendorService.getVendorById(id);
  }

  @Patch(':id/review')
  @Roles(UserRole.ADMIN)
  reviewVendor(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: ReviewVendorDto,
  ) {
    return this.vendorService.reviewApplication(req.user.id, id, dto);
  }
}
