import { IsNotEmpty, IsString, IsUUID, IsIn, IsOptional, IsNumber } from 'class-validator';
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

  @ApiProperty({
    example: 39.78,
    required: false,
    nullable: true,
  })
  @IsNumber({}, { message: 'Price must be a valid number' })
  price?: number;
}
