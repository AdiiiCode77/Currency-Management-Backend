import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBankAccountDto {
  @ApiProperty({ example: 'Habib Bank Limited' })
  @IsString()
  @IsNotEmpty()
  bankName: string;

  @ApiProperty({ example: 'Ali Khan' })
  @IsString()
  @IsNotEmpty()
  accountHolder: string;

  @ApiProperty({ example: 'PK12HABB0001234567890123' })
  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @ApiProperty({ example: '+923001234567' })
  @IsOptional()
  contact: string;

  @ApiProperty({ example: '123 Main Road, Lahore' })
  @IsOptional()
  address: string;

  @ApiProperty({ example: 'OLD-ACCT-9981' })
  @IsOptional()
  oldAccountId: string;
}
