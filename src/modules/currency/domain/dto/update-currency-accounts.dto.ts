import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AccountType } from '../../../account/domain/enums/account-type.enum';

export class UpdateCustomerCurrencyAccountDto {
  @ApiProperty({
    enum: AccountType,
    description: 'Type of the account',
    example: AccountType.ASSET,
  })
  @IsEnum(AccountType)
  @IsOptional()
  accountType: AccountType;

  @ApiProperty({ description: 'Name of the account', example: 'USD Account' })
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty({ description: 'Additional account information', example: 'Customer balance account', required: false })
  @IsOptional()
  @IsString()
  accountInfo?: string;
}
