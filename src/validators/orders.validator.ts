// src/orders/dto/create-order.dto.ts
import { IsBoolean, IsEnum, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';
import { OrderStatus } from 'src/orders/orders.enum';

export class CreateOrderDto {
  @IsInt()
  @IsPositive()
  userId: number;

  @IsInt()
  @IsPositive()
  tableId: number;

  @IsBoolean()
  @IsOptional()
  isTakeaway?: boolean;

  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @IsOptional()
  @IsString()
  comment?: string;
}


export class UpdateOrderDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  userId?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  tableId?: number;

  @IsOptional()
  @IsBoolean()
  isTakeaway?: boolean;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}