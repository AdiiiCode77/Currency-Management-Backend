import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UserProfileDTO {
  @IsEmail()
  @IsOptional()
  email: string;
  @IsString()
  @IsOptional()
  phone: string;
  @IsString()
  @IsOptional()
  name: string;
}
