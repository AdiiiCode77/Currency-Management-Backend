import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AccountType } from 'src/modules/account/domain/enums/account-type.enum';

export class CustomerCreateCurrencyAccountDto {
  @ApiProperty({
    enum: AccountType,
    description: 'Type of the account',
    example: AccountType.ASSET,
  })
  @IsEnum(AccountType)
  accountType: AccountType;

  @ApiProperty({ description: 'Name of the account', example: 'USD Account' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Additional account information', example: 'Customer balance account', required: false })
  @IsOptional()
  @IsString()
  accountInfo?: string;
}
