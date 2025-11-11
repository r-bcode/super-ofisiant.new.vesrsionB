import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { UnitType } from 'src/products/products.entity';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsInt()
  @IsPositive()
  categoryId: number;

  @IsEnum(UnitType)
  @IsOptional() // default: piece bo‘lishi mumkin
  unitType?: UnitType;

  @IsString()
  @IsOptional()
  image_url?: string;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  categoryId?: number;

  @IsOptional()
  @IsEnum(UnitType)
  unitType?: UnitType;

    @IsString()
    @IsOptional()
    image_url?: string;
}
