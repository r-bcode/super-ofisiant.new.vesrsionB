import {  IsNotEmpty, IsString, Length } from "class-validator";

export class loginDto {
  @IsNotEmpty()
  @IsString()
  name?: string; 

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class PinLoginDto {
  @IsString()
  @Length(4, 4)
  pin: string;
}