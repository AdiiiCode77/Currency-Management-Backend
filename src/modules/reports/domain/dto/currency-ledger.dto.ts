import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class GetCurrencyLedgerDto {
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
    example: 10, 
    required: false,
    default: 10 
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({ 
    description: 'Start date filter (YYYY-MM-DD)', 
    example: '2026-01-01', 
    required: false 
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiProperty({ 
    description: 'End date filter (YYYY-MM-DD)', 
    example: '2026-01-31', 
    required: false 
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}

export interface CurrencyLedgerEntry {
  id: string;
  transactionDate: string;
  entryType: string;
  referenceNumber: string;
  description: string;
  debit: number;
  credit: number;
  currencyAmount: number;
  exchangeRate: number;
  contraAccountName: string;
  runningBalance: number;
}

export interface CurrencyLedgerByDate {
  date: string;
  entries: CurrencyLedgerEntry[];
  totalDebit: number;
  totalCredit: number;
  closingBalance: number;
}

export interface CurrencyLedgerResponse {
  currencyId: string;
  currencyName: string;
  currencyCode: string;
  data: CurrencyLedgerByDate[];
  totalDirhamBalance: number;
  currentBalance: number;
  avgRate: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalRecords: number;
  };
}
