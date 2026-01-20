import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsNumber,
  IsString,
  IsUUID,
  IsDateString,
} from 'class-validator';

export class UpdateSellingDto {
  @ApiPropertyOptional({
    description: 'Selling date (ISO format)',
    example: '2025-12-20',
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({
    description: 'Source currency ID',
    example: '66a1b7a8-c3f1-4e0a-9a9a-1b1234567890',
  })
  @IsOptional()
  @IsUUID()
  fromCurrencyId?: string;

  @ApiPropertyOptional({
    description: 'System generated or manual serial number',
    example: 'SN-2025-001',
  })
  @IsOptional()
  @IsString()
  sNo?: string;

  @ApiPropertyOptional({
    description: 'Average buying rate of currency',
    example: 280.25,
  })
  @IsOptional()
  @IsNumber()
  avgRate?: number;

  @ApiPropertyOptional({
    description: 'Manual reference number',
    example: 'REF-88921',
  })
  @IsOptional()
  @IsString()
  manualRef?: string;

  @ApiPropertyOptional({
    description: 'Customer account ID',
    example: '77b2c9e1-9f3d-4a2b-8b1a-112233445566',
  })
  @IsOptional()
  @IsUUID()
  customerAccountId?: string;

  @ApiPropertyOptional({
    description: 'Amount in currency being sold',
    example: 1000,
  })
  @IsOptional()
  @IsNumber()
  amountCurrency?: number;

  @ApiPropertyOptional({
    description: 'Selling rate per unit of currency',
    example: 287.5,
  })
  @IsOptional()
  @IsNumber()
  rate?: number;

  @ApiPropertyOptional({
    description: 'Amount in PKR (should equal amountCurrency * rate)',
    example: 287500,
  })
  @IsOptional()
  @IsNumber()
  amountPkr?: number;

  @ApiPropertyOptional({
    description: 'Profit or Loss from this sale',
    example: 7250,
  })
  @IsOptional()
  @IsNumber()
  pl?: number;

  @ApiPropertyOptional({
    description: 'Profit margin percentage',
    example: 2.5,
  })
  @IsOptional()
  @IsNumber()
  margin?: number;

  @ApiPropertyOptional({
    description: 'Additional sale description',
    example: 'Currency exchange for travel',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
