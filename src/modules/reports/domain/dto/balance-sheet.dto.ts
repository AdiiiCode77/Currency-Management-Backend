export interface CurrencyBalance {
  currencyId: string;
  currencyName: string;
  currencyCode: string;
  totalDebit: number; // amount withdrawn from currency
  totalCredit: number; // amount deposited to currency
  balance: number; // net balance (credit - debit)
  lastUpdated: Date;
}

export interface CustomerBalance {
  customerId: string;
  customerName: string;
  contact: string;
  email: string;
  totalDebit: number; // amount owed to customer
  totalCredit: number; // amount customer owes
  balance: number; // net balance (credit - debit)
  balanceType: 'DEBIT' | 'CREDIT'; // who owes whom
}

export interface BankBalance {
  bankId: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  totalDebit: number; // money out from bank
  totalCredit: number; // money in to bank
  balance: number; // net balance (credit - debit)
  balanceType: 'DEBIT' | 'CREDIT';
}

export interface GeneralAccountBalance {
  accountId: string;
  accountName: string;
  accountType: string;
  totalDebit: number;
  totalCredit: number;
  balance: number;
  balanceType: 'DEBIT' | 'CREDIT';
}

export interface BalanceSheetSection {
  currencies: CurrencyBalance[];
  customers: CustomerBalance[];
  banks: BankBalance[];
  generalAccounts: GeneralAccountBalance[];
}

export interface BalanceSheetSummary {
  totalDebit: number;
  totalCredit: number;
  difference: number; // should be 0 for balanced sheet
  isBalanced: boolean;
  timestamp: Date;
}

export interface BalanceSheetResponse {
  assets: BalanceSheetSection; // what business owns/has
  liabilities: BalanceSheetSection; // what business owes
  summary: BalanceSheetSummary;
  dateRange?: {
    from?: Date;
    to?: Date;
  };
}

export interface DetailedBalanceSheetEntry {
  date: Date;
  entryType: string; // PURCHASE, SELLING, BANK_PAYMENT, BANK_RECEIPT, JOURNAL, CASH_PAYMENT, CASH_RECEIPT
  accountName: string;
  narration: string;
  debit: number;
  credit: number;
  balance: number;
  reference?: string; // CHQ no, S_No, etc.
}

export interface DetailedAccountLedger {
  accountId: string;
  accountName: string;
  accountType: string;
  entries: DetailedBalanceSheetEntry[];
  totalDebit: number;
  totalCredit: number;
  closingBalance: number;
}

export interface DetailedBalanceSheetResponse {
  summary: BalanceSheetSummary;
  accounts: DetailedAccountLedger[];
  dateRange?: {
    from?: Date;
    to?: Date;
  };
}
