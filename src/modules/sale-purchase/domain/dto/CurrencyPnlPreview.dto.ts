import { ApiProperty } from '@nestjs/swagger';

export class CurrencyPnlPreviewDto {
  @ApiProperty({
    description: 'Currency ID for which PnL preview is required',
    example: '66a1b7a8c3f1e0a9a9a1b123',
  })
  currencyId: string;

  @ApiProperty({
    description: 'Amount of currency to sell',
    example: 1000,
  })
  amountCurrency: number;

  @ApiProperty({
    description: 'Selling rate per unit of currency in PKR',
    example: 287.5,
  })
  sellingRate: number;
}
