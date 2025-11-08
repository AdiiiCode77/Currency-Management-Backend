import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsUUID, IsString } from 'class-validator';

export class CreateChqInwardEntryDto {
  @ApiProperty({ example: "2025-01-10" })
  @IsDateString()
  entryDate: string;

  @ApiProperty({ example: "2025-01-11" })
  @IsDateString()
  chqDate: string;

  @ApiProperty({ example: "2025-01-12" })
  @IsDateString()
  postingDate: string;

  @ApiProperty({ example: "uuid-from-account" })
  @IsUUID()
  fromAccountId: string;

  @ApiProperty({ example: "uuid-to-account" })
  @IsUUID()
  toAccountId: string;

  @ApiProperty({ example: 15000 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: "uuid-chq-bank-ref" })
  @IsUUID()
  chqBankRefId: string;

  @ApiProperty({ example: "CHQ-556677" })
  @IsString()
  chqNumber: string;
}
