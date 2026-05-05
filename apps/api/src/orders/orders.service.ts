import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SlaService } from '../sla/sla.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SubOrderStatus, UserRole } from 'database';
import { AddToCartDto, CheckoutDto, DeclineSubOrderDto, ShipSubOrderDto } from './dto';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private slaService: SlaService,
    private notificationsService: NotificationsService,
  ) {}

  // ─── Cart ──────────────────────────────────────────────────────────────────

  async getCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            // We join product data via raw query helpers
          },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: { items: true },
      });
    }

    // Enrich items with product data
    const itemsWithProducts = await Promise.all(
      cart.items.map(async (item) => {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
          include: {
            vendor: { select: { id: true, businessName: true } },
            media: { where: { type: 'IMAGE' }, orderBy: { order: 'asc' }, take: 1 },
            category: { select: { slug: true } },
          },
        });
        const variant = item.variantId
          ? await this.prisma.productVariant.findUnique({ where: { id: item.variantId } })
          : null;
        return { ...item, product, variant };
      }),
    );

    return { ...cart, items: itemsWithProducts };
  }

  async addToCart(userId: string, dto: AddToCartDto) {
    let cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await this.prisma.cart.create({ data: { userId } });
    }

    const existing = await this.prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId: dto.productId, variantId: dto.variantId ?? null },
    });

    if (existing) {
      return this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + dto.quantity },
      });
    }

    return this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: dto.productId,
        variantId: dto.variantId,
        quantity: dto.quantity,
      },
    });
  }

  async removeFromCart(userId: string, itemId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new NotFoundException('Cart not found');

    const item = await this.prisma.cartItem.findUnique({ where: { id: itemId } });
    if (!item || item.cartId !== cart.id) throw new NotFoundException('Cart item not found');

    await this.prisma.cartItem.delete({ where: { id: itemId } });
    return { removed: true };
  }

  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) return;
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }

  // ─── Checkout ──────────────────────────────────────────────────────────────

  async checkout(userId: string, dto: CheckoutDto) {
    const cart = await this.getCart(userId);
    if (!cart.items.length) throw new BadRequestException('Cart is empty');

    // Group items by vendor
    const itemsByVendor = new Map<string, typeof cart.items>();
    for (const item of cart.items) {
      if (!item.product) continue;
      const vid = item.product.vendor.id;
      if (!itemsByVendor.has(vid)) itemsByVendor.set(vid, []);
      itemsByVendor.get(vid)!.push(item);
    }

    // Calculate total
    const totalAmount = cart.items.reduce((sum, item) => {
      if (!item.product) return sum;
      const price = item.variant?.price ?? item.product.price;
      return sum + Number(price) * item.quantity;
    }, 0);

    // Create order + sub-orders in a transaction
    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          buyerId: userId,
          totalAmount,
          paymentAuthId: `razorpay_auth_${Date.now()}`, // replace with real Razorpay call
        },
      });

      for (const subOrderDto of dto.subOrders) {
        const vendorItems = itemsByVendor.get(subOrderDto.vendorId) || [];
        if (!vendorItems.length) continue;

        const vendor = await tx.vendor.findUnique({
          where: { id: subOrderDto.vendorId },
          include: { user: true },
        });
        if (!vendor) continue;

        // Per-category SLA: check if horse purchase (use 72h SLA)
        const hasHorse = vendorItems.some((i) => i.product?.category?.slug === 'horses' || false);
        const slaHours = hasHorse ? 72 : 24;
        const acceptanceDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);

        const subOrder = await tx.subOrder.create({
          data: {
            orderId: newOrder.id,
            vendorId: subOrderDto.vendorId,
            addressId: subOrderDto.addressId,
            shippingMethod: subOrderDto.shippingMethod,
            notes: subOrderDto.notes,
            acceptanceDeadline,
            isHorsePurchase: hasHorse,
            buyerAttestation: subOrderDto.buyerAttestation ?? false,
            vetCheckRequested: subOrderDto.vetCheckRequested ?? false,
            escrowRequested: subOrderDto.escrowRequested ?? false,
            items: {
              create: vendorItems.map((item) => ({
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
                unitPrice: item.variant?.price ?? (item.product?.price ?? 0),
              })),
            },
          },
        });

        // Schedule SLA reminders via pg-boss
        await this.slaService.scheduleReminders(subOrder.id, acceptanceDeadline);

        // Notify vendor
        await this.notificationsService.notifyNewOrder(
          vendor.user.id,
          subOrder.id,
        );
      }

      // Clear cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
    });

    return this.prisma.order.findUnique({
      where: { id: order.id },
      include: { subOrders: { include: { items: true } } },
    });
  }

  // ─── Buyer Orders ──────────────────────────────────────────────────────────

  async getBuyerOrders(userId: string, page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;
    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { buyerId: userId },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          subOrders: {
            include: {
              vendor: { select: { businessName: true } },
              items: {
                include: {
                  product: {
                    include: {
                      media: { where: { type: 'IMAGE' }, take: 1 },
                    },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.order.count({ where: { buyerId: userId } }),
    ]);
    return { data, total, page, pageSize };
  }

  // ─── Vendor Order Management ──────────────────────────────────────────────

  async getVendorOrders(userId: string, page = 1, pageSize = 20) {
    const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) throw new ForbiddenException('Not a vendor');

    const skip = (page - 1) * pageSize;
    const [data, total] = await Promise.all([
      this.prisma.subOrder.findMany({
        where: { vendorId: vendor.id },
        skip,
        take: pageSize,
        orderBy: { acceptanceDeadline: 'asc' }, // urgency-first
        include: {
          order: {
            include: {
              buyer: { select: { id: true, name: true, email: true } },
            },
          },
          items: {
            include: {
              product: {
                include: {
                  media: { where: { type: 'IMAGE' }, take: 1 },
                },
              },
              variant: true,
            },
          },
          address: true,
        },
      }),
      this.prisma.subOrder.count({ where: { vendorId: vendor.id } }),
    ]);
    return { data, total, page, pageSize };
  }

  async acceptSubOrder(userId: string, subOrderId: string) {
    const subOrder = await this.getSubOrderForVendor(userId, subOrderId);

    if (subOrder.status !== SubOrderStatus.PENDING_ACCEPTANCE) {
      throw new BadRequestException('Sub-order is not pending acceptance');
    }

    if (new Date() > subOrder.acceptanceDeadline) {
      throw new BadRequestException('Acceptance window has expired');
    }

    const updated = await this.prisma.subOrder.update({
      where: { id: subOrderId },
      data: {
        status: SubOrderStatus.ACCEPTED,
        acceptedAt: new Date(),
        paymentCaptureId: `capture_${Date.now()}`, // replace with real Razorpay capture
      },
    });

    await this.slaService.cancelReminders(subOrderId);
    await this.notificationsService.notifyOrderAccepted(subOrder.order.buyerId, subOrderId);

    return updated;
  }

  async declineSubOrder(userId: string, subOrderId: string, dto: DeclineSubOrderDto) {
    const subOrder = await this.getSubOrderForVendor(userId, subOrderId);

    if (subOrder.status !== SubOrderStatus.PENDING_ACCEPTANCE) {
      throw new BadRequestException('Sub-order is not pending acceptance');
    }

    const updated = await this.prisma.subOrder.update({
      where: { id: subOrderId },
      data: {
        status: SubOrderStatus.DECLINED,
        declinedAt: new Date(),
        declineReason: dto.reason,
      },
    });

    await this.slaService.cancelReminders(subOrderId);
    await this.notificationsService.notifyOrderDeclined(
      subOrder.order.buyerId,
      subOrderId,
      dto.reason,
    );

    return updated;
  }

  async shipSubOrder(userId: string, subOrderId: string, dto: ShipSubOrderDto) {
    const subOrder = await this.getSubOrderForVendor(userId, subOrderId);

    if (subOrder.status !== SubOrderStatus.ACCEPTED) {
      throw new BadRequestException('Sub-order must be accepted before shipping');
    }

    const updated = await this.prisma.subOrder.update({
      where: { id: subOrderId },
      data: {
        status: SubOrderStatus.SHIPPED,
        shippedAt: new Date(),
        trackingNumber: dto.trackingNumber,
        shippingMethod: dto.shippingMethod,
      },
    });

    await this.notificationsService.notifyOrderShipped(
      subOrder.order.buyerId,
      subOrderId,
      dto.trackingNumber,
    );

    return updated;
  }

  async confirmDelivery(userId: string, subOrderId: string) {
    const subOrder = await this.getSubOrderForVendor(userId, subOrderId);

    if (subOrder.status !== SubOrderStatus.SHIPPED) {
      throw new BadRequestException('Sub-order must be shipped first');
    }

    const updated = await this.prisma.subOrder.update({
      where: { id: subOrderId },
      data: { status: SubOrderStatus.DELIVERED, deliveredAt: new Date() },
    });

    // Schedule payout net-7 from delivery
    const scheduledAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const subOrderWithItems = await this.prisma.subOrder.findUnique({
      where: { id: subOrderId },
      include: { items: true },
    });
    const amount = subOrderWithItems!.items.reduce(
      (sum, i) => sum + Number(i.unitPrice) * i.quantity,
      0,
    );
    await this.prisma.payout.create({
      data: {
        vendorId: subOrder.vendorId,
        subOrderId,
        amount,
        scheduledAt,
      },
    });

    await this.notificationsService.notifyOrderDelivered(
      subOrder.order.buyerId,
      subOrderId,
    );

    return updated;
  }

  // ─── Admin Overrides ──────────────────────────────────────────────────────

  async adminForceAccept(adminId: string, subOrderId: string) {
    const subOrder = await this.prisma.subOrder.findUnique({
      where: { id: subOrderId },
      include: { order: true },
    });
    if (!subOrder) throw new NotFoundException('Sub-order not found');

    const updated = await this.prisma.subOrder.update({
      where: { id: subOrderId },
      data: {
        status: SubOrderStatus.ACCEPTED,
        acceptedAt: new Date(),
        paymentCaptureId: `admin_force_${Date.now()}`,
      },
    });

    await this.slaService.cancelReminders(subOrderId);
    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'FORCE_ACCEPT',
        targetType: 'SubOrder',
        targetId: subOrderId,
      },
    });

    return updated;
  }

  async adminForceCancel(adminId: string, subOrderId: string) {
    const subOrder = await this.prisma.subOrder.findUnique({
      where: { id: subOrderId },
      include: { order: true },
    });
    if (!subOrder) throw new NotFoundException('Sub-order not found');

    const updated = await this.prisma.subOrder.update({
      where: { id: subOrderId },
      data: { status: SubOrderStatus.AUTO_CANCELLED },
    });

    await this.slaService.cancelReminders(subOrderId);
    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'FORCE_CANCEL',
        targetType: 'SubOrder',
        targetId: subOrderId,
      },
    });

    await this.notificationsService.notifyOrderCancelled(
      subOrder.order.buyerId,
      subOrderId,
    );

    return updated;
  }

  async getAdminOrderFeed(filters: {
    status?: string;
    vendorId?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 50;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.vendorId) where.vendorId = filters.vendorId;

    const [data, total] = await Promise.all([
      this.prisma.subOrder.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          vendor: { select: { id: true, businessName: true } },
          order: {
            include: { buyer: { select: { id: true, name: true, email: true } } },
          },
          items: { include: { product: { select: { title: true } } } },
        },
      }),
      this.prisma.subOrder.count({ where }),
    ]);

    return { data, total, page, pageSize };
  }

  async getSlaDashboard() {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    const [pending, nearingBreach, recentBreaches] = await Promise.all([
      this.prisma.subOrder.count({ where: { status: SubOrderStatus.PENDING_ACCEPTANCE } }),
      this.prisma.subOrder.count({
        where: {
          status: SubOrderStatus.PENDING_ACCEPTANCE,
          acceptanceDeadline: { lte: oneHourFromNow, gte: now },
        },
      }),
      this.prisma.subOrder.count({
        where: {
          status: SubOrderStatus.AUTO_CANCELLED,
          updatedAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    return { pending, nearingBreach, recentBreaches };
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private async getSubOrderForVendor(userId: string, subOrderId: string) {
    const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) throw new ForbiddenException('Not a vendor');

    const subOrder = await this.prisma.subOrder.findUnique({
      where: { id: subOrderId },
      include: { order: true, items: true },
    });
    if (!subOrder) throw new NotFoundException('Sub-order not found');
    if (subOrder.vendorId !== vendor.id) throw new ForbiddenException('Not your order');

    return subOrder;
  }
}
