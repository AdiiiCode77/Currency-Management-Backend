import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreatePurchaseDto {
  @IsNotEmpty()
  date: string;

  @IsUUID()
  currencyDrId: string;

  @IsUUID()
  customerAccountId: string;

  @IsOptional()
  @IsString()
  manualRef?: string;

  @IsNumber()
  amountCurrency: number;

  @IsNumber()
  rate: number;

  @IsNumber()
  amountPkr: number;

  @IsOptional()
  @IsString()
  description?: string;

}
