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

  // ─── Core ─────────────────────────────────────────────────────────────────

  async send(
    userId: string,
    type: string,
    title: string,
    body: string,
    subOrderId?: string,
  ) {
    const notification = await this.prisma.notification.create({
      data: { userId, type, title, body, subOrderId },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { fcmToken: true },
    });

    if (user?.fcmToken) {
      this.logger.log(`[FCM] Push to ${userId}: ${title}`);
      // production: firebase-admin sendToDevice(user.fcmToken, { notification: { title, body } })
    }

    return notification;
  }

  async sendEmail(to: string, subject: string, html: string) {
    const apiKey = this.configService.get('RESEND_API_KEY');
    if (!apiKey || apiKey === '...') {
      this.logger.warn(`[DEV] Email → ${to}: ${subject}`);
      return { sent: false, dev: true };
    }
    // production: resend.emails.send({ from: 'noreply@horsey.in', to, subject, html })
    return { sent: true };
  }

  async sendSms(to: string, message: string) {
    const sid = this.configService.get('TWILIO_ACCOUNT_SID');
    if (!sid || sid === '...') {
      this.logger.warn(`[DEV] SMS → ${to}: ${message}`);
      return;
    }
    // production: twilio.messages.create({ to, from: process.env.TWILIO_PHONE, body: message })
  }

  // ─── Marketplace Events ───────────────────────────────────────────────────

  async notifyNewOrder(vendorUserId: string, subOrderId: string) {
    await this.send(
      vendorUserId,
      'ORDER_PLACED',
      'New order received',
      'You have a new order. You have 24 hours to accept or decline.',
      subOrderId,
    );
  }

  async notifyOrderAccepted(buyerUserId: string, subOrderId: string) {
    await this.send(
      buyerUserId,
      'ORDER_ACCEPTED',
      'Your order was accepted',
      'The vendor has accepted your order and will ship it soon.',
      subOrderId,
    );
  }

  async notifyOrderDeclined(buyerUserId: string, subOrderId: string, reason: string) {
    await this.send(
      buyerUserId,
      'ORDER_DECLINED',
      'Your order was declined',
      `The vendor declined your order. Reason: ${reason}. A full refund will be processed.`,
      subOrderId,
    );
  }

  async notifyOrderShipped(buyerUserId: string, subOrderId: string, trackingNumber: string) {
    await this.send(
      buyerUserId,
      'ORDER_SHIPPED',
      'Your order has been shipped',
      `Your order is on its way. Tracking: ${trackingNumber}`,
      subOrderId,
    );
  }

  async notifyOrderDelivered(buyerUserId: string, subOrderId: string) {
    await this.send(
      buyerUserId,
      'ORDER_DELIVERED',
      'Order delivered',
      'Your order has been delivered. Please leave a review!',
      subOrderId,
    );
  }

  async notifyOrderCancelled(buyerUserId: string, subOrderId: string) {
    await this.send(
      buyerUserId,
      'ORDER_AUTO_CANCELLED',
      'Order auto-cancelled',
      'Your order was auto-cancelled due to vendor inaction. A full refund will be processed.',
      subOrderId,
    );
  }

  // ─── User Queries ─────────────────────────────────────────────────────────

  async getNotifications(userId: string, unreadOnly = false) {
    return this.prisma.notification.findMany({
      where: { userId, ...(unreadOnly ? { isRead: false } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({ where: { userId, isRead: false } });
  }

  async markRead(userId: string, ids: string[]) {
    await this.prisma.notification.updateMany({
      where: { userId, id: { in: ids } },
      data: { isRead: true },
    });
    return { marked: ids.length };
  }

  async markAllRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { marked: result.count };
  }
}
