import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { SubOrderStatus, VendorStatus } from 'database';
import { PgBoss } from 'pg-boss';

export const SLA_QUEUE = {
  REMINDER: 'sla-reminder',
  AUTO_CANCEL: 'sla-auto-cancel',
} as const;

@Injectable()
export class SlaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SlaService.name);
  private boss: PgBoss;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async onModuleInit() {
    const databaseUrl = this.config.get<string>('DATABASE_URL');
    if (!databaseUrl) {
      this.logger.warn('DATABASE_URL not set — SLA engine disabled');
      return;
    }

    this.boss = new PgBoss({ connectionString: databaseUrl });

    this.boss.on('error', (error: Error) => this.logger.error('pg-boss error', error));

    await this.boss.start();

    // Register handlers
    await this.boss.work<{ subOrderId: string; type: string }>(SLA_QUEUE.REMINDER, async ([job]) => {
      await this.handleReminder(job.data);
    });

    await this.boss.work<{ subOrderId: string }>(SLA_QUEUE.AUTO_CANCEL, async ([job]) => {
      await this.handleAutoCancel(job.data);
    });

    this.logger.log('SLA engine started');
  }

  async onModuleDestroy() {
    await this.boss?.stop();
  }

  async scheduleReminders(subOrderId: string, deadline: Date) {
    if (!this.boss) return;

    const now = Date.now();
    const deadlineMs = deadline.getTime();

    // T-12h, T-4h, T-1h reminders
    const reminders = [
      { offsetMs: 12 * 60 * 60 * 1000, type: 'T_12H' },
      { offsetMs: 4 * 60 * 60 * 1000, type: 'T_4H' },
      { offsetMs: 1 * 60 * 60 * 1000, type: 'T_1H' },
    ];

    for (const r of reminders) {
      const fireAt = new Date(deadlineMs - r.offsetMs);
      if (fireAt.getTime() > now) {
        await this.boss.sendAfter(
          SLA_QUEUE.REMINDER,
          { subOrderId, type: r.type },
          {},
          fireAt,
        );
      }
    }

    // Auto-cancel at deadline
    await this.boss.sendAfter(
      SLA_QUEUE.AUTO_CANCEL,
      { subOrderId },
      {},
      deadline,
    );

    this.logger.log(`SLA jobs scheduled for sub-order ${subOrderId}`);
  }

  async cancelReminders(subOrderId: string) {
    if (!this.boss) return;
    // pg-boss doesn't support cancellation by data; we check status in handlers
    this.logger.log(`SLA cancellation flagged for sub-order ${subOrderId}`);
  }

  private async handleReminder(data: { subOrderId: string; type: string }) {
    const subOrder = await this.prisma.subOrder.findUnique({
      where: { id: data.subOrderId },
      include: { vendor: { include: { user: true } } },
    });

    if (!subOrder || subOrder.status !== SubOrderStatus.PENDING_ACCEPTANCE) return;

    // Check platform downtime — pause SLA clock during incidents
    const activeDowntime = await this.prisma.platformDowntime.findFirst({
      where: { startedAt: { lte: new Date() }, endedAt: null },
    });
    if (activeDowntime) {
      this.logger.log(`SLA reminder skipped — platform downtime active`);
      return;
    }

    this.logger.log(`SLA reminder ${data.type} for sub-order ${data.subOrderId}`);

    // Create in-app notification for vendor
    await this.prisma.notification.create({
      data: {
        userId: subOrder.vendor.userId,
        type: `SLA_REMINDER_${data.type}`,
        title: `Order acceptance reminder`,
        body: `You have a pending order that needs your action. ${data.type.replace('_', '-')} remaining.`,
        subOrderId: data.subOrderId,
      },
    });
  }

  private async handleAutoCancel(data: { subOrderId: string }) {
    const subOrder = await this.prisma.subOrder.findUnique({
      where: { id: data.subOrderId },
      include: {
        vendor: { include: { user: true } },
        order: { include: { buyer: true } },
      },
    });

    if (!subOrder || subOrder.status !== SubOrderStatus.PENDING_ACCEPTANCE) return;

    // Check platform downtime
    const activeDowntime = await this.prisma.platformDowntime.findFirst({
      where: { startedAt: { lte: new Date() }, endedAt: null },
    });
    if (activeDowntime) {
      // Extend deadline by downtime duration (simplified: reschedule 1h later)
      const newDeadline = new Date(Date.now() + 60 * 60 * 1000);
      await this.boss.sendAfter(SLA_QUEUE.AUTO_CANCEL, { subOrderId: data.subOrderId }, {}, newDeadline);
      return;
    }

    this.logger.log(`Auto-cancelling sub-order ${data.subOrderId}`);

    await this.prisma.$transaction(async (tx) => {
      // 1. Cancel sub-order
      await tx.subOrder.update({
        where: { id: data.subOrderId },
        data: { status: SubOrderStatus.AUTO_CANCELLED },
      });

      // 2. Create vendor strike
      await tx.vendorStrike.create({
        data: {
          vendorId: subOrder.vendorId,
          subOrderId: data.subOrderId,
          reason: 'AUTO_CANCEL_SLA_BREACH',
        },
      });

      // 3. Check 3 strikes in 30 days → auto-suspend
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentStrikes = await tx.vendorStrike.count({
        where: { vendorId: subOrder.vendorId, createdAt: { gte: thirtyDaysAgo } },
      });

      if (recentStrikes >= 3) {
        await tx.vendor.update({
          where: { id: subOrder.vendorId },
          data: { status: VendorStatus.SUSPENDED },
        });
        this.logger.warn(`Vendor ${subOrder.vendorId} auto-suspended after 3 strikes`);
      }

      // 4. Notify buyer
      await tx.notification.create({
        data: {
          userId: subOrder.order.buyerId,
          type: 'ORDER_AUTO_CANCELLED',
          title: 'Order auto-cancelled',
          body: 'Your order was auto-cancelled because the vendor did not respond within 24 hours. A full refund will be processed.',
          subOrderId: data.subOrderId,
        },
      });

      // 5. Notify vendor
      await tx.notification.create({
        data: {
          userId: subOrder.vendor.userId,
          type: 'SLA_BREACH_STRIKE',
          title: 'SLA breach — strike recorded',
          body: `An order was auto-cancelled due to inaction. This strike has been recorded. ${recentStrikes >= 3 ? 'Your account has been suspended.' : ''}`,
          subOrderId: data.subOrderId,
        },
      });
    });
  }
}
