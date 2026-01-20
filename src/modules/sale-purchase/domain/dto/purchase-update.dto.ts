import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsNumber,
  IsString,
  IsUUID,
  IsDateString,
} from 'class-validator';

export class UpdatePurchaseDto {
  @ApiPropertyOptional({ example: '2025-01-10', description: 'Purchase date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ example: 'e9077282-19bf-4bc3-a37f-e5a4ac6904f5', description: 'Currency debit account ID' })
  @IsOptional()
  @IsUUID()
  currencyDrId?: string;

  @ApiPropertyOptional({ example: 'f7df5c89-daa1-48c7-9c1e-13e67e2791ed', description: 'Customer account ID' })
  @IsOptional()
  @IsUUID()
  customerAccountId?: string;

  @ApiPropertyOptional({ example: 'REF-12345' })
  @IsOptional()
  @IsString()
  manualRef?: string;

  @ApiPropertyOptional({ example: 100, description: 'Amount in currency' })
  @IsOptional()
  @IsNumber()
  amountCurrency?: number;

  @ApiPropertyOptional({ example: 280, description: 'Currency conversion rate' })
  @IsOptional()
  @IsNumber()
  rate?: number;

  @ApiPropertyOptional({ example: 28000, description: 'Amount in PKR' })
  @IsOptional()
  @IsNumber()
  amountPkr?: number;

  @ApiPropertyOptional({ example: 'Purchase description' })
  @IsOptional()
  @IsString()
  description?: string;
}
