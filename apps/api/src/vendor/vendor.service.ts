import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole, VendorStatus } from 'database';
import { CreateVendorDto, ReviewVendorDto } from './dto';

@Injectable()
export class VendorService {
  constructor(private prisma: PrismaService) {}

  async applyAsVendor(userId: string, dto: CreateVendorDto) {
    const existing = await this.prisma.vendor.findUnique({ where: { userId } });
    if (existing) throw new ConflictException('Vendor application already exists');

    await this.prisma.user.update({
      where: { id: userId },
      data: { role: UserRole.VENDOR },
    });

    return this.prisma.vendor.create({
      data: {
        userId,
        businessName: dto.businessName,
        gstNumber: dto.gstNumber,
        panNumber: dto.panNumber,
      },
    });
  }

  async getMyVendorProfile(userId: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId },
      include: {
        kycDocuments: true,
        _count: { select: { products: true, subOrders: true, strikes: true } },
      },
    });
    if (!vendor) throw new NotFoundException('Vendor profile not found');
    return vendor;
  }

  async uploadKycDocument(userId: string, type: string, url: string) {
    const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) throw new NotFoundException('Vendor profile not found');

    return this.prisma.kycDocument.create({
      data: { vendorId: vendor.id, type, url },
    });
  }

  // ─── Admin Actions ──────────────────────────────────────────────────────────

  async listPendingApplications(page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;
    const [data, total] = await Promise.all([
      this.prisma.vendor.findMany({
        where: { status: VendorStatus.PENDING },
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          kycDocuments: true,
        },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.vendor.count({ where: { status: VendorStatus.PENDING } }),
    ]);
    return { data, total, page, pageSize };
  }

  async reviewApplication(adminId: string, vendorId: string, dto: ReviewVendorDto) {
    const vendor = await this.prisma.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor) throw new NotFoundException('Vendor not found');

    const statusMap: Record<string, VendorStatus> = {
      APPROVED: VendorStatus.APPROVED,
      REJECTED: VendorStatus.REJECTED,
      SUSPENDED: VendorStatus.SUSPENDED,
      TERMINATED: VendorStatus.TERMINATED,
    };

    const newStatus = statusMap[dto.action];
    if (!newStatus) throw new ForbiddenException('Invalid action');

    const updated = await this.prisma.vendor.update({
      where: { id: vendorId },
      data: { status: newStatus },
    });

    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: `VENDOR_${dto.action}`,
        targetType: 'Vendor',
        targetId: vendorId,
        metadata: { note: dto.note },
      },
    });

    return updated;
  }

  async getVendorById(id: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        kycDocuments: true,
        strikes: { orderBy: { createdAt: 'desc' }, take: 10 },
        _count: { select: { products: true, subOrders: true } },
      },
    });
    if (!vendor) throw new NotFoundException('Vendor not found');
    return vendor;
  }

  async getVendorAnalytics(userId: string) {
    const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) throw new NotFoundException('Vendor profile not found');

    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [ordersToday, ordersThisWeek, subOrders] = await Promise.all([
      this.prisma.subOrder.count({
        where: { vendorId: vendor.id, createdAt: { gte: startOfDay } },
      }),
      this.prisma.subOrder.count({
        where: { vendorId: vendor.id, createdAt: { gte: startOfWeek } },
      }),
      this.prisma.subOrder.findMany({
        where: { vendorId: vendor.id },
        select: {
          status: true,
          createdAt: true,
          acceptedAt: true,
          items: { select: { unitPrice: true, quantity: true } },
        },
      }),
    ]);

    const accepted = subOrders.filter((o) => o.acceptedAt);
    const acceptanceRate = subOrders.length
      ? Math.round((accepted.length / subOrders.length) * 100)
      : 0;

    const avgAcceptanceMs = accepted.length
      ? accepted.reduce(
          (sum, o) => sum + (o.acceptedAt!.getTime() - o.createdAt.getTime()),
          0,
        ) / accepted.length
      : 0;

    const gmvThisMonth = subOrders
      .filter((o) => o.createdAt >= startOfMonth)
      .reduce(
        (sum, o) =>
          sum +
          o.items.reduce(
            (s, i) => s + Number(i.unitPrice) * i.quantity,
            0,
          ),
        0,
      );

    return {
      ordersToday,
      ordersThisWeek,
      gmvThisMonth,
      acceptanceRate,
      avgAcceptanceHours: Math.round(avgAcceptanceMs / (1000 * 60 * 60)),
    };
  }
}
