# Ledger & Currency Deletion Fixes

## Issues Addressed

### 1. Understanding the "Double Entry" System

#### What Was Reported
> "Ledgers contains the double value for all transaction still like for Credit account and debit account same we have multiple entries created separate for credit and debit account"

#### The Reality: This is **NOT a Bug** - It's Standard Accounting Practice

The system correctly implements **Double-Entry Bookkeeping**, which is the foundation of modern accounting. Here's why you see "double entries":

**Example Transaction:**
```
Customer A pays 1000 PKR to Customer B
```

**General Ledger Entries Created:**
1. **Entry 1 (Customer A's View)**
   - Account: Customer A
   - Debit: 0
   - Credit: 1000 PKR
   - Contra Account: Customer B

2. **Entry 2 (Customer B's View)**
   - Account: Customer B  
   - Debit: 1000 PKR
   - Credit: 0
   - Contra Account: Customer A

**Why This is Correct:**
- Every transaction affects at least TWO accounts
- Money doesn't disappear - it moves from one account to another
- The system maintains the accounting equation: `Assets = Liabilities + Equity`
- Total debits ALWAYS equal total credits across all entries

#### When Would This Be a Problem?

The "double entries" only become an issue if:

1. **Display Issue**: You're showing ALL general ledger entries without filtering by account
   - **Solution**: Filter by `accountId` when displaying a specific account's ledger
   
2. **Incorrect Querying**: Summing totals without proper filtering
   - **Solution**: Use the provided `contraAccountId` to understand transaction flow

#### How to Query Ledgers Correctly

**❌ Wrong Way (Shows All Entries - Appears Doubled)**
```sql
SELECT * FROM general_ledger 
WHERE admin_id = 'xxx' 
ORDER BY transaction_date DESC
```

**✅ Correct Way (Shows Specific Account's Ledger)**
```sql
SELECT * FROM general_ledger 
WHERE admin_id = 'xxx' 
  AND account_id = 'specific-account-id'
ORDER BY transaction_date DESC
```

**✅ For Account Balance**
```sql
SELECT 
  SUM(debit_amount) - SUM(credit_amount) as balance
FROM general_ledger 
WHERE admin_id = 'xxx' 
  AND account_id = 'specific-account-id'
```

#### Verification in Code

Look at [jounal.service.ts](src/modules/journal/application/jounal.service.ts#L73-L111):

```typescript
// This creates TWO entries for one transaction (double-entry)
await this.generalLedgerService.createLedgerEntries([
  {
    // Credit entry (money going out)
    accountId: crAccount.id,
    creditAmount: dto.amount,
    debitAmount: 0,
    contraAccountId: drAccount.id,
  },
  {
    // Debit entry (money coming in)
    accountId: drAccount.id,
    debitAmount: dto.amount,
    creditAmount: 0,
    contraAccountId: crAccount.id,
  },
]);
```

---

### 2. Currency Deletion with Cascade

#### What Was Implemented

Added a comprehensive delete endpoint that removes a currency and **ALL** its related data across multiple tables.

#### New Endpoint

```http
DELETE /api/v1/accounts/delete/currency/:id
Authorization: Bearer <token>
```

#### What Gets Deleted

When you delete a currency, the system now automatically deletes:

1. **customer_currency_entries** - All currency transaction entries
2. **customer_currency_accounts** - All customer accounts for this currency
3. **journal_currency_entries** - All journal entries involving this currency
4. **currency_stocks** - Stock records for this currency
5. **currency_balances** - Balance summaries for this currency
6. **currency_relation** - User-currency relationships
7. **purchase_entries** - All purchase transactions in this currency
8. **selling_entries** - All sale transactions in this currency
9. **general_ledger** - All ledger entries for this currency (CURRENCY type)
10. **currency_account** - Currency account configurations
11. **currency_user** - The currency itself

#### Response Format

```json
{
  "success": true,
  "message": "Currency and all related data deleted successfully",
  "deletedCurrency": {
    "id": "currency-uuid",
    "name": "US Dollar",
    "code": "USD"
  }
}
```

#### Error Handling

- Returns `404` if currency not found
- Validates admin ownership before deletion
- All deletions happen in a **transaction** (all-or-nothing)
- Clears all related Redis cache

---

## Files Modified

### 1. [account.controller.ts](src/modules/account/interface/account.controller.ts)
- Added `DELETE /delete/currency/:id` endpoint
- Added imports for `Delete` and `Param` decorators

### 2. [account.service.ts](src/modules/account/application/account.service.ts)
- Added `deleteCurrency()` method
- Imported `DataSource` for transactions
- Imported `NotFoundException` for error handling
- Implemented cascade deletion logic with transaction safety

---

## Testing the Currency Deletion

### Step 1: Check Currency Exists
```bash
GET /api/v1/accounts/get/currencies?offset=1&limit=10
```

### Step 2: Delete Currency
```bash
DELETE /api/v1/accounts/delete/currency/{currency-id}
Authorization: Bearer YOUR_TOKEN
```

### Step 3: Verify Deletion
Check that related records are gone:
```sql
-- Should return 0 rows
SELECT * FROM customer_currency_accounts WHERE currency_id = '{currency-id}';
SELECT * FROM purchase_entries WHERE currency_dr_id = '{currency-id}';
SELECT * FROM selling_entries WHERE from_currency_id = '{currency-id}';
```

---

## Important Notes

### About Double-Entry Bookkeeping

**DO NOT** remove the double-entry logic. This is how accounting systems work globally. Instead:

1. **For Reports**: Filter by specific account when displaying ledgers
2. **For Balances**: Use `accountId` in WHERE clause when calculating balances
3. **For Transaction List**: Group by `sourceEntryId` to show unique transactions
4. **For Account Statement**: Use one account's perspective (filter by accountId)

### About the Cascade Delete

The cascade delete is **intentional and necessary** because:

- Prevents orphaned records in the database
- Maintains referential integrity
- Ensures clean data after currency removal
- Prevents foreign key constraint violations

**⚠️ Warning**: Deleting a currency is **irreversible**. All historical data will be lost.

Consider adding a "soft delete" feature if you need to maintain historical records:
```typescript
// Add to AddCurrencyEntity
@Column({ default: false })
isDeleted: boolean;

@Column({ nullable: true })
deletedAt: Date;
```

---

## Additional Recommendations

### 1. Add Confirmation Dialog in Frontend
```typescript
const confirmDelete = confirm(
  `Are you sure you want to delete "${currency.name}"? 
   This will permanently delete ALL related transactions, 
   accounts, and historical data. This action cannot be undone.`
);
```

### 2. Consider Soft Delete Instead
If you need to preserve historical data, implement soft delete:
- Mark currency as `isDeleted: true`
- Hide from dropdowns and new transactions
- Keep all historical records intact
- Allow "restore" functionality

### 3. Add Audit Logging
Log currency deletions for compliance:
```typescript
await auditLog.create({
  action: 'DELETE_CURRENCY',
  userId: adminId,
  details: { currencyId, currencyName, recordsDeleted: count }
});
```

---

## Summary

✅ **Issue 1 (Double Entries)**: Not a bug - working as designed per accounting standards

✅ **Issue 2 (Currency Deletion)**: Fully implemented with cascade delete across all related tables

Both issues have been properly addressed. The first "issue" is actually correct behavior that should be maintained. The second issue has been implemented with comprehensive cascade deletion.
