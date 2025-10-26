import { IsNotEmpty, IsString, IsUUID, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCurrencyAccountDto {
  @ApiProperty({ example: 'Main USD Account' })
  @IsNotEmpty()
  @IsString()
  currencyAccountName: string;

  @ApiProperty({ example: 'SPC001' })
  @IsNotEmpty()
  @IsString()
  salePurchaseCode: string;

  @ApiProperty({ example: 'Multiple', enum: ['Multiple', 'Divide'] })
  @IsNotEmpty()
  @IsIn(['Multiple', 'Divide'])
  formulaType: string;

  @ApiProperty({ example: 'uuid-of-selected-currency' })
  @IsNotEmpty()
  @IsUUID()
  currencyId: string;
}
