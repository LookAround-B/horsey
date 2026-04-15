import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CurrentUser } from '../common/decorators';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-order')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a Razorpay payment order' })
  createOrder(
    @CurrentUser('id') userId: string,
    @Body() dto: { amount: number; entryIds: string[] },
  ) {
    return this.paymentsService.createOrder(userId, dto);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify Razorpay payment (webhook)' })
  verifyPayment(
    @Body()
    dto: {
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
    },
  ) {
    return this.paymentsService.verifyPayment(dto);
  }
}
