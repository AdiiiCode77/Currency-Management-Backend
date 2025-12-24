import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsUUID, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AddCurrencyEntity } from 'src/modules/account/domain/entity/currency.entity';

export enum PaymentType {
  JV_PAYMENT = 'JV Payment',
  BANK_PAYMENT = 'Bank Payment',
  CASH_PAYMENT = 'Cash Payment',
}

export class CreateCurrencyJournalEntryDto {
  @ApiProperty({ description: 'Transaction date', example: '2025-11-09' })
  @IsDateString()
  date: string;

  @ApiProperty({ enum: PaymentType, description: 'Payment method' })
  @IsEnum(PaymentType)
  paymentType: PaymentType;

  @ApiProperty({ description: 'Customer Currency Account ID', example: 'uuid' })
  @IsUUID()
  DraccountId: string;

  @ApiProperty({ description: 'Customer Currency Account ID', example: 'uuid' })
  @IsUUID()
  CraccountId: string;

  @ApiProperty({ description: 'Amount of transaction', example: 500 })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Description / notes', example: 'Dirham transfer' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Reference currency ID from AddCurrencyEntity',
    example: '94b4fe9d-3c02-4b8a-9cd1-1df91b2a9f4c',
  })
  @IsUUID()
  currencyId: string;
}
