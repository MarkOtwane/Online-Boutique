import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Min,
} from 'class-validator';

export enum PaymentMethod {
  MPESA = 'MPESA',
  CARD = 'CARD',
  CASH = 'CASH',
}

export class InitiatePaymentDto {
  @IsNumber()
  @Min(1)
  orderId: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsString()
  @IsPhoneNumber('KE') // Kenyan phone number format
  phoneNumber: string; // Required for M-Pesa

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number; // Optional, defaults to order total
}
