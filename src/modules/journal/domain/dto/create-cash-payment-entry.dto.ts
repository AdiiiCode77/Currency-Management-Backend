import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCashPaymentEntryDto {
  @ApiProperty({ example: '2025-10-26', description: 'Date of the transaction' })
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: 'cr-account-id', description: 'Credit Account (Jama) ID' })
  @IsNotEmpty()
  crAccountId: string;

  @ApiProperty({ example: 'dr-account-id', description: 'Debit Account (Banam) ID' })
  @IsNotEmpty()
  drAccountId: string;

  @ApiProperty({ example: 7500, description: 'Transaction Amount' })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'Payment for office supplies', description: 'Description of the transaction' })
  @IsString()
  @IsNotEmpty()
  description: string;
}
