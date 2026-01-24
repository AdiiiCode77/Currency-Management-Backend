import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  Min,
} from 'class-validator';
import { PaymentStatus } from '../entities/admin-payment.entity';

export class CreatePaymentDto {
  @IsNotEmpty({ message: 'Admin ID is required' })
  @IsString({ message: 'Admin ID must be a string' })
  admin_id: string;

  @IsNotEmpty({ message: 'Amount is required' })
  @IsNumber({}, { message: 'Amount must be a number' })
  @Min(0, { message: 'Amount must be greater than or equal to 0' })
  amount: number;

  @IsOptional()
  @IsEnum(PaymentStatus, { message: 'Invalid payment status' })
  status?: PaymentStatus;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Due date must be a valid date' })
  due_date?: string;
}
