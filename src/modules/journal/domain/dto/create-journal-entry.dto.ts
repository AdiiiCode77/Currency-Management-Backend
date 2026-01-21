import { IsNotEmpty, IsEnum, IsUUID, IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentType } from '../enums/payment-type.enum';
import { UUID } from 'crypto';

export class CreateJournalEntryDto {
  @ApiProperty({ example: '2025-10-24' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'JV Payment', enum: PaymentType })
  @IsEnum(PaymentType)
  paymentType: PaymentType;

  @ApiProperty({ example: 'uuid-of-credit-account' })
  @IsUUID()
  crAccountId: string;

  @ApiProperty({ example: 'uuid-of-debit-account' })
  @IsUUID()
  drAccountId: string;

  @ApiProperty({ example: 1500.75 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'Monthly rent payment' })
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'CHQ-00123' })
  @IsOptional()
  chqNo?: string;
}
