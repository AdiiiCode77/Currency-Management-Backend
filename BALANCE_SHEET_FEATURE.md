# Balance Sheet Feature Documentation

## Overview
The balance sheet feature provides a comprehensive financial reporting system that displays all accounts, currencies, customers, and banks with their debits, credits, and balances. This is essential for financial management and reconciliation in the currency exchange business.

## Features Implemented

### 1. Data Transfer Objects (DTOs)
**File:** `src/modules/reports/domain/dto/balance-sheet.dto.ts`

Defines the structure for all balance sheet responses:
- `CurrencyBalance`: Balance information for each currency
- `CustomerBalance`: Balance information for each customer account
- `BankBalance`: Balance information for each bank account
- `GeneralAccountBalance`: Balance information for general ledger accounts
- `BalanceSheetResponse`: Main response containing assets and liabilities
- `DetailedBalanceSheetResponse`: Extended response with detailed transaction entries

### 2. Service Methods
**File:** `src/modules/reports/application/report.service.ts`

#### `getBalanceSheet(adminId, dateFrom?, dateTo?)`
Returns a comprehensive balance sheet summary for the specified admin.

**Features:**
- Aggregates all currencies, customers, banks, and general accounts
- Calculates total debits and credits for each account type
- Determines if the balance sheet is balanced (debit = credit)
- Optional date range filtering
- Redis caching for performance (1-hour TTL)

**Response Structure:**
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
    "totalDebit": 0,
    "totalCredit": 0,
    "difference": 0,
    "isBalanced": true,
    "timestamp": "2025-12-28T..."
  }
}
```

#### `getDetailedBalanceSheet(adminId, dateFrom?, dateTo?)`
Returns a detailed balance sheet with all transaction entries per account.

**Features:**
- Includes complete transaction history for each account
- Shows debit/credit and running balance for each entry
- Supports date range filtering
- Redis caching for performance

**Response Structure:**
```json
{
  "accounts": [
    {
      "accountId": "uuid",
      "accountName": "Account Name",
      "accountType": "CURRENCY|CUSTOMER|BANK|GENERAL",
      "entries": [
        {
          "date": "2025-12-28",
          "entryType": "PURCHASE|SELLING|BANK_PAYMENT|BANK_RECEIPT|JOURNAL",
          "accountName": "Related Account",
          "narration": "Transaction description",
          "debit": 0,
          "credit": 0,
          "balance": 0,
          "reference": "CHQ no or S_No"
        }
      ],
      "totalDebit": 0,
      "totalCredit": 0,
      "closingBalance": 0
    }
  ],
  "summary": {
    "totalDebit": 0,
    "totalCredit": 0,
    "difference": 0,
    "isBalanced": true,
    "timestamp": "2025-12-28T..."
  }
}
```

### 3. Private Helper Methods

- `getCurrencyBalances()`: Aggregates all currency stock balances
- `getCustomerBalances()`: Calculates journal-based customer account balances
- `getBankBalances()`: Aggregates bank payment and receipt entries
- `getGeneralAccountBalances()`: Calculates general ledger account balances
- `getCurrencyAccountLedger()`: Detailed ledger for a specific currency
- `getCustomerAccountLedger()`: Detailed ledger for a specific customer
- `getBankAccountLedger()`: Detailed ledger for a specific bank
- `getGeneralAccountLedger()`: Detailed ledger for a specific general account

### 4. API Endpoints
**File:** `src/modules/reports/interface/report.controller.ts`

#### `GET /reports/balance-sheet`
Retrieve comprehensive balance sheet summary.

**Query Parameters:**
- `dateFrom` (optional): Start date (ISO format)
- `dateTo` (optional): End date (ISO format)

**Authentication:** Required (JWT + Admin Guard)

**Example:**
```bash
curl -X GET "http://localhost:3000/reports/balance-sheet?dateFrom=2025-01-01&dateTo=2025-12-31" \
  -H "Authorization: Bearer <token>"
```

#### `GET /reports/balance-sheet/detailed`
Retrieve detailed balance sheet with all transaction entries.

**Query Parameters:**
- `dateFrom` (optional): Start date (ISO format)
- `dateTo` (optional): End date (ISO format)

**Authentication:** Required (JWT + Admin Guard)

**Example:**
```bash
curl -X GET "http://localhost:3000/reports/balance-sheet/detailed?dateFrom=2025-01-01&dateTo=2025-12-31" \
  -H "Authorization: Bearer <token>"
```

### 5. Module Configuration
**File:** `src/modules/reports/reports.module.ts`

The ReportsModule has been updated to include all necessary entity repositories:
- `SellingEntryEntity`
- `PurchaseEntryEntity`
- `CustomerCurrencyEntryEntity`
- `CurrencyStockEntity`
- `AddCurrencyEntity`
- `JournalEntryEntity`
- `BankPaymentEntryEntity`
- `BankReceiverEntryEntity`
- `CashPaymentEntryEntity`
- `CashReceivedEntryEntity`
- `CustomerAccountEntity`
- `BankAccountEntity`
- `GeneralAccountEntity`

## Account Types Supported

### 1. Currency Accounts
- Tracks currency inventory and movements
- Source: `CurrencyStockEntity`, `SellingEntryEntity`, `PurchaseEntryEntity`
- Balance Type: Amount of currency held

### 2. Customer Accounts
- Tracks money owed by or to customers
- Source: `CustomerAccountEntity`, `JournalEntryEntity`
- Balance Type: DEBIT (we owe customer) or CREDIT (customer owes us)

### 3. Bank Accounts
- Tracks money in bank accounts
- Source: `BankAccountEntity`, `BankPaymentEntryEntity`, `BankReceiverEntryEntity`
- Balance Type: DEBIT (money spent) or CREDIT (money received)

### 4. General Accounts
- Tracks general ledger entries (expenses, income, etc.)
- Source: `GeneralAccountEntity`, `JournalEntryEntity`
- Balance Type: DEBIT (expense/asset) or CREDIT (liability/income)

## Transaction Types Tracked

1. **PURCHASE**: Buying currency from customers
2. **SELLING**: Selling currency to customers
3. **BANK_PAYMENT**: Money paid out from bank
4. **BANK_RECEIPT**: Money received to bank
5. **JOURNAL**: Journal entries for general accounts
6. **CASH_PAYMENT**: Cash payments
7. **CASH_RECEIPT**: Cash receipts

## Balance Calculation Logic

### For Each Account:
```
Total Debit = Sum of all debit entries
Total Credit = Sum of all credit entries
Balance = Credit - Debit
Balance Type = (Balance >= 0) ? 'CREDIT' : 'DEBIT'
```

### For Balance Sheet:
```
Total Debit = Sum of all account debits
Total Credit = Sum of all account credits
Difference = Total Debit - Total Credit
Is Balanced = (Difference ≈ 0) [allowing for rounding errors < 0.01]
```

## Performance Considerations

- **Redis Caching**: All balance sheet calculations are cached with a 1-hour TTL
- **Cache Keys**: 
  - `balanceSheet:${adminId}:${dateFrom}:${dateTo}`
  - `detailedBalanceSheet:${adminId}:${dateFrom}:${dateTo}`
- **Cache Invalidation**: Happens automatically after 3600 seconds

## Error Handling

The service gracefully handles:
- Missing accounts (returns empty arrays)
- Optional date ranges (returns all-time balance if not specified)
- Type conversions (safely converts numbers to strings for references)
- Null/undefined values (uses default 0 for missing amounts)

## Usage Example

### Get Summary Balance Sheet
```typescript
const balanceSheet = await reportService.getBalanceSheet(
  'admin-uuid',
  new Date('2025-01-01'),
  new Date('2025-12-31')
);
```

### Get Detailed Balance Sheet
```typescript
const detailed = await reportService.getDetailedBalanceSheet(
  'admin-uuid',
  new Date('2025-01-01'),
  new Date('2025-12-31')
);
```

## Testing

Test both endpoints with curl:

```bash
# Test summary endpoint
curl -X GET "http://localhost:3000/reports/balance-sheet" \
  -H "Authorization: Bearer <your-jwt-token>"

# Test detailed endpoint
curl -X GET "http://localhost:3000/reports/balance-sheet/detailed" \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Future Enhancements

- Export balance sheet to PDF/Excel
- Advanced filtering by account type
- Comparative balance sheets (period-over-period)
- Trial balance generation
- Custom date ranges with predefined periods (this month, last quarter, etc.)
- Real-time balance updates without caching
- Audit trail integration
