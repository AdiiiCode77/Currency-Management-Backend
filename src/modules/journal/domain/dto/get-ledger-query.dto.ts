import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsUUID, IsEnum } from 'class-validator';

export class GetLedgerQueryDto {
  @ApiProperty({ description: 'Account ID to filter ledger', required: false })
  @IsOptional()
  @IsUUID()
  accountId?: string;

  @ApiProperty({ description: 'Start date (YYYY-MM-DD)', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: 'End date (YYYY-MM-DD)', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Entry type filter',
    enum: [
      'SALE',
      'PURCHASE',
      'JOURNAL',
      'BANK_PAYMENT',
      'BANK_RECEIPT',
      'CASH_PAYMENT',
      'CASH_RECEIPT',
      'CHQ_INWARD',
      'CHQ_OUTWARD',
      'CURRENCY_ENTRY',
      'CURRENCY_JOURNAL',
    ],
    required: false,
  })
  @IsOptional()
  @IsEnum([
    'SALE',
    'PURCHASE',
    'JOURNAL',
    'BANK_PAYMENT',
    'BANK_RECEIPT',
    'CASH_PAYMENT',
    'CASH_RECEIPT',
    'CHQ_INWARD',
    'CHQ_OUTWARD',
    'CURRENCY_ENTRY',
    'CURRENCY_JOURNAL',
  ])
  entryType?: string;
}

export class GetAccountBalanceDto {
  @ApiProperty({ description: 'Account ID' })
  @IsUUID()
  accountId: string;

  @ApiProperty({ description: 'Calculate balance up to this date (YYYY-MM-DD)', required: false })
  @IsOptional()
  @IsDateString()
  upToDate?: string;
}
