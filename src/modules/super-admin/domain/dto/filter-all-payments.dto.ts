import { IsOptional, IsString, IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentStatus } from '../entities/admin-payment.entity';

export class FilterAllPaymentsDto {
  @IsOptional()
  @IsString()
  search?: string; // Search by transaction_id

  @IsOptional()
  @IsString()
  admin_name?: string; // Filter by admin name

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus; // Filter by payment status

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;
}
