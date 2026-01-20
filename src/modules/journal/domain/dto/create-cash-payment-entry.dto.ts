import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCashPaymentEntryDto {
  @ApiProperty({ example: '2025-10-26', description: 'Date of the transaction' })
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: 'cr-account', description: 'Credit Account' })
  @IsNotEmpty()
  crAccount: string;

  @ApiProperty({ example: 'dr-account-id', description: 'Debit Account (Banam) ID' })
  @IsNotEmpty()
  drAccountId: string;

  @ApiProperty({ example: 7500, description: 'Transaction Amount' })
  @IsNumber()
  @IsOptional()
  amount: number;

  @ApiProperty({ example: 'Payment for office supplies', description: 'Description of the transaction' })
  @IsString()
  @IsOptional()
  description: string;
}
