# Income Statement - Example Requests & Responses

## Example 1: All-Time Income Statement

### Request
```bash
curl -X GET http://localhost:3000/reports/currency-income-statement \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

### Response (200 OK)
```json
{
  "currencies": [
    {
      "currencyId": "d5c9f8b7-4e2a-11ec-81d3-0242ac130003",
      "currencyName": "US Dollar",
      "currencyCode": "USD",
      "totalSalesCurrency": 15000.5,
      "totalSalesPkr": 3900000.75,
      "averageSaleRate": 260.05,
      "totalPurchaseCurrency": 14000,
      "totalPurchasePkr": 3640000,
      "averagePurchaseRate": 260,
      "currentStockCurrency": 1000.5,
      "currentStockValuePkr": 260000.50,
      "currentStockRate": 260,
      "grossProfit": 260000.75,
      "grossProfitMargin": 6.67,
      "netProfit": 260000.75,
      "netProfitMargin": 6.67,
      "totalSalesTransactions": 42,
      "totalPurchaseTransactions": 38,
      "lastTransactionDate": "2024-01-17T10:30:00.000Z"
    },
    {
      "currencyId": "e7d8c9a5-4e2a-11ec-81d3-0242ac130004",
      "currencyName": "Saudi Riyal",
      "currencyCode": "SAR",
      "totalSalesCurrency": 25000,
      "totalSalesPkr": 2160000,
      "averageSaleRate": 86.4,
      "totalPurchaseCurrency": 23000,
      "totalPurchasePkr": 1990000,
      "averagePurchaseRate": 86.52,
      "currentStockCurrency": 2000,
      "currentStockValuePkr": 170000,
      "currentStockRate": 85,
      "grossProfit": 170000,
      "grossProfitMargin": 7.87,
      "netProfit": 170000,
      "netProfitMargin": 7.87,
      "totalSalesTransactions": 55,
      "totalPurchaseTransactions": 50,
      "lastTransactionDate": "2024-01-16T14:20:00.000Z"
    },
    {
      "currencyId": "f9e8d7c6-4e2a-11ec-81d3-0242ac130005",
      "currencyName": "United Arab Emirates Dirham",
      "currencyCode": "AED",
      "totalSalesCurrency": 8500,
      "totalSalesPkr": 570000,
      "averageSaleRate": 67.06,
      "totalPurchaseCurrency": 8000,
      "totalPurchasePkr": 537000,
      "averagePurchaseRate": 67.125,
      "currentStockCurrency": 500,
      "currentStockValuePkr": 33500,
      "currentStockRate": 67,
      "grossProfit": 33000,
      "grossProfitMargin": 5.79,
      "netProfit": 33000,
      "netProfitMargin": 5.79,
      "totalSalesTransactions": 28,
      "totalPurchaseTransactions": 24,
      "lastTransactionDate": "2024-01-15T09:15:00.000Z"
    }
  ],
  "summary": {
    "totalRevenuePkr": 6630000.75,
    "totalCostPkr": 6167000,
    "totalGrossProfitPkr": 463000.75,
    "totalNetProfitPkr": 463000.75,
    "overallGrossMargin": 6.98,
    "overallNetMargin": 6.98,
    "totalCurrencies": 3,
    "totalSalesTransactions": 125,
    "totalPurchaseTransactions": 112,
    "timestamp": "2024-01-17T15:45:30.123Z"
  }
}
```

---

## Example 2: Monthly Income Statement (January 2024)

### Request
```bash
curl -X GET "http://localhost:3000/reports/currency-income-statement?dateFrom=2024-01-01&dateTo=2024-01-31" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

### Response (200 OK)
```json
{
  "currencies": [
    {
      "currencyId": "d5c9f8b7-4e2a-11ec-81d3-0242ac130003",
      "currencyName": "US Dollar",
      "currencyCode": "USD",
      "totalSalesCurrency": 5000,
      "totalSalesPkr": 1300000,
      "averageSaleRate": 260,
      "totalPurchaseCurrency": 4500,
      "totalPurchasePkr": 1170000,
      "averagePurchaseRate": 260,
      "currentStockCurrency": 500,
      "currentStockValuePkr": 130000,
      "currentStockRate": 260,
      "grossProfit": 130000,
      "grossProfitMargin": 10.0,
      "netProfit": 130000,
      "netProfitMargin": 10.0,
      "totalSalesTransactions": 25,
      "totalPurchaseTransactions": 20,
      "lastTransactionDate": "2024-01-31T16:45:00.000Z"
    },
    {
      "currencyId": "e7d8c9a5-4e2a-11ec-81d3-0242ac130004",
      "currencyName": "Saudi Riyal",
      "currencyCode": "SAR",
      "totalSalesCurrency": 8000,
      "totalSalesPkr": 690000,
      "averageSaleRate": 86.25,
      "totalPurchaseCurrency": 7500,
      "totalPurchasePkr": 647000,
      "averagePurchaseRate": 86.27,
      "currentStockCurrency": 500,
      "currentStockValuePkr": 43000,
      "currentStockRate": 86,
      "grossProfit": 43000,
      "grossProfitMargin": 6.23,
      "netProfit": 43000,
      "netProfitMargin": 6.23,
      "totalSalesTransactions": 35,
      "totalPurchaseTransactions": 30,
      "lastTransactionDate": "2024-01-30T12:30:00.000Z"
    }
  ],
  "summary": {
    "totalRevenuePkr": 1990000,
    "totalCostPkr": 1817000,
    "totalGrossProfitPkr": 173000,
    "totalNetProfitPkr": 173000,
    "overallGrossMargin": 8.69,
    "overallNetMargin": 8.69,
    "totalCurrencies": 2,
    "totalSalesTransactions": 60,
    "totalPurchaseTransactions": 50,
    "dateRange": {
      "from": "2024-01-01T00:00:00.000Z",
      "to": "2024-01-31T23:59:59.999Z"
    },
    "timestamp": "2024-01-17T15:45:30.123Z"
  }
}
```

---

## Example 3: Daily Income Statement (Single Day)

### Request
```bash
curl -X GET "http://localhost:3000/reports/currency-income-statement?dateFrom=2024-01-17&dateTo=2024-01-17" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

### Response (200 OK)
```json
{
  "currencies": [
    {
      "currencyId": "d5c9f8b7-4e2a-11ec-81d3-0242ac130003",
      "currencyName": "US Dollar",
      "currencyCode": "USD",
      "totalSalesCurrency": 100,
      "totalSalesPkr": 26000,
      "averageSaleRate": 260,
      "totalPurchaseCurrency": 80,
      "totalPurchasePkr": 20800,
      "averagePurchaseRate": 260,
      "currentStockCurrency": 1000.5,
      "currentStockValuePkr": 260000.50,
      "currentStockRate": 260,
      "grossProfit": 5200,
      "grossProfitMargin": 20.0,
      "netProfit": 5200,
      "netProfitMargin": 20.0,
      "totalSalesTransactions": 3,
      "totalPurchaseTransactions": 2,
      "lastTransactionDate": "2024-01-17T16:45:00.000Z"
    },
    {
      "currencyId": "e7d8c9a5-4e2a-11ec-81d3-0242ac130004",
      "currencyName": "Saudi Riyal",
      "currencyCode": "SAR",
      "totalSalesCurrency": 500,
      "totalSalesPkr": 43000,
      "averageSaleRate": 86,
      "totalPurchaseCurrency": 0,
      "totalPurchasePkr": 0,
      "averagePurchaseRate": 0,
      "currentStockCurrency": 2000,
      "currentStockValuePkr": 170000,
      "currentStockRate": 85,
      "grossProfit": 43000,
      "grossProfitMargin": 100.0,
      "netProfit": 43000,
      "netProfitMargin": 100.0,
      "totalSalesTransactions": 5,
      "totalPurchaseTransactions": 0,
      "lastTransactionDate": "2024-01-17T14:20:00.000Z"
    }
  ],
  "summary": {
    "totalRevenuePkr": 69000,
    "totalCostPkr": 20800,
    "totalGrossProfitPkr": 48200,
    "totalNetProfitPkr": 48200,
    "overallGrossMargin": 69.86,
    "overallNetMargin": 69.86,
    "totalCurrencies": 2,
    "totalSalesTransactions": 8,
    "totalPurchaseTransactions": 2,
    "dateRange": {
      "from": "2024-01-17T00:00:00.000Z",
      "to": "2024-01-17T23:59:59.999Z"
    },
    "timestamp": "2024-01-17T18:20:15.456Z"
  }
}
```

---

## Example 4: Empty Result (No Transactions)

### Request
```bash
curl -X GET "http://localhost:3000/reports/currency-income-statement?dateFrom=2024-12-01&dateTo=2024-12-31" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

### Response (200 OK)
```json
{
  "currencies": [],
  "summary": {
    "totalRevenuePkr": 0,
    "totalCostPkr": 0,
    "totalGrossProfitPkr": 0,
    "totalNetProfitPkr": 0,
    "overallGrossMargin": 0,
    "overallNetMargin": 0,
    "totalCurrencies": 0,
    "totalSalesTransactions": 0,
    "totalPurchaseTransactions": 0,
    "dateRange": {
      "from": "2024-12-01T00:00:00.000Z",
      "to": "2024-12-31T23:59:59.999Z"
    },
    "timestamp": "2024-01-17T15:45:30.123Z"
  }
}
```

---

## Example 5: Error Responses

### 401 Unauthorized (Missing Token)
```bash
curl -X GET http://localhost:3000/reports/currency-income-statement
```

Response:
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

### 403 Forbidden (Non-Admin User)
```bash
curl -X GET http://localhost:3000/reports/currency-income-statement \
  -H "Authorization: Bearer user-token-not-admin"
```

Response:
```json
{
  "message": "Forbidden",
  "statusCode": 403
}
```

### 400 Bad Request (Invalid Date Format)
```bash
curl -X GET "http://localhost:3000/reports/currency-income-statement?dateFrom=01-01-2024" \
  -H "Authorization: Bearer token123"
```

Response:
```json
{
  "message": "Invalid date format. Use ISO 8601: YYYY-MM-DD",
  "statusCode": 400
}
```

---

## Interpretation Guide

### Reading the USD Example (January)
```
Revenue:  1,300,000 PKR (5,000 USD sold at ~260 rate)
Cost:     1,170,000 PKR (4,500 USD purchased at ~260 rate)
Profit:     130,000 PKR (difference)
Margin:         10% (130k/1.3M * 100)

⚡ Interpretation:
- For every 100 PKR earned, 10 PKR is profit
- Good performance on USD trading
- 25 sales vs 20 purchases = more sales activity
- Current stock: 500 USD remaining in inventory
```

### Reading the SAR Example (January)
```
Revenue:    690,000 PKR (8,000 SAR sold at ~86.25 rate)
Cost:       647,000 PKR (7,500 SAR purchased at ~86.27 rate)
Profit:      43,000 PKR (difference)
Margin:       6.23% (43k/690k * 100)

⚡ Interpretation:
- Lower margin than USD (6.23% vs 10%)
- Still profitable, but thinner margins
- More transactions (35 sales vs 30 purchases)
- Current stock: 500 SAR remaining
```

### Reading the Portfolio Summary
```
Total Revenue:     1,990,000 PKR (USD + SAR)
Total Cost:        1,817,000 PKR (USD + SAR)
Total Profit:        173,000 PKR (combined profit)
Overall Margin:           8.69% (173k/1.99M * 100)

⚡ Interpretation:
- Portfolio is healthy with 8.69% overall margin
- USD is more profitable, pulling up average
- 2 currencies traded, 60 sales, 50 purchases
- Diversified across USD and SAR
```

---

## Data Analysis Examples

### Example Analysis: Which Currency is More Profitable?

**Data from All-Time Report:**
```
USD:
  Revenue: 3,900,000 PKR
  Profit:    260,000 PKR
  Margin:       6.67%
  
SAR:
  Revenue: 2,160,000 PKR
  Profit:    170,000 PKR
  Margin:       7.87%
```

**Analysis:**
```
✓ USD has higher absolute profit (260k > 170k)
✗ SAR has higher margin (7.87% > 6.67%)

Conclusion: 
- USD generates more total profit (better for total revenue)
- SAR has better unit economics (better for efficiency)
- Focus on USD volume, improve SAR margins
```

### Example Analysis: Growth Comparison

**January vs February:**
```
January:
  Revenue: 1,990,000 PKR
  Profit:    173,000 PKR
  Margin:       8.69%

February:
  Revenue: 2,150,000 PKR
  Profit:    180,000 PKR
  Margin:       8.37%
```

**Analysis:**
```
✓ Revenue up 8.1% (1.99M → 2.15M)
✓ Profit up 4.0% (173k → 180k)
✗ Margin down 0.32% (8.69% → 8.37%)

Conclusion:
- Growing revenue (good!)
- Growing profit but at slower rate (margins tightening)
- Need to improve cost control
- Possibly facing competitive pressure
```

---

## Using in Code

### JavaScript/TypeScript
```typescript
// Fetch income statement
const response = await fetch(
  '/reports/currency-income-statement?dateFrom=2024-01-01&dateTo=2024-01-31',
  {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
);

const data: CurrencyIncomeStatementResponse = await response.json();

// Extract summary
const { totalRevenuePkr, totalGrossProfitPkr, overallGrossMargin } = data.summary;

console.log(`
  Monthly Report
  Revenue: PKR ${totalRevenuePkr.toLocaleString()}
  Profit:  PKR ${totalGrossProfitPkr.toLocaleString()}
  Margin:  ${overallGrossMargin.toFixed(2)}%
`);

// Find best performing currency
const bestCurrency = data.currencies.reduce((best, curr) => 
  curr.grossProfitMargin > best.grossProfitMargin ? curr : best
);

console.log(`Best performer: ${bestCurrency.currencyCode} (${bestCurrency.grossProfitMargin}% margin)`);
```

### Dashboard Display
```typescript
// Create dashboard cards
const cards = data.currencies.map(currency => ({
  title: `${currency.currencyName} (${currency.currencyCode})`,
  metrics: {
    'Revenue': `PKR ${currency.totalSalesPkr.toLocaleString()}`,
    'Cost': `PKR ${currency.totalPurchasePkr.toLocaleString()}`,
    'Profit': `PKR ${currency.grossProfit.toLocaleString()}`,
    'Margin': `${currency.grossProfitMargin.toFixed(2)}%`,
    'Stock': `${currency.currentStockCurrency} units`,
  },
  status: currency.grossProfitMargin > 7 ? 'good' : 'normal'
}));
```

This document provides complete examples for understanding and using the income statement API.
