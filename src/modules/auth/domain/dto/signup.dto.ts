//signup.dto.ts
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
  
} from 'class-validator';

// DTO for checking if phone number exists during signup
export class CheckPhoneDto {
  @IsString()
  phone: string;
}

export class SignupFirstStepDTO {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  otp_type: 'string';
}

export class CreateUserDto {
  sentOtp: string;

  @IsEmail()
  @IsOptional()
  email: string;

  @IsString()
  phone: string;

  @MinLength(6)
  @IsOptional()
  password: string;

  @IsNotEmpty()
  name: string;

  @IsUUID()
  @IsNotEmpty()
  @Transform(({ value }) => (value === '' ? null : value))
  user_type_id: string;

}
