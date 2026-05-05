import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthRequest } from '../common/types/request';
import { UserRole } from 'database';
import { OrdersService } from './orders.service';
import {
  AddToCartDto, CheckoutDto, DeclineSubOrderDto, ShipSubOrderDto,
} from './dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  // ─── Cart ──────────────────────────────────────────────────────────────────

  @Get('cart')
  getCart(@Req() req: AuthRequest) {
    return this.ordersService.getCart(req.user.id);
  }

  @Post('cart/items')
  addToCart(@Req() req: AuthRequest, @Body() dto: AddToCartDto) {
    return this.ordersService.addToCart(req.user.id, dto);
  }

  @Delete('cart/items/:itemId')
  removeFromCart(@Req() req: AuthRequest, @Param('itemId') itemId: string) {
    return this.ordersService.removeFromCart(req.user.id, itemId);
  }

  // ─── Checkout ──────────────────────────────────────────────────────────────

  @Post('orders/checkout')
  checkout(@Req() req: AuthRequest, @Body() dto: CheckoutDto) {
    return this.ordersService.checkout(req.user.id, dto);
  }

  // ─── Buyer ────────────────────────────────────────────────────────────────

  @Get('orders')
  getBuyerOrders(
    @Req() req: AuthRequest,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.ordersService.getBuyerOrders(req.user.id, page, pageSize);
  }

  // ─── Vendor ────────────────────────────────────────────────────────────────

  @Get('vendor/orders')
  @UseGuards(RolesGuard)
  @Roles(UserRole.VENDOR)
  getVendorOrders(
    @Req() req: AuthRequest,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.ordersService.getVendorOrders(req.user.id, page, pageSize);
  }

  @Patch('sub-orders/:id/accept')
  @UseGuards(RolesGuard)
  @Roles(UserRole.VENDOR)
  acceptOrder(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.ordersService.acceptSubOrder(req.user.id, id);
  }

  @Patch('sub-orders/:id/decline')
  @UseGuards(RolesGuard)
  @Roles(UserRole.VENDOR)
  declineOrder(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: DeclineSubOrderDto,
  ) {
    return this.ordersService.declineSubOrder(req.user.id, id, dto);
  }

  @Patch('sub-orders/:id/ship')
  @UseGuards(RolesGuard)
  @Roles(UserRole.VENDOR)
  shipOrder(@Req() req: AuthRequest, @Param('id') id: string, @Body() dto: ShipSubOrderDto) {
    return this.ordersService.shipSubOrder(req.user.id, id, dto);
  }

  @Patch('sub-orders/:id/deliver')
  @UseGuards(RolesGuard)
  @Roles(UserRole.VENDOR)
  confirmDelivery(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.ordersService.confirmDelivery(req.user.id, id);
  }

  // ─── Admin ────────────────────────────────────────────────────────────────

  @Get('admin/orders')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  getAdminOrderFeed(
    @Query('status') status?: string,
    @Query('vendorId') vendorId?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.ordersService.getAdminOrderFeed({ status, vendorId, page, pageSize });
  }

  @Get('admin/sla-dashboard')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  getSlaDashboard() {
    return this.ordersService.getSlaDashboard();
  }

  @Patch('admin/sub-orders/:id/force-accept')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  forceAccept(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.ordersService.adminForceAccept(req.user.id, id);
  }

  @Patch('admin/sub-orders/:id/force-cancel')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  forceCancel(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.ordersService.adminForceCancel(req.user.id, id);
  }
}
