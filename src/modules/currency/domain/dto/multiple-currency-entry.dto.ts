import { Type } from 'class-transformer';
import { ValidateNested, IsArray } from 'class-validator';
import { CreateCurrencyEntryDto } from './create-currency-entry.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMultipleCurrencyEntryDto {
  @ApiProperty({
    type: [CreateCurrencyEntryDto],
    description: 'Array of currency entries to add',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCurrencyEntryDto)
  entries: CreateCurrencyEntryDto[];
}
