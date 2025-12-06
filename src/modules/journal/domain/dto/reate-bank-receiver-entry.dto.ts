import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateBankReceiverEntryDto {
  @ApiProperty({ example: '2025-10-26', description: 'Date of transaction' })
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: '12345', description: 'Credit Account (Jama) ID' })
  @IsNotEmpty()
  crAccountId: string;

  @ApiProperty({ example: '67890', description: 'Debit Account (Banam) ID' })
  @IsNotEmpty()
  drAccountId: string;

  @ApiProperty({ example: 5000, description: 'Amount of transaction' })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'BR-009', description: 'Branch Code' })
  @IsString()
  @IsNotEmpty()
  branchCode: string;
}
