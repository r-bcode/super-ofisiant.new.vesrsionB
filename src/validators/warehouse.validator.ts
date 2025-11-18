import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, Min } from 'class-validator';

export class CreateWarehouseDto {
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  productId: number; // Ombordagi mahsulot ID-si

  @IsNumber()
  @Min(0)
  @IsOptional()
  quantity?: number = 0; // Omborda mavjud miqdor

  @IsNumber()
  @Min(0)
  @IsOptional()
  totalSpent?: number = 0; // Mahsulotga sarflangan jami summa

  @IsNumber()
  @Min(0)
  @IsOptional()
  minThreshold?: number = 0; // Minimal ogohlantirish chegarasi


}


export class UpdateWarehouseDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  productId?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalSpent?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minThreshold?: number = 0;


}