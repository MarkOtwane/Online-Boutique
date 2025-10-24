import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InitiatePaymentDto, PaymentMethod } from './initiate-payment.dto';
import { PaymentCallbackDto } from './payment-callback.dto';
import axios from 'axios';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async initiatePayment(initiatePaymentDto: InitiatePaymentDto, userId: number) {
    // Find the order
    const order = await this.prisma.order.findFirst({
      where: {
        id: initiatePaymentDto.orderId,
        userId: userId,
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.paymentStatus !== 'PENDING') {
      throw new BadRequestException('Order is not in pending status');
    }

    const amount = initiatePaymentDto.amount || order.total;

    if (initiatePaymentDto.paymentMethod === PaymentMethod.MPESA) {
      return await this.initiateMpesaPayment(order, initiatePaymentDto.phoneNumber, amount);
    }

    throw new BadRequestException('Unsupported payment method');
  }

  private async initiateMpesaPayment(order: any, phoneNumber: string, amount: number) {
    // M-Pesa API integration
    const mpesaConfig = {
      consumerKey: process.env.MPESA_CONSUMER_KEY,
      consumerSecret: process.env.MPESA_CONSUMER_SECRET,
      shortcode: process.env.MPESA_SHORTCODE,
      passkey: process.env.MPESA_PASSKEY,
      baseUrl: process.env.MPESA_BASE_URL || 'https://sandbox.safaricom.co.ke',
    };

    // Get access token
    const auth = Buffer.from(`${mpesaConfig.consumerKey}:${mpesaConfig.consumerSecret}`).toString('base64');
    const tokenResponse = await axios.get(
      `${mpesaConfig.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Format phone number (ensure it starts with 254)
    const formattedPhone = phoneNumber.startsWith('0')
      ? `254${phoneNumber.slice(1)}`
      : phoneNumber.startsWith('+254')
      ? phoneNumber.slice(1)
      : phoneNumber;

    // Generate timestamp and password
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = Buffer.from(
      `${mpesaConfig.shortcode}${mpesaConfig.passkey}${timestamp}`
    ).toString('base64');

    // STK Push request
    const stkPushData = {
      BusinessShortCode: mpesaConfig.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.floor(amount),
      PartyA: formattedPhone,
      PartyB: mpesaConfig.shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: `${process.env.BACKEND_URL}/payments/callback`,
      AccountReference: `Order-${order.id}`,
      TransactionDesc: `Payment for order ${order.id}`,
    };

    const response = await axios.post(
      `${mpesaConfig.baseUrl}/mpesa/stkpush/v1/processrequest`,
      stkPushData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.ResponseCode === '0') {
      // Update order with payment details
      await this.prisma.order.update({
        where: { id: order.id },
        data: {
          paymentMethod: 'MPESA',
          phoneNumber: formattedPhone,
          paymentAmount: amount,
          checkoutRequestId: response.data.CheckoutRequestID,
        },
      });

      return {
        success: true,
        message: 'STK Push sent successfully',
        checkoutRequestId: response.data.CheckoutRequestID,
        responseCode: response.data.ResponseCode,
      };
    }

    throw new BadRequestException(response.data.CustomerMessage || 'Failed to initiate payment');
  }

  async handlePaymentCallback(callbackDto: PaymentCallbackDto) {
    console.log('Payment callback received:', callbackDto);

    // Find order by checkout request ID first (more reliable)
    let order = await this.prisma.order.findFirst({
      where: { checkoutRequestId: callbackDto.CheckoutRequestID },
    });

    // Fallback to transaction ID if checkout request ID not found
    if (!order) {
      order = await this.prisma.order.findFirst({
        where: { transactionId: callbackDto.TransactionId },
      });
    }

    if (!order) {
      throw new NotFoundException('Order not found for this transaction');
    }

    let paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';

    switch (callbackDto.ResponseCode) {
      case '0':
        paymentStatus = 'PAID';
        break;
      case '1032':
        paymentStatus = 'CANCELLED';
        break;
      default:
        paymentStatus = 'FAILED';
    }

    // Update order status
    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus,
        transactionId: callbackDto.TransactionId,
        paymentDate: paymentStatus === 'PAID' ? new Date() : null,
      },
    });

    return {
      success: true,
      message: 'Payment status updated successfully',
      orderId: order.id,
      status: paymentStatus,
    };
  }

  async checkPaymentStatus(orderId: number, userId: number) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId: userId,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      orderId: order.id,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      transactionId: order.transactionId,
      paymentDate: order.paymentDate,
    };
  }
}
