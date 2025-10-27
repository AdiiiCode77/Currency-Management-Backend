import { IsUUID, IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBankPaymentEntryDto {
  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiProperty()
  @IsUUID()
  crAccountId: string;

  @ApiProperty()
  @IsUUID()
  drAccountId: string;

  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  chqNo?: string;
}
