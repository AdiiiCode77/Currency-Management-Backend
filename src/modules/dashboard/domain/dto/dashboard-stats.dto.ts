import { ApiProperty } from '@nestjs/swagger';

export class CardStatsDto {
  @ApiProperty({ example: 150000, description: 'Total revenue in PKR' })
  totalRevenue: number;

  @ApiProperty({ example: 25000, description: 'Total profit/loss in PKR' })
  totalProfit: number;

  @ApiProperty({ example: 45, description: 'Total transactions today' })
  todayTransactions: number;

  @ApiProperty({ example: 120, description: 'Total active customers' })
  activeCustomers: number;

  @ApiProperty({ example: 500000, description: 'Total currency stock value in PKR' })
  currencyStockValue: number;

  @ApiProperty({ example: 350000, description: 'Total bank balance in PKR' })
  totalBankBalance: number;

  @ApiProperty({ example: 85000, description: 'Today\'s sales in PKR' })
  todaySales: number;

  @ApiProperty({ example: 60000, description: 'Today\'s purchases in PKR' })
  todayPurchases: number;

  @ApiProperty({ example: 15.5, description: 'Profit margin percentage' })
  profitMargin: number;

  @ApiProperty({ example: 12, description: 'Pending cheque count' })
  pendingCheques: number;
}

export class DailySalesChartDataDto {
  @ApiProperty({ example: '2026-01-15', description: 'Date' })
  date: string;

  @ApiProperty({ example: 45000, description: 'Sales amount in PKR' })
  sales: number;

  @ApiProperty({ example: 32000, description: 'Purchase amount in PKR' })
  purchases: number;

  @ApiProperty({ example: 13000, description: 'Profit in PKR' })
  profit: number;
}

export class CurrencyDistributionDto {
  @ApiProperty({ example: 'USD', description: 'Currency code' })
  currencyCode: string;

  @ApiProperty({ example: 'US Dollar', description: 'Currency name' })
  currencyName: string;

  @ApiProperty({ example: 5000, description: 'Total amount' })
  amount: number;

  @ApiProperty({ example: 450000, description: 'Value in PKR' })
  valuePkr: number;

  @ApiProperty({ example: 25.5, description: 'Percentage of total' })
  percentage: number;
}

export class TopCustomerDto {
  @ApiProperty({ example: 'uuid-123', description: 'Customer ID' })
  customerId: string;

  @ApiProperty({ example: 'John Doe', description: 'Customer name' })
  customerName: string;

  @ApiProperty({ example: 150000, description: 'Total transaction value in PKR' })
  totalValue: number;

  @ApiProperty({ example: 15, description: 'Transaction count' })
  transactionCount: number;
}

export class MonthlyRevenueDto {
  @ApiProperty({ example: 'January', description: 'Month name' })
  month: string;

  @ApiProperty({ example: 450000, description: 'Revenue in PKR' })
  revenue: number;

  @ApiProperty({ example: 320000, description: 'Cost in PKR' })
  cost: number;

  @ApiProperty({ example: 130000, description: 'Profit in PKR' })
  profit: number;
}

export class TransactionTypeDistributionDto {
  @ApiProperty({ example: 'SALE', description: 'Transaction type' })
  type: string;

  @ApiProperty({ example: 45, description: 'Count of transactions' })
  count: number;

  @ApiProperty({ example: 550000, description: 'Total value in PKR' })
  totalValue: number;

  @ApiProperty({ example: 35.5, description: 'Percentage of total' })
  percentage: number;
}

export class ProfitTrendDto {
  @ApiProperty({ example: '2026-01-15', description: 'Date' })
  date: string;

  @ApiProperty({ example: 15000, description: 'Profit in PKR' })
  profit: number;

  @ApiProperty({ example: 12000, description: 'Target profit in PKR' })
  target: number;
}

export class DashboardGraphsDto {
  @ApiProperty({ type: [DailySalesChartDataDto], description: 'Daily sales vs purchases data (last 30 days)' })
  dailySalesChart: DailySalesChartDataDto[];

  @ApiProperty({ type: [CurrencyDistributionDto], description: 'Currency-wise sales distribution' })
  currencyDistribution: CurrencyDistributionDto[];

  @ApiProperty({ type: [TopCustomerDto], description: 'Top 10 customers by transaction volume' })
  topCustomers: TopCustomerDto[];

  @ApiProperty({ type: [MonthlyRevenueDto], description: 'Monthly revenue comparison (last 12 months)' })
  monthlyRevenue: MonthlyRevenueDto[];

  @ApiProperty({ type: [TransactionTypeDistributionDto], description: 'Transaction type distribution' })
  transactionTypeDistribution: TransactionTypeDistributionDto[];

  @ApiProperty({ type: [ProfitTrendDto], description: 'Profit/loss trend (last 30 days)' })
  profitTrend: ProfitTrendDto[];
}

export class DashboardStatsResponseDto {
  @ApiProperty({ type: CardStatsDto, description: 'Card statistics for dashboard' })
  cardStats: CardStatsDto;

  @ApiProperty({ type: DashboardGraphsDto, description: 'Graph data for dashboard charts' })
  graphs: DashboardGraphsDto;

  @ApiProperty({ example: '2026-01-22T10:30:00.000Z', description: 'Timestamp of data generation' })
  timestamp: Date;
}
