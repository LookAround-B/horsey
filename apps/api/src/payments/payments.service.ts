import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  /**
   * Create a Razorpay order for entry registration.
   */
  async createOrder(userId: string, dto: { amount: number; entryIds: string[] }) {
    const keyId = this.configService.get('RAZORPAY_KEY_ID');
    const keySecret = this.configService.get('RAZORPAY_KEY_SECRET');

    let razorpayOrderId: string;

    if (keyId && keyId !== '...') {
      const Razorpay = require('razorpay');
      const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

      const order = await razorpay.orders.create({
        amount: dto.amount, // in paise
        currency: 'INR',
        receipt: `horsey_${Date.now()}`,
      });
      razorpayOrderId = order.id;
    } else {
      // Dev mode
      razorpayOrderId = `order_dev_${Date.now()}`;
      this.logger.warn(`[DEV] Created mock Razorpay order: ${razorpayOrderId}`);
    }

    const payment = await this.prisma.payment.create({
      data: {
        userId,
        razorpayOrderId,
        amount: dto.amount,
        status: 'PENDING',
        metadata: { entryIds: dto.entryIds },
      },
    });

    // Link entries to payment
    if (dto.entryIds.length > 0) {
      await this.prisma.entry.updateMany({
        where: { id: { in: dto.entryIds } },
        data: { paymentId: payment.id },
      });
    }

    return {
      orderId: razorpayOrderId,
      paymentId: payment.id,
      amount: dto.amount,
      currency: 'INR',
      keyId: keyId || 'rzp_test_dev',
    };
  }

  /**
   * Verify Razorpay payment signature (webhook / frontend callback).
   */
  async verifyPayment(dto: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    const keySecret = this.configService.get('RAZORPAY_KEY_SECRET');

    if (keySecret && keySecret !== '...') {
      const body = dto.razorpayOrderId + '|' + dto.razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(body)
        .digest('hex');

      if (expectedSignature !== dto.razorpaySignature) {
        throw new BadRequestException('Invalid payment signature');
      }
    }

    const payment = await this.prisma.payment.update({
      where: { razorpayOrderId: dto.razorpayOrderId },
      data: {
        razorpayPaymentId: dto.razorpayPaymentId,
        razorpaySignature: dto.razorpaySignature,
        status: 'COMPLETED',
      },
    });

    // Update linked entries
    await this.prisma.entry.updateMany({
      where: { paymentId: payment.id },
      data: { paymentStatus: 'COMPLETED', status: 'CONFIRMED' },
    });

    return { verified: true, paymentId: payment.id };
  }
}
