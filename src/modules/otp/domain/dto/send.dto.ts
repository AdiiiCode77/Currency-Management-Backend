import { IsEmail, IsOptional, IsString } from 'class-validator';

export class SendOtpDto {
  @IsEmail()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  phone: string;
}
