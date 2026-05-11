import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ─── Users ────────────────────────────────────────────────────────────────

  async listUsers(q?: string, page = 1, pageSize = 50) {
    const skip = (page - 1) * pageSize;
    const where: any = {};
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          avatarUrl: true,
          emailVerified: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data, total, page, pageSize };
  }

  async suspendUser(adminId: string, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role === 'ADMIN') throw new ForbiddenException('Cannot suspend an admin');

    // Ban user and revoke all their sessions and tokens
    await this.prisma.user.update({
      where: { id: userId },
      data: { isBanned: true, isActive: false },
    });

    // Revoke all refresh tokens
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });

    // Revoke all sessions
    await this.prisma.session.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });

    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'USER_SUSPENDED',
        targetType: 'User',
        targetId: userId,
      },
    });

    return { suspended: true };
  }

  // ─── Settings ─────────────────────────────────────────────────────────────

  async getSettings() {
    return this.prisma.platformSetting.findMany({ orderBy: { key: 'asc' } });
  }

  async updateSettings(adminId: string, settings: Record<string, string>) {
    for (const [key, value] of Object.entries(settings)) {
      await this.prisma.platformSetting.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      });
    }

    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'SETTINGS_UPDATED',
        targetType: 'PlatformSetting',
        targetId: 'all',
        metadata: settings,
      },
    });

    return { updated: Object.keys(settings).length };
  }

  // ─── Categories ───────────────────────────────────────────────────────────

  async createCategory(adminId: string, data: { name: string; slug: string; slaHours?: number; attributes?: any }) {
    const category = await this.prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        slaHours: data.slaHours ?? 24,
        attributes: data.attributes ?? {},
      },
    });

    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'CATEGORY_CREATED',
        targetType: 'Category',
        targetId: category.id,
      },
    });

    return category;
  }

  async updateCategory(
    adminId: string,
    categoryId: string,
    data: { name?: string; slug?: string; slaHours?: number },
  ) {
    const category = await this.prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) throw new NotFoundException('Category not found');

    const updated = await this.prisma.category.update({
      where: { id: categoryId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.slug && { slug: data.slug }),
        ...(data.slaHours !== undefined && { slaHours: data.slaHours }),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'CATEGORY_UPDATED',
        targetType: 'Category',
        targetId: categoryId,
      },
    });

    return updated;
  }

  // ─── Disputes ─────────────────────────────────────────────────────────────

  async listDisputes(page = 1, pageSize = 50) {
    const skip = (page - 1) * pageSize;
    const [data, total] = await Promise.all([
      this.prisma.dispute.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          openedBy: { select: { name: true, email: true } },
          subOrder: { include: { vendor: { select: { businessName: true } } } },
        },
      }),
      this.prisma.dispute.count(),
    ]);
    return { data, total, page, pageSize };
  }

  async getDisputeMessages(disputeId: string) {
    return this.prisma.disputeMessage.findMany({
      where: { disputeId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async sendDisputeMessage(adminId: string, disputeId: string, body: string) {
    // Update dispute status to IN_PROGRESS if it was OPEN
    await this.prisma.dispute.updateMany({
      where: { id: disputeId, status: 'OPEN' },
      data: { status: 'UNDER_REVIEW' },
    });

    return this.prisma.disputeMessage.create({
      data: {
        disputeId,
        senderId: adminId,
        senderRole: 'ADMIN',
        body,
      },
    });
  }

  async resolveDispute(adminId: string, disputeId: string, resolution: string) {
    const dispute = await this.prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'DISPUTE_RESOLVED',
        targetType: 'Dispute',
        targetId: disputeId,
        metadata: { resolution },
      },
    });

    return dispute;
  }
}
