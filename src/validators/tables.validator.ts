// src/tables/dto/create-table.dto.ts
import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateTableDto {
  @IsInt()
  @IsPositive()
  table_number: number;

  @IsString()
  @IsOptional()
  location: string;
}


export class UpdateTableDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  table_number?: number;

  @IsOptional()
  @IsString()
  location?: string;
}