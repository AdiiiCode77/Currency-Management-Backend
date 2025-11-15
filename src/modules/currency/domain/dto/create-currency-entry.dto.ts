import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsUUID, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PaymentType {
  JV_PAYMENT = 'JV Payment',
  BANK_PAYMENT = 'Bank Payment',
  CASH_PAYMENT = 'Cash Payment',
}

export enum EntryType {
  JAMAM = 'JAMAM', // Credit
  BANAM = 'BANAM', // Debit
}

export class CreateCurrencyEntryDto {
  @ApiProperty({ description: 'Transaction date', example: '2025-11-09' })
  @IsDateString()
  date: string;

  @ApiProperty({ enum: PaymentType, description: 'Payment method' })
  @IsEnum(PaymentType)
  paymentType: PaymentType;

  @ApiProperty({ description: 'Customer Currency Account ID', example: 'uuid' })
  @IsUUID()
  accountId: string;

  @ApiProperty({ description: 'Amount of transaction', example: 500 })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Description / notes', example: 'Dirham transfer' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: EntryType, description: 'Credit or Debit (JAMAM/BANAM)' })
  @IsEnum(EntryType)
  entryType: EntryType;
}
