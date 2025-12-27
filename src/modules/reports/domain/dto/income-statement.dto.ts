// Income Statement DTO for Currency P&L Analysis
export interface CurrencyIncomeStatement {
  currencyId: string;
  currencyName: string;
  currencyCode: string;

  // Revenue from selling
  totalSalesCurrency: number; // units sold
  totalSalesPkr: number; // PKR value of sales
  averageSaleRate: number; // average selling rate

  // Cost from purchases
  totalPurchaseCurrency: number; // units purchased
  totalPurchasePkr: number; // PKR value of purchases
  averagePurchaseRate: number; // average purchase rate

  // Stock values
  currentStockCurrency: number; // current inventory units
  currentStockValuePkr: number; // PKR value of current stock
  currentStockRate: number; // current rate

  // P&L Calculations
  grossProfit: number; // total sales PKR - total purchase PKR
  grossProfitMargin: number; // (gross profit / total sales) * 100
  
  netProfit: number; // gross profit (for currency, same as gross)
  netProfitMargin: number; // (net profit / total sales) * 100

  // Statistics
  totalSalesTransactions: number;
  totalPurchaseTransactions: number;
  lastTransactionDate: Date | null;
}

export interface CurrencyIncomeStatementSummary {
  totalRevenuePkr: number;
  totalCostPkr: number;
  totalGrossProfitPkr: number;
  totalNetProfitPkr: number;
  
  overallGrossMargin: number; // (total gross profit / total revenue) * 100
  overallNetMargin: number; // (total net profit / total revenue) * 100

  totalCurrencies: number;
  totalSalesTransactions: number;
  totalPurchaseTransactions: number;
  
  dateRange?: {
    from: Date;
    to: Date;
  };
  timestamp: Date;
}

export interface CurrencyIncomeStatementResponse {
  currencies: CurrencyIncomeStatement[];
  summary: CurrencyIncomeStatementSummary;
}
