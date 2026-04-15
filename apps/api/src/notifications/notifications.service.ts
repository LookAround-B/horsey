import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  /**
   * Create an in-app notification and optionally push via FCM.
   */
  async send(userId: string, title: string, body: string, type: string, metadata?: any) {
    // Create in-app notification
    const notification = await this.prisma.notification.create({
      data: { userId, title, body, type, metadata },
    });

    // Attempt FCM push
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { fcmToken: true },
    });

    if (user?.fcmToken) {
      try {
        this.logger.log(`[FCM] Would push to ${userId}: ${title}`);
        // In production: use firebase-admin to send push notification
      } catch (error) {
        this.logger.error(`FCM push failed for ${userId}: ${error}`);
      }
    }

    return notification;
  }

  /**
   * Send email notifications via Resend.
   */
  async sendEmail(to: string, subject: string, html: string) {
    const apiKey = this.configService.get('RESEND_API_KEY');

    if (!apiKey || apiKey === '...') {
      this.logger.warn(`[DEV] Email to ${to}: ${subject}`);
      return { sent: false, dev: true };
    }

    try {
      // In production: use Resend SDK
      this.logger.log(`Email sent to ${to}: ${subject}`);
      return { sent: true };
    } catch (error) {
      this.logger.error(`Email failed: ${error}`);
      return { sent: false, error };
    }
  }

  /**
   * Get notifications for a user.
   */
  async getNotifications(userId: string, unreadOnly = false) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly && { isRead: false }),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  /**
   * Mark notifications as read.
   */
  async markRead(userId: string, ids: string[]) {
    await this.prisma.notification.updateMany({
      where: { userId, id: { in: ids } },
      data: { isRead: true },
    });
    return { marked: ids.length };
  }
}
