import { Controller, Get, Patch, Body, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { AuthRequest } from '../common/types/request';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  getNotifications(
    @Req() req: AuthRequest,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    return this.notificationsService.getNotifications(
      req.user.id,
      unreadOnly === 'true',
    );
  }

  @Get('unread-count')
  getUnreadCount(@Req() req: AuthRequest) {
    return this.notificationsService.getUnreadCount(req.user.id);
  }

  @Patch('mark-read')
  markRead(@Req() req: AuthRequest, @Body() body: { ids: string[] }) {
    return this.notificationsService.markRead(req.user.id, body.ids);
  }

  @Patch('mark-all-read')
  markAllRead(@Req() req: AuthRequest) {
    return this.notificationsService.markAllRead(req.user.id);
  }
}
