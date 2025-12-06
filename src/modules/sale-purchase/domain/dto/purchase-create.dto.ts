import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePurchaseDto {
  @ApiProperty({ example: '2025-01-10', description: 'Purchase date (YYYY-MM-DD)' })
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: 'e9077282-19bf-4bc3-a37f-e5a4ac6904f5', description: 'Currency debit account ID' })
  @IsUUID()
  currencyDrId: string;

  @ApiProperty({ example: 'f7df5c89-daa1-48c7-9c1e-13e67e2791ed', description: 'Customer account ID' })
  @IsUUID()
  customerAccountId: string;

  @ApiProperty({ example: 'REF-12345', required: false })
  @IsOptional()
  @IsString()
  manualRef?: string;

  @ApiProperty({ example: 100, description: 'Amount in currency' })
  @IsNumber()
  amountCurrency: number;

  @ApiProperty({ example: 280, description: 'Currency conversion rate' })
  @IsNumber()
  rate: number;

  @ApiProperty({ example: 28000, description: 'Amount in PKR' })
  @IsNumber()
  amountPkr: number;

  @ApiProperty({ example: 'Purchase description', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
