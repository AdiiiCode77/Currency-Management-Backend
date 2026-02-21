import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, IsDateString, IsEnum, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

export class GetAccountLedgerDto {
  @ApiProperty({ 
    description: 'Page number for pagination', 
    example: 1, 
    required: false,
    default: 1 
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ 
    description: 'Number of items per page', 
    example: 50, 
    required: false,
    default: 50 
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 50;

  @ApiProperty({ 
    description: 'Start date filter (YYYY-MM-DD)', 
    example: '2026-01-01', 
    required: false 
  })
  @IsOptional()
  @ValidateIf((o) => o.dateFrom !== '')
  @IsDateString()
  dateFrom?: string;

  @ApiProperty({ 
    description: 'End date filter (YYYY-MM-DD)', 
    example: '2026-01-31', 
    required: false 
  })
  @IsOptional()
  @ValidateIf((o) => o.dateTo !== '')
  @IsDateString()
  dateTo?: string;
}

export interface AccountLedgerEntry {
  date: string;
  number: string;
  paymentType: string;
  narration: string;
  debit: number;
  credit: number;
  balance: number;
  referenceNumber?: string;
}

export interface AccountLedgerTotals {
  totalCredit: number;
  totalDebit: number;
  totalChqInward: number;
  totalChqOutward: number;
  balance: number;
  total: number;
}

export interface AccountLedgerResponse {
  accountId: string;
  accountName: string;
  accountType: 'CUSTOMER' | 'BANK' | 'CURRENCY' | 'GENERAL';
  entries: AccountLedgerEntry[];
  totals: AccountLedgerTotals;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalRecords: number;
  };
}
