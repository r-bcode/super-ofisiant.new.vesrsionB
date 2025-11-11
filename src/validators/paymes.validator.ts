// src/payments/dto/create-payment.dto.ts
import {
  IsEnum,
  IsNumber,
  IsPositive,
  IsInt,
  IsOptional,
  Min,
} from 'class-validator';
import { PaymentType } from 'src/payments/payments.enum';

export class CreatePaymentDto {
  @IsInt()
  orderId: number;

  @IsInt()
  paidBy: number;

  @IsNumber()
  @IsPositive()
  amount: number;

@IsInt()
@Min(0) // bu joyda 0 dan kichik bo‘lishiga ruxsat yo‘q, lekin 0 bo‘lishi mumkin
serviceFee: number;

  @IsNumber()
  @IsPositive()
  total: number;

  @IsEnum(PaymentType)
  paymentType: PaymentType;
}


export class UpdatePaymentDto {
  @IsOptional()
  @IsInt()
  orderId?: number;

  @IsOptional()
  @IsInt()
  paidBy?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number;

  @IsOptional()
  @IsInt()
@Min(0) 
  serviceFee?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  total?: number;

  @IsOptional()
  @IsEnum(PaymentType)
  paymentType?: PaymentType;
}