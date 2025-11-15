import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateSellingDto {
  @IsNotEmpty()
  date: string;

  @IsUUID()
  fromCurrencyId: string;

  @IsOptional()
  @IsString()
  sNo?: string;

  @IsNumber()
  avgRate: number;

  @IsOptional()
  @IsString()
  manualRef?: string;

  @IsUUID()
  customerAccountId: string;  

  @IsNumber()
  amountCurrency: number;

  @IsNumber()
  rate: number;

  @IsNumber()
  amountPkr: number;

  @IsNumber()
  margin: number;

  @IsNumber()
  pl: number;

  @IsOptional()
  @IsString()
  description?: string;
}
