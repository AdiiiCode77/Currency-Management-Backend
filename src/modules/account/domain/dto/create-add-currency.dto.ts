import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAddCurrencyDto {
  @ApiProperty({ example: 'US Dollar' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'USD' })
  @IsNotEmpty()
  @IsString()
  code: string;
}
