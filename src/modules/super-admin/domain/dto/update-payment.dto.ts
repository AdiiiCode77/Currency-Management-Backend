import {
  IsEnum,
  IsOptional,
  IsNumber,
  IsString,
  IsDateString,
  Min,
} from 'class-validator';
import { PaymentStatus } from '../entities/admin-payment.entity';

export class UpdatePaymentDto {
  @IsOptional()
  @IsNumber({}, { message: 'Amount must be a number' })
  @Min(0, { message: 'Amount must be greater than or equal to 0' })
  amount?: number;

  @IsOptional()
  @IsEnum(PaymentStatus, { message: 'Invalid payment status' })
  status?: PaymentStatus;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Due date must be a valid date' })
  due_date?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Paid date must be a valid date' })
  paid_date?: string;
}
