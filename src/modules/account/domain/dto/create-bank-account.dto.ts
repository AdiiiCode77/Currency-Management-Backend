import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

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
  @IsString()
  @IsNotEmpty()
  contact: string;

  @ApiProperty({ example: '123 Main Road, Lahore' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'OLD-ACCT-9981' })
  @IsString()
  @IsNotEmpty()
  oldAccountId: string;
}
