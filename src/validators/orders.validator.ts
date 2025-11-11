// src/orders/dto/create-order.dto.ts
import { IsBoolean, IsEnum, IsInt, IsOptional, IsPositive } from 'class-validator';
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
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}