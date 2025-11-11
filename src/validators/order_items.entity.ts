import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsInt,
} from 'class-validator';
import { OrderItemStatus } from 'src/order_items/order_items.enum';

export class CreateOrderItemDto {
  @IsInt()
  @IsPositive()
  orderId: number;

  @IsInt()
  @IsPositive()
  productId: number;

  @IsNumber()
  @IsPositive()
  quantity: number; // endi 1.2 kabi kasr son ham bo‘ladi

  @IsNumber()
  @IsPositive()
  price: number;

  @IsOptional()
  @IsEnum(OrderItemStatus)
  status?: OrderItemStatus;

  @IsOptional()
  @IsInt()
  @IsPositive()
  assignedTo?: number;

  @IsOptional()
  @IsBoolean()
  isPrinted?: boolean;
}

export class UpdateOrderItemDto {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  quantity?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;

  @IsOptional()
  @IsEnum(OrderItemStatus)
  status?: OrderItemStatus;

  @IsOptional()
  @IsInt()
  @IsPositive()
  assignedTo?: number;

  @IsOptional()
  @IsBoolean()
  isPrinted?: boolean;
}
