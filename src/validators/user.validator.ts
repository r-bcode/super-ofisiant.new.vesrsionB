// src/users/dto/update-user.dto.ts
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from 'src/users/user.enum';

export class CreateUserDto{
    @IsString()
    @IsNotEmpty()
    name?: string

    @IsString()
    @IsNotEmpty()
    password?: string

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsString()
  @IsNotEmpty()
  pin?: string;

    
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  pin?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
