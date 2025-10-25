import { IsOptional, IsString } from 'class-validator';

export class PaymentCallbackDto {
  @IsString()
  MerchantRequestID: string;

  @IsString()
  CheckoutRequestID: string;

  @IsString()
  ResponseCode: string;

  @IsString()
  ResponseDescription: string;

  @IsString()
  CustomerMessage: string;

  @IsOptional()
  @IsString()
  TransactionId?: string;
}
