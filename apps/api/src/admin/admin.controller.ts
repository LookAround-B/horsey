import {
  Controller, Get, Put, Patch, Post, Body, Param, Query,
  UseGuards, Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthRequest } from '../common/types/request';
import { UserRole } from 'database';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private adminService: AdminService) {}

  // ─── Users ────────────────────────────────────────────────────────────────

  @Get('users')
  listUsers(
    @Query('q') q?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.adminService.listUsers(q, page, pageSize);
  }

  @Patch('users/:id/suspend')
  suspendUser(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.adminService.suspendUser(req.user.id, id);
  }

  // ─── Settings ─────────────────────────────────────────────────────────────

  @Get('settings')
  getSettings() {
    return this.adminService.getSettings();
  }

  @Put('settings')
  updateSettings(
    @Req() req: AuthRequest,
    @Body() body: { settings: Record<string, string> },
  ) {
    return this.adminService.updateSettings(req.user.id, body.settings);
  }

  // ─── Categories ───────────────────────────────────────────────────────────

  @Post('categories')
  createCategory(
    @Req() req: AuthRequest,
    @Body() body: { name: string; slug: string; slaHours?: number },
  ) {
    return this.adminService.createCategory(req.user.id, body);
  }

  @Patch('categories/:id')
  updateCategory(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() body: { name?: string; slug?: string; slaHours?: number },
  ) {
    return this.adminService.updateCategory(req.user.id, id, body);
  }

  // ─── Disputes ─────────────────────────────────────────────────────────────

  @Get('disputes')
  listDisputes(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.adminService.listDisputes(page, pageSize);
  }

  @Get('disputes/:id/messages')
  getDisputeMessages(@Param('id') id: string) {
    return this.adminService.getDisputeMessages(id);
  }

  @Post('disputes/:id/messages')
  sendDisputeMessage(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() body: { body: string },
  ) {
    return this.adminService.sendDisputeMessage(req.user.id, id, body.body);
  }

  @Patch('disputes/:id/resolve')
  resolveDispute(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() body: { resolution: string },
  ) {
    return this.adminService.resolveDispute(req.user.id, id, body.resolution);
  }
}
