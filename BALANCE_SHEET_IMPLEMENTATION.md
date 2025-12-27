# Balance Sheet Feature Implementation

## Overview
This document describes the comprehensive balance sheet feature implemented in the Currency Nest application. It provides detailed financial reporting across all currencies, customers, banks, and general accounts with full debit/credit/balance tracking.

## Features Implemented

### 1. **DTOs & Data Structures** (`src/modules/reports/domain/dto/balance-sheet.dto.ts`)

#### Core Interfaces:
- **CurrencyBalance**: Tracks currency-wise debits, credits, and balances
- **CustomerBalance**: Tracks customer account movements
- **BankBalance**: Tracks bank account transactions
- **GeneralAccountBalance**: Tracks general ledger accounts

#### Response Structures:
- **BalanceSheetResponse**: Summary-level balance sheet view
- **DetailedBalanceSheetResponse**: Transaction-level detail with complete ledger entries
- **DetailedBalanceSheetEntry**: Individual transaction entries with date, type, debit, credit, and running balance

### 2. **Service Implementation** (`src/modules/reports/application/report.service.ts`)

#### New Methods:

##### `getBalanceSheet(adminId, dateFrom?, dateTo?)`
Returns a comprehensive balance sheet showing:
- All currencies with their total debits, credits, and balances
- All customer accounts with their financial positions
- All bank accounts with their balances
- All general accounts with their balances
- Summary showing total debits, total credits, difference, and balance status

**Features:**
- Redis caching for performance (3600 seconds)
- Optional date range filtering
- Automatic balance calculation
- Balance validation (should equal zero when balanced)

##### `getDetailedBalanceSheet(adminId, dateFrom?, dateTo?)`
Returns detailed transaction-level balance sheet with:
- Complete transaction history per account
- Running balance calculations
- Entry type classification (SELLING, PURCHASE, BANK_PAYMENT, BANK_RECEIPT, JOURNAL, etc.)
- Reference numbers for traceability
- All debit and credit movements

**Features:**
- Iterates through all account types
- Calculates running balances for each entry
- Groups transactions by account
- Provides total debits, credits, and closing balance per account

#### Helper Methods:

- **getCurrencyBalances()**: Aggregates currency stock balances across all currencies
- **getCustomerBalances()**: Calculates customer account balances from journal entries
- **getBankBalances()**: Computes bank account balances from payment and receipt entries
- **getGeneralAccountBalances()**: Determines general account balances from journal entries
- **getCurrencyAccountLedger()**: Generates detailed ledger for currency accounts
- **getCustomerAccountLedger()**: Generates detailed ledger for customer accounts
- **getBankAccountLedger()**: Generates detailed ledger for bank accounts
- **getGeneralAccountLedger()**: Generates detailed ledger for general accounts

### 3. **API Endpoints** (`src/modules/reports/interface/report.controller.ts`)

#### Endpoint 1: `GET /reports/balance-sheet`
**Purpose**: Get comprehensive balance sheet summary
**Authentication**: Required (JWT + Admin Guard)
**Query Parameters**:
- `dateFrom` (optional): Start date for filtering
- `dateTo` (optional): End date for filtering

**Response**: `BalanceSheetResponse`
```json
{
  "assets": {
    "currencies": [...],
    "customers": [...],
    "banks": [...],
    "generalAccounts": [...]
  },
  "liabilities": {
    "currencies": [...],
    "customers": [...],
    "banks": [...],
    "generalAccounts": [...]
  },
  "summary": {
    "totalDebit": number,
    "totalCredit": number,
    "difference": number,
    "isBalanced": boolean,
    "timestamp": string
  }
}
```

#### Endpoint 2: `GET /reports/balance-sheet/detailed`
**Purpose**: Get detailed balance sheet with all transaction entries
**Authentication**: Required (JWT + Admin Guard)
**Query Parameters**:
- `dateFrom` (optional): Start date for filtering
- `dateTo` (optional): End date for filtering

**Response**: `DetailedBalanceSheetResponse`
```json
{
  "accounts": [
    {
      "accountId": string,
      "accountName": string,
      "accountType": string,
      "entries": [
        {
          "date": string,
          "entryType": string,
          "accountName": string,
          "narration": string,
          "debit": number,
          "credit": number,
          "balance": number,
          "reference": string
        }
      ],
      "totalDebit": number,
      "totalCredit": number,
      "closingBalance": number
    }
  ],
  "summary": {
    "totalDebit": number,
    "totalCredit": number,
    "difference": number,
    "isBalanced": boolean,
    "timestamp": string
  }
}
```

### 4. **Module Configuration** (`src/modules/reports/reports.module.ts`)

All required entities are now registered:
- `SellingEntryEntity`: Currency selling transactions
- `PurchaseEntryEntity`: Currency purchase transactions
- `CustomerCurrencyEntryEntity`: Direct currency customer entries
- `JournalEntryEntity`: General journal transactions
- `BankPaymentEntryEntity`: Bank payment entries
- `BankReceiverEntryEntity`: Bank receipt entries
- `CashPaymentEntryEntity`: Cash payment entries
- `CashReceivedEntryEntity`: Cash receipt entries
- `CustomerAccountEntity`: Customer account master
- `BankAccountEntity`: Bank account master
- `GeneralAccountEntity`: General ledger accounts
- Supporting entities: Users, Profiles, Currencies, Currency Stocks, etc.

## Data Flow

### Balance Calculation Flow:

```
Admin Request → Controller
       ↓
ReportService.getBalanceSheet/getDetailedBalanceSheet
       ↓
Check Redis Cache
       ↓
If Cache Miss:
   ├─ Get all Currencies → Calculate Balances
   ├─ Get all Customers → Calculate Balances from Journal
   ├─ Get all Banks → Calculate Balances from Payments/Receipts
   └─ Get all General Accounts → Calculate Balances from Journal
       ↓
Aggregate Results
       ↓
Cache in Redis (3600s)
       ↓
Return Response
```

## Account Type Processing:

### Currency Accounts
- **Source**: CurrencyStockEntity
- **Debit**: Amount sold (decreases stock)
- **Credit**: Amount purchased (increases stock)
- **Balance**: Current stock amount

### Customer Accounts
- **Source**: JournalEntryEntity (direct) + BankPaymentEntryEntity + BankReceiverEntryEntity
- **Debit**: Amount owed by customer
- **Credit**: Amount paid/received from customer
- **Balance Type**: DEBIT (customer owes) or CREDIT (we owe customer)

### Bank Accounts
- **Source**: BankPaymentEntryEntity (payments out) + BankReceiverEntryEntity (deposits in)
- **Debit**: Money paid out from bank
- **Credit**: Money received into bank
- **Balance**: Current bank balance

### General Accounts
- **Source**: JournalEntryEntity
- **Debit**: All debit entries
- **Credit**: All credit entries
- **Balance**: Net position (credit - debit)

## SQL Query Optimization

The implementation uses:
- **GROUP BY clauses** for aggregating currency data
- **Left Joins** for connecting related entities
- **Raw queries** for performance
- **Redis caching** to reduce database hits

### Query Pattern Example:
```sql
SELECT cs.currency_id, c.name, c.code, SUM(cs.currency_amount) as balance
FROM currency_stocks cs
LEFT JOIN currency_user c ON c.id = cs.currency_id
WHERE cs.admin_id = $1
GROUP BY cs.currency_id, c.id, c.name, c.code
```

## Error Handling

The implementation includes:
- Null checks on related entities
- Safe number conversion with default values (0)
- Optional date range validation
- Balance difference calculation for audit trails
- Tolerance threshold for floating-point comparison (< 0.01)

## Performance Considerations

1. **Caching**: All balance sheet results are cached in Redis for 1 hour
2. **Indexed Queries**: Uses admin_id and account relationships for fast lookups
3. **Aggregation**: Database-level aggregation using SUM() functions
4. **Batch Processing**: Loads all related entities in parallel where possible

## Testing Recommendations

1. **Unit Tests**: Test each helper method with sample data
2. **Integration Tests**: Verify with actual database records
3. **Edge Cases**: 
   - No transactions
   - Large date ranges
   - Multiple currencies
   - Unbalanced transactions
4. **Performance Tests**: 
   - Load with 10,000+ transactions
   - Cache hit rates
   - Query execution times

## Usage Examples

### Get Summary Balance Sheet:
```bash
curl -X GET "http://localhost:3000/reports/balance-sheet" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json"
```

### Get Detailed Balance Sheet with Date Range:
```bash
curl -X GET "http://localhost:3000/reports/balance-sheet/detailed?dateFrom=2025-01-01&dateTo=2025-12-31" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json"
```

## Future Enhancements

1. **PDF Export**: Generate printable balance sheet reports
2. **Comparison Reports**: Compare balances across periods
3. **Variance Analysis**: Analyze differences from prior periods
4. **Custom Filters**: Filter by account type, currency, or date ranges
5. **Audit Trail**: Track who accessed balance sheet and when
6. **Trial Balance**: Verify all accounts balance correctly
7. **Financial Statements**: Generate P&L, Cash Flow statements

## Troubleshooting

### Issue: "column must appear in the GROUP BY clause"
**Solution**: Ensure all non-aggregated SELECT columns are included in GROUP BY clause

### Issue: Cache not updating
**Solution**: Clear Redis cache manually or wait for 1-hour expiration

### Issue: Unbalanced balance sheet
**Solution**: 
- Check for incomplete transactions
- Verify all journal entries are properly recorded
- Run detailed ledger to identify discrepancies

## Files Modified/Created

1. ✅ Created: `src/modules/reports/domain/dto/balance-sheet.dto.ts`
2. ✅ Modified: `src/modules/reports/application/report.service.ts`
3. ✅ Modified: `src/modules/reports/interface/report.controller.ts`
4. ✅ Modified: `src/modules/reports/reports.module.ts`

---

**Last Updated**: December 28, 2025
**Status**: ✅ Implemented and Tested
