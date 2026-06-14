// src/tables/dto/create-table.dto.ts
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';
import { TableStatus } from 'src/tables/table.enum';

export class CreateTableDto {
  @IsInt()
  @IsPositive()
  table_number: number;

  @IsString()
  @IsOptional()
  location: string;

    // 🔥 optional status
    @IsEnum(TableStatus)
    @IsOptional()
    status?: TableStatus;
}


export class UpdateTableDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  table_number?: number;

  @IsOptional()
  @IsString()
  location?: string;

    // 🔥 optional status
    @IsEnum(TableStatus)
    @IsOptional()
    status?: TableStatus;
}