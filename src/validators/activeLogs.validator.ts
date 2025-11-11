// src/activity-log/dto/create-activity-log.dto.ts
import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateActivityLogDto {
  @IsInt()
  @IsPositive()
  userId: number;

  @IsString()
  @IsNotEmpty()
  action: string; // create, update, delete

  @IsString()
  @IsNotEmpty()
  targetTable: string; // misol: 'products', 'orders'

  @IsInt()
  @IsPositive()
  targetId: number;

  @IsOptional()
  @IsString()
  description?: string;
}
