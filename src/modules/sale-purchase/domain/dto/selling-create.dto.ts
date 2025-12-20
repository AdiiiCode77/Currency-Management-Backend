import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateSellingDto {
  @ApiProperty({
    description: 'Selling date (ISO format)',
    example: '2025-12-20',
  })
  @IsNotEmpty()
  date: string;

  @ApiProperty({
    description: 'Source currency ID',
    example: '66a1b7a8-c3f1-4e0a-9a9a-1b1234567890',
  })
  @IsUUID()
  fromCurrencyId: string;

  @ApiPropertyOptional({
    description: 'System generated or manual serial number',
    example: 'SN-2025-001',
  })
  @IsOptional()
  @IsString()
  sNo?: string;

  @ApiProperty({
    description: 'Average buying rate of currency',
    example: 280.25,
  })
  @IsNumber()
  avgRate: number;

  @ApiPropertyOptional({
    description: 'Manual reference number',
    example: 'REF-88921',
  })
  @IsOptional()
  @IsString()
  manualRef?: string;

  @ApiProperty({
    description: 'Customer account ID',
    example: '77b2c9e1-9f3d-4a2b-8b1a-112233445566',
  })
  @IsUUID()
  customerAccountId: string;

  @ApiProperty({
    description: 'Amount of currency sold',
    example: 1000,
  })
  @IsNumber()
  amountCurrency: number;

  @ApiProperty({
    description: 'Selling rate per unit',
    example: 287.5,
  })
  @IsNumber()
  rate: number;

  @ApiProperty({
    description: 'Total PKR received',
    example: 287500,
  })
  @IsNumber()
  amountPkr: number;

  @ApiProperty({
    description: 'Profit margin percentage',
    example: 2.59,
  })
  @IsNumber()
  margin: number;

  @ApiProperty({
    description: 'Profit / Loss amount in PKR',
    example: 7265.44,
  })
  @IsNumber()
  pl: number;

  @ApiPropertyOptional({
    description: 'Additional notes or remarks',
    example: 'Selling done at peak market rate',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
