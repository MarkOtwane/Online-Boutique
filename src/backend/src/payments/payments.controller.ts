/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InitiatePaymentDto } from './initiate-payment.dto';
import { PaymentCallbackDto } from './payment-callback.dto';
import { PaymentsService } from './payments.service';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
    role: string;
  };
}

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initiate')
  @UseGuards(JwtAuthGuard)
  async initiatePayment(
    @Body(new ValidationPipe()) initiatePaymentDto: InitiatePaymentDto,
    @Request() req: AuthenticatedRequest,
  ) {
    try {
      const userId = req.user.id;
      return await this.paymentsService.initiatePayment(
        initiatePaymentDto,
        userId,
      );
    } catch (error: any) {
      console.error('Payment initiation error:', error);
      throw new BadRequestException(
        error.message || 'Failed to initiate payment',
      );
    }
  }

  @Post('callback')
  async handlePaymentCallback(
    @Body(new ValidationPipe()) callbackDto: PaymentCallbackDto,
  ) {
    try {
      return await this.paymentsService.handlePaymentCallback(callbackDto);
    } catch (error: any) {
      console.error('Payment callback error:', error);
      throw new BadRequestException(
        error.message || 'Failed to process payment callback',
      );
    }
  }

  @Post('status')
  @UseGuards(JwtAuthGuard)
  async checkPaymentStatus(
    @Body(new ValidationPipe()) body: { orderId: number },
    @Request() req: AuthenticatedRequest,
  ) {
    try {
      const userId = req.user.id;
      return await this.paymentsService.checkPaymentStatus(
        body.orderId,
        userId,
      );
    } catch (error: any) {
      console.error('Payment status check error:', error);
      throw new BadRequestException(
        error.message || 'Failed to check payment status',
      );
    }
  }
}
