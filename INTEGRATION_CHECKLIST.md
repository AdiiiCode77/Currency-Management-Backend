# Balance Sheet Optimization - Integration Checklist

Follow these steps to integrate the optimization across your entry services.

## ✅ What's Already Done
- [x] Created `AccountBalanceEntity` - stores pre-calculated balances
- [x] Created `AccountLedgerEntity` - stores pre-sorted ledger with running balances
- [x] Created `BalanceCalculationService` - core calculation engine
- [x] Updated `ReportService` - now reads from materialized tables
- [x] Updated `JournalModule` - exports BalanceCalculationService
- [x] Updated `ReportsModule` - includes new entities
- [x] Created database migration

## 📋 Integration Tasks (DO THESE NEXT)

### Task 1: Update JournalService
**File:** `src/modules/journal/application/journal.service.ts`

```typescript
// ADD IMPORT
import { BalanceCalculationService } from './balance-calculation.service';

// ADD TO CONSTRUCTOR
constructor(
  @InjectRepository(JournalEntryEntity)
  private journalEntryRepository: Repository<JournalEntryEntity>,
  
  // ADD THIS LINE:
  private balanceCalculationService: BalanceCalculationService,
  
  // ... other dependencies
) {}

// UPDATE: createJournalEntry method
async createJournalEntry(dto: CreateJournalEntryDto, adminId: string) {
  const entry = await this.journalEntryRepository.save({
    ...dto,
    adminId,
  });

  // ADD THESE LINES AFTER SAVE:
  await this.balanceCalculationService.recalculateGeneralBalance(
    adminId,
    entry.drAccountId,
  );
  await this.balanceCalculationService.recalculateGeneralBalance(
    adminId,
    entry.crAccountId,
  );

  return entry;
}

// UPDATE: updateJournalEntry method (if exists)
async updateJournalEntry(id: string, dto: UpdateJournalEntryDto, adminId: string) {
  const entry = await this.journalEntryRepository.save({
    id,
    ...dto,
    adminId,
  });

  // ADD RECALCULATION:
  await this.balanceCalculationService.recalculateGeneralBalance(
    adminId,
    entry.drAccountId,
  );
  await this.balanceCalculationService.recalculateGeneralBalance(
    adminId,
    entry.crAccountId,
  );

  return entry;
}

// UPDATE: deleteJournalEntry method (if exists)
async deleteJournalEntry(id: string, adminId: string) {
  const entry = await this.journalEntryRepository.findOne({ where: { id, adminId } });
  
  if (entry) {
    await this.journalEntryRepository.delete({ id });
    
    // ADD RECALCULATION:
    await this.balanceCalculationService.recalculateGeneralBalance(
      adminId,
      entry.drAccountId,
    );
    await this.balanceCalculationService.recalculateGeneralBalance(
      adminId,
      entry.crAccountId,
    );
  }

  return entry;
}
```

### Task 2: Update BankPaymentService
**File:** `src/modules/journal/application/bank-payment.service.ts` (or similar)

```typescript
import { BalanceCalculationService } from './balance-calculation.service';

constructor(
  @InjectRepository(BankPaymentEntryEntity)
  private bankPaymentRepository: Repository<BankPaymentEntryEntity>,
  
  private balanceCalculationService: BalanceCalculationService,
  // ... other dependencies
) {}

async createBankPayment(dto: CreateBankPaymentEntryDto, adminId: string) {
  const entry = await this.bankPaymentRepository.save({
    ...dto,
    adminId,
  });

  // UPDATE BALANCES:
  await this.balanceCalculationService.recalculateBankBalance(
    adminId,
    entry.bankAccountId,
  );
  await this.balanceCalculationService.recalculateCustomerBalance(
    adminId,
    entry.drAccountId,
  );

  return entry;
}
```

### Task 3: Update BankReceiverService
**File:** Similar pattern as BankPaymentService

```typescript
async createBankReceiver(dto: CreateBankReceiverEntryDto, adminId: string) {
  const entry = await this.bankReceiverRepository.save({
    ...dto,
    adminId,
  });

  // UPDATE BALANCES:
  await this.balanceCalculationService.recalculateBankBalance(
    adminId,
    entry.bankAccountId,
  );
  await this.balanceCalculationService.recalculateCustomerBalance(
    adminId,
    entry.crAccountId,
  );

  return entry;
}
```

### Task 4: Update CashPaymentService
**File:** `src/modules/journal/application/cash-payment.service.ts` (or similar)

```typescript
async createCashPayment(dto: CreateCashPaymentEntryDto, adminId: string) {
  const entry = await this.cashPaymentRepository.save({
    ...dto,
    adminId,
  });

  // UPDATE BALANCES:
  // Cash paid to customer (dr account receives credit)
  if (entry.drAccountId) {
    await this.balanceCalculationService.recalculateCustomerBalance(
      adminId,
      entry.drAccountId,
    );
  }
  
  // Bank/Cash account giving out cash
  if (entry.crAccount) {
    await this.balanceCalculationService.recalculateBankBalance(
      adminId,
      entry.crAccount,
    );
  }

  return entry;
}
```

### Task 5: Update CashReceivedService
**File:** `src/modules/journal/application/cash-received.service.ts` (or similar)

```typescript
async createCashReceived(dto: CreateCashReceivedEntryDto, adminId: string) {
  const entry = await this.cashReceivedRepository.save({
    ...dto,
    adminId,
  });

  // UPDATE BALANCES:
  if (entry.crAccountId) {
    await this.balanceCalculationService.recalculateCustomerBalance(
      adminId,
      entry.crAccountId,
    );
  }
  
  if (entry.drAccount) {
    await this.balanceCalculationService.recalculateBankBalance(
      adminId,
      entry.drAccount,
    );
  }

  return entry;
}
```

### Task 6: Update SellingService
**File:** `src/modules/sale-purchase/application/selling.service.ts`

```typescript
import { BalanceCalculationService } from 'src/modules/journal/application/balance-calculation.service';

// In constructor:
constructor(
  @InjectRepository(SellingEntryEntity)
  private sellingEntryRepository: Repository<SellingEntryEntity>,
  
  private balanceCalculationService: BalanceCalculationService,
  // ... other deps
) {}

async createSelling(dto: CreateSellingEntryDto, adminId: string) {
  const entry = await this.sellingEntryRepository.save({
    ...dto,
    adminId,
  });

  // UPDATE CURRENCY BALANCE:
  await this.balanceCalculationService.recalculateCurrencyBalance(
    adminId,
    entry.fromCurrencyId,
  );

  return entry;
}
```

### Task 7: Update PurchaseService
**File:** `src/modules/sale-purchase/application/purchase.service.ts`

```typescript
import { BalanceCalculationService } from 'src/modules/journal/application/balance-calculation.service';

constructor(
  @InjectRepository(PurchaseEntryEntity)
  private purchaseEntryRepository: Repository<PurchaseEntryEntity>,
  
  private balanceCalculationService: BalanceCalculationService,
  // ... other deps
) {}

async createPurchase(dto: CreatePurchaseEntryDto, adminId: string) {
  const entry = await this.purchaseEntryRepository.save({
    ...dto,
    adminId,
  });

  // UPDATE CURRENCY BALANCE:
  await this.balanceCalculationService.recalculateCurrencyBalance(
    adminId,
    entry.currencyDrId,
  );

  return entry;
}
```

## 🗄️ Database Setup

Run the migration to create tables:
```bash
npm run typeorm migration:run
```

Or manually:
```sql
-- account_balances table
CREATE TABLE account_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  adminId VARCHAR NOT NULL,
  accountId VARCHAR NOT NULL,
  accountType ENUM('CURRENCY', 'CUSTOMER', 'BANK', 'GENERAL') NOT NULL,
  accountName VARCHAR NOT NULL,
  accountMetadata VARCHAR,
  totalDebit DECIMAL(18,6) DEFAULT 0,
  totalCredit DECIMAL(18,6) DEFAULT 0,
  balance DECIMAL(18,6) DEFAULT 0,
  balanceType ENUM('DEBIT', 'CREDIT'),
  entryCount INTEGER DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  lastEntryDate TIMESTAMP,
  UNIQUE(adminId, accountId, accountType)
);

CREATE INDEX idx_account_balances_admin_account 
ON account_balances(adminId, accountId, accountType);

-- account_ledgers table (similar)
CREATE TABLE account_ledgers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  adminId VARCHAR NOT NULL,
  accountId VARCHAR NOT NULL,
  accountType ENUM('CURRENCY', 'CUSTOMER', 'BANK', 'GENERAL') NOT NULL,
  accountName VARCHAR NOT NULL,
  date DATE NOT NULL,
  entryType ENUM('JOURNAL', 'BANK_PAYMENT', 'BANK_RECEIPT', 'CASH_PAYMENT', 'CASH_RECEIPT', 'SELLING', 'PURCHASE') NOT NULL,
  narration VARCHAR NOT NULL,
  debit DECIMAL(18,6) DEFAULT 0,
  credit DECIMAL(18,6) DEFAULT 0,
  balance DECIMAL(18,6) DEFAULT 0,
  reference VARCHAR,
  cumulativeDebit DECIMAL(18,6) DEFAULT 0,
  cumulativeCredit DECIMAL(18,6) DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sourceEntryId VARCHAR,
  sourceEntryType ENUM('JOURNAL', 'BANK_PAYMENT', 'BANK_RECEIVER', 'CASH_PAYMENT', 'CASH_RECEIVED')
);

CREATE INDEX idx_account_ledgers_admin_account_date 
ON account_ledgers(adminId, accountId, accountType, date);
```

## 🧪 Testing

After integration, test that balances are updating:

```typescript
// 1. Create an entry
const entry = await journalService.createJournalEntry({...}, adminId);

// 2. Verify balance was updated
const balance = await balanceCalculationService.getAccountBalance(adminId, entry.drAccountId);
console.log('Balance updated:', balance);

// 3. Get balance sheet (should be fast now)
const sheet = await reportService.getBalanceSheet(adminId);
console.log('Balance sheet (should be <50ms):', sheet);
```

## ⚠️ Important Notes

1. **Module Imports**: Ensure JournalModule is imported in modules that need BalanceCalculationService
2. **Async Operations**: Balance recalculation is async - await it!
3. **Delete Handling**: Remember to recalculate after deleting entries
4. **Bulk Operations**: If doing bulk inserts, recalculate after all inserts complete
5. **Historical Data**: Run backfill script for existing entries (optional, only if not running first time on new DB)

## 📊 Verify Performance

After integration, run this to confirm speed:

```typescript
console.time('balance-sheet');
const sheet = await reportService.getBalanceSheet(adminId);
console.timeEnd('balance-sheet');

// Should print: balance-sheet: <50ms
```

Compare with old method (if still available) to see speedup.

## 🔄 Next Steps After Integration

1. ✅ Integrate all 7 services above
2. ✅ Run database migration
3. ✅ Test balance calculations
4. ✅ Performance test balance sheet endpoints
5. ✅ Deploy to production
6. ⚠️ Monitor: Watch for any balance discrepancies
7. ✅ (Optional) Archive old calculation methods once stable

## 💾 Backfill Script (For Existing Data)

If you have historical entries, run this one-time:

```typescript
async function backfillMaterializedTables(adminId: string) {
  const balanceCalculationService = // ... get service
  
  // Customers
  const customers = await customerRepository.find({ where: { adminId } });
  for (const customer of customers) {
    await balanceCalculationService.recalculateCustomerBalance(adminId, customer.id);
  }
  
  // Banks
  const banks = await bankRepository.find({ where: { adminId } });
  for (const bank of banks) {
    await balanceCalculationService.recalculateBankBalance(adminId, bank.id);
  }
  
  // General accounts
  const generals = await generalRepository.find({ where: { adminId } });
  for (const general of generals) {
    await balanceCalculationService.recalculateGeneralBalance(adminId, general.id);
  }
  
  // Currencies
  const currencies = await currencyRepository.find({ where: { adminId } });
  for (const currency of currencies) {
    await balanceCalculationService.recalculateCurrencyBalance(adminId, currency.currencyId);
  }
  
  console.log('✅ Backfill complete');
}
```

---

**Questions?** Refer to `BALANCE_SHEET_OPTIMIZATION.md` for architecture details.
