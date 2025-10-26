import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { AccountType } from '../enums/account-type.enum';

export class CreateGeneralAccountDto {
  @ApiProperty({
    example: 'Cash',
    enum: AccountType,
    description: 'Select account type',
  })
  @IsEnum(AccountType)
  @IsNotEmpty()
  accountType: AccountType;

  @ApiProperty({ example: 'Petty Cash' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Used for daily small business transactions' })
  @IsString()
  @IsNotEmpty()
  accountInformation: string;
}
