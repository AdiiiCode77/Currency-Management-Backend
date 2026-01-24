import { IsOptional, IsString, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export enum PaymentStatusFilter {
  ALL = 'all',
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
}

export class DashboardStatsDto {
  @IsOptional()
  @IsString()
  month?: string; // Format: YYYY-MM

  @IsOptional()
  @IsString()
  year?: string; // Format: YYYY

  @IsOptional()
  @IsEnum(PaymentStatusFilter)
  status?: PaymentStatusFilter;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number;
}
