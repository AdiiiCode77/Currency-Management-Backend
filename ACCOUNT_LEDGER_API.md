# Account Ledger API Documentation

## Overview
The Account Ledger API allows you to retrieve ledger information for any account in the system, including Customer Accounts, Bank Accounts, Currency Accounts, and General Accounts.

## Endpoint

### GET /reports/account-ledger/:accountId

Retrieves all transactions for a specific account with running balance and comprehensive totals.

## Authentication
Requires JWT Bearer token with Admin privileges.

## Parameters

### Path Parameters
- `accountId` (required): The UUID of any account (Customer, Bank, Currency, or General)

### Query Parameters
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of records per page (default: 50)
- `dateFrom` (optional): Start date filter in YYYY-MM-DD format
- `dateTo` (optional): End date filter in YYYY-MM-DD format

## Response Format

```json
{
  "accountId": "uuid-of-account",
  "accountName": "Account Name",
  "accountType": "CUSTOMER|BANK|CURRENCY|GENERAL",
  "entries": [
    {
      "date": "2026-01-15",
      "number": "INV-001",
      "paymentType": "Sale",
      "narration": "Sale to customer",
      "debit": 1000.00,
      "credit": 0.00,
      "balance": 1000.00,
      "referenceNumber": "INV-001"
    },
    {
      "date": "2026-01-16",
      "number": "CHQ-123",
      "paymentType": "Cheque Inward",
      "narration": "Payment received",
      "debit": 0.00,
      "credit": 500.00,
      "balance": 500.00,
      "referenceNumber": "CHQ-123"
    }
  ],
  "totals": {
    "totalCredit": 500.00,
    "totalDebit": 1000.00,
    "totalChqInward": 500.00,
    "totalChqOutward": 0.00,
    "balance": 500.00,
    "total": 1500.00
  },
  "pagination": {
    "page": 1,
    "limit": 50,
    "totalPages": 1,
    "totalRecords": 2
  }
}
```

## Response Fields

### Entry Fields
- **date**: Transaction date (YYYY-MM-DD format)
- **number**: Reference number or entry ID
- **paymentType**: Type of transaction (Sale, Purchase, Journal Entry, Bank Payment, Bank Receipt, Cash Payment, Cash Receipt, Cheque Inward, Cheque Outward, Currency Entry, Currency Journal)
- **narration**: Description of the transaction
- **debit**: Debit amount (Banam/Dr)
- **credit**: Credit amount (Jamam/Cr)
- **balance**: Running balance after this transaction
- **referenceNumber**: Reference number if available

### Totals Fields
- **totalCr**: Total of all credit amounts
- **totalDr**: Total of all debit amounts
- **totalChqInward**: Total amount of cheque inward transactions
- **totalChqOutward**: Total amount of cheque outward transactions
- **balance**: Final balance (Total Dr - Total Cr)
- **total**: Sum of all transactions (Total Dr + Total Cr)

## Example Usage

### Get ledger for a customer account
```bash
GET /reports/account-ledger/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <your-jwt-token>
```

### Get ledger with date filter
```bash
GET /reports/account-ledger/550e8400-e29b-41d4-a716-446655440000?dateFrom=2026-01-01&dateTo=2026-01-31
Authorization: Bearer <your-jwt-token>
```

### Get ledger with pagination
```bash
GET /reports/account-ledger/550e8400-e29b-41d4-a716-446655440000?page=1&limit=100
Authorization: Bearer <your-jwt-token>
```

## Supported Account Types

The endpoint automatically detects and works with:

1. **Customer Accounts** (`CustomerAccountEntity`)
   - Regular customer trading accounts
   
2. **Bank Accounts** (`BankAccountEntity`)
   - Bank account ledgers
   
3. **Currency Accounts** (`CustomerCurrencyAccountEntity`)
   - Currency-specific customer accounts
   
4. **General Accounts** (`GeneralAccountEntity`)
   - General ledger accounts (expenses, income, etc.)

## Features

✅ **Running Balance**: Automatically calculates running balance for each entry  
✅ **Comprehensive Totals**: Provides total debits, credits, cheque inward/outward  
✅ **Pagination**: Supports pagination for large ledgers  
✅ **Date Filtering**: Filter transactions by date range  
✅ **Caching**: Redis caching for improved performance  
✅ **Multiple Account Types**: Works with all account types in the system  
✅ **Payment Type Formatting**: Human-readable payment type labels  

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Account ID is required",
  "error": "Bad Request"
}
```

### 400 Bad Request (Account Not Found)
```json
{
  "statusCode": 400,
  "message": "Account not found",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Unable to fetch account ledger. Please try again later.",
  "error": "Internal Server Error"
}
```

## Notes

- All amounts are rounded to 2 decimal places
- Transactions are ordered by date (oldest first)
- Running balance is calculated considering all previous transactions
- The response is cached for 1 hour (3600 seconds) for performance
- Cheque Inward and Cheque Outward totals help track cheque-based transactions separately
