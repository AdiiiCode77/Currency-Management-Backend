# Currency Income Statement - API Quick Reference

## Endpoint
```
GET /reports/currency-income-statement
```

## Authentication
- **Type**: Bearer Token (JWT)
- **Required**: Admin role
- **Header**: `Authorization: Bearer <token>`

## Query Parameters
| Parameter | Type | Required | Example |
|-----------|------|----------|---------|
| dateFrom | ISO 8601 Date | No | 2024-01-01 |
| dateTo | ISO 8601 Date | No | 2024-01-31 |

## Quick Examples

### 1. All-Time Statement
```bash
curl -H "Authorization: Bearer <token>" \
  https://your-api.com/reports/currency-income-statement
```

### 2. Monthly Report (January 2024)
```bash
curl -H "Authorization: Bearer <token>" \
  "https://your-api.com/reports/currency-income-statement?dateFrom=2024-01-01&dateTo=2024-01-31"
```

### 3. Daily Report (Today)
```bash
curl -H "Authorization: Bearer <token>" \
  "https://your-api.com/reports/currency-income-statement?dateFrom=2024-01-17&dateTo=2024-01-17"
```

### 4. Quarterly Report (Q1 2024)
```bash
curl -H "Authorization: Bearer <token>" \
  "https://your-api.com/reports/currency-income-statement?dateFrom=2024-01-01&dateTo=2024-03-31"
```

## Response Fields Explained

### Per-Currency Object
```json
{
  "currencyId": "d5c9f8b7-4e2a-11ec-81d3-0242ac130003",
  "currencyName": "US Dollar",
  "currencyCode": "USD",
  
  "totalSalesCurrency": 5000,        // Units sold
  "totalSalesPkr": 1300000,          // Revenue in PKR
  "averageSaleRate": 260,            // Avg selling rate
  
  "totalPurchaseCurrency": 4500,     // Units bought
  "totalPurchasePkr": 1170000,       // Cost in PKR
  "averagePurchaseRate": 260,        // Avg purchase rate
  
  "currentStockCurrency": 500,       // Current inventory units
  "currentStockValuePkr": 130000,    // Current inventory worth (PKR)
  "currentStockRate": 260,           // Current market rate
  
  "grossProfit": 130000,             // Revenue - Cost
  "grossProfitMargin": 10.0,         // Profit % = (Profit/Revenue)*100
  
  "netProfit": 130000,               // Same as gross for currency
  "netProfitMargin": 10.0,           // Same as gross margin
  
  "totalSalesTransactions": 25,      // Number of sell operations
  "totalPurchaseTransactions": 20,   // Number of buy operations
  "lastTransactionDate": "2024-01-15T10:30:00Z"
}
```

### Summary Object
```json
{
  "totalRevenuePkr": 1990000,        // All sales across currencies
  "totalCostPkr": 1817000,           // All purchases across currencies
  "totalGrossProfitPkr": 173000,     // Total profit
  "totalNetProfitPkr": 173000,       // Same as gross
  
  "overallGrossMargin": 8.69,        // Portfolio margin %
  "overallNetMargin": 8.69,          // Same as gross margin
  
  "totalCurrencies": 2,              // Number of currencies traded
  "totalSalesTransactions": 60,      // Total buys + sells
  "totalPurchaseTransactions": 50,   // Total purchase transactions
  
  "dateRange": {
    "from": "2024-01-01T00:00:00Z",
    "to": "2024-01-31T23:59:59Z"
  },
  "timestamp": "2024-01-17T15:45:30.123Z"
}
```

## Key Metrics

### Gross Profit
- **Formula**: Total Sales (PKR) - Total Purchases (PKR)
- **Meaning**: Pure trading profit before expenses
- **Good Range**: 2-10% of revenue

### Profit Margin
- **Formula**: (Profit / Revenue) × 100
- **Example**: 10% margin = 10 PKR profit per 100 PKR sales
- **Industry Average**: 3-5% for forex

### Revenue vs Cost
- **Revenue**: Total amount received from selling
- **Cost**: Total amount spent on purchasing
- **Difference**: Your trading profit

## Common Use Cases

### Portfolio Analysis
Which currency is most profitable?
```
USD: 10% margin, 1.3M revenue
SAR: 6.2% margin, 690K revenue
=> USD is more profitable
```

### Monthly Comparison
Is this month better than last?
```
This Month: 173K profit
Last Month: 95K profit
=> Growing, good sign!
```

### Risk Assessment
Are we over-concentrated?
```
USD: 65% of revenue
SAR: 35% of revenue
=> Well diversified
```

### Inventory Health
How long do we hold currency?
```
Purchases: 50 transactions
Current Stock: 500 units
Average: 10 units per transaction
=> Holding ~50 days supply
```

## Response Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Use the data |
| 401 | Unauthorized | Check token, re-login |
| 403 | Forbidden | Not admin, contact support |
| 400 | Bad Request | Check date format (ISO 8601) |
| 500 | Server Error | Try again, contact support |

## Performance Notes

- **Cache**: Results cached for 1 hour
- **Query Time**: <50ms typically
- **Data Freshness**: Updated when entries are created/modified
- **Best Practice**: Cache results client-side for offline access

## Integration Examples

### React Component
```typescript
async function getCurrencyIncomeStatement(dateFrom?: Date, dateTo?: Date) {
  const params = new URLSearchParams();
  if (dateFrom) params.append('dateFrom', dateFrom.toISOString());
  if (dateTo) params.append('dateTo', dateTo.toISOString());

  const response = await fetch(
    `/reports/currency-income-statement?${params}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  
  return response.json();
}
```

### TypeScript Client
```typescript
import { CurrencyIncomeStatementResponse } from './types';

const statement = await reportClient.getCurrencyIncomeStatement({
  dateFrom: new Date('2024-01-01'),
  dateTo: new Date('2024-01-31'),
}) as CurrencyIncomeStatementResponse;

console.log(`Total Profit: PKR ${statement.summary.totalGrossProfitPkr}`);
console.log(`Margin: ${statement.summary.overallGrossMargin}%`);
```

## Troubleshooting

### No currencies in response
- Check if you have any buy/sell transactions
- Verify dateFrom/dateTo are correct
- Ensure seller/buyer accounts are set up

### Zero profit
- Normal if market moved against you
- Check purchase vs sale prices
- Verify transaction status (completed)

### Slow response
- Use specific date ranges
- System caches for 1 hour
- Check network connectivity

## Webhooks (Future)

When available:
```
POST /webhooks/income-statement
{
  "event": "margin_below_threshold",
  "currency": "USD",
  "margin": 1.5,
  "threshold": 2.0
}
```

## Limits

- **Max Date Range**: No limit (but slower with larger ranges)
- **Max Currencies**: Limited by data only
- **Max Results**: All matching currencies returned
- **Rate Limit**: 100 requests/minute per admin
