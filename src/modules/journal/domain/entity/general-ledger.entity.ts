import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * General Ledger - Centralized Transaction Log
 * This entity maintains a record of ALL monetary transactions across the system
 * Makes it easy to generate ledgers, track all financial movements, and maintain audit trail
 */
@Entity('general_ledger')
@Index(['adminId', 'accountId', 'transactionDate'])
@Index(['adminId', 'entryType'])
@Index(['adminId', 'transactionDate'])
@Index(['sourceEntryId', 'entryType'])
export class GeneralLedgerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Admin who owns this transaction
  @Column({ name: 'admin_id', type: 'uuid' })
  adminId: string;

  // Transaction date
  @Column({ name: 'transaction_date', type: 'date' })
  transactionDate: Date;

  // Account involved in the transaction
  @Column({ name: 'account_id', type: 'uuid' })
  accountId: string;

  @Column({ name: 'account_name', type: 'varchar', length: 255 })
  accountName: string;

  // Type of account: CUSTOMER, BANK, CURRENCY, GENERAL
  @Column({
    name: 'account_type',
    type: 'enum',
    enum: ['CUSTOMER', 'BANK', 'CURRENCY', 'GENERAL'],
  })
  accountType: 'CUSTOMER' | 'BANK' | 'CURRENCY' | 'GENERAL';

  // Type of entry that created this transaction
  @Column({
    name: 'entry_type',
    type: 'enum',
    enum: [
      'SALE',
      'PURCHASE',
      'JOURNAL',
      'BANK_PAYMENT',
      'BANK_RECEIPT',
      'CASH_PAYMENT',
      'CASH_RECEIPT',
      'CHQ_INWARD',
      'CHQ_OUTWARD',
      'CURRENCY_ENTRY',
      'CURRENCY_JOURNAL',
    ],
  })
  entryType:
    | 'SALE'
    | 'PURCHASE'
    | 'JOURNAL'
    | 'BANK_PAYMENT'
    | 'BANK_RECEIPT'
    | 'CASH_PAYMENT'
    | 'CASH_RECEIPT'
    | 'CHQ_INWARD'
    | 'CHQ_OUTWARD'
    | 'CURRENCY_ENTRY'
    | 'CURRENCY_JOURNAL';

  // Reference to the original entry
  @Column({ name: 'source_entry_id', type: 'uuid' })
  sourceEntryId: string;

  // Reference number (like sale number, purchase number, cheque number, etc.)
  @Column({ name: 'reference_number', type: 'varchar', length: 100, nullable: true })
  referenceNumber: string;

  // Debit amount in PKR
  @Column({
    name: 'debit_amount',
    type: 'decimal',
    precision: 30,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number | null | undefined) =>
        value !== null && value !== undefined ? Number(value).toFixed(2) : '0.00',
      from: (value: string | null) => (value !== null ? parseFloat(value) : 0),
    },
  })
  debitAmount: number;

  // Credit amount in PKR
  @Column({
    name: 'credit_amount',
    type: 'decimal',
    precision: 30,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number | null | undefined) =>
        value !== null && value !== undefined ? Number(value).toFixed(2) : '0.00',
      from: (value: string | null) => (value !== null ? parseFloat(value) : 0),
    },
  })
  creditAmount: number;

  // For foreign currency transactions
  @Column({
    name: 'currency_amount',
    type: 'decimal',
    precision: 30,
    scale: 2,
    nullable: true,
    transformer: {
      to: (value: number | null | undefined) =>
        value !== null && value !== undefined ? Number(value).toFixed(2) : null,
      from: (value: string | null) => (value !== null ? parseFloat(value) : null),
    },
  })
  currencyAmount: number;

  @Column({ name: 'currency_code', type: 'varchar', length: 10, nullable: true })
  currencyCode: string;

  @Column({
    name: 'exchange_rate',
    type: 'decimal',
    precision: 30,
    scale: 6,
    nullable: true,
    transformer: {
      to: (value: number | null | undefined) =>
        value !== null && value !== undefined ? Number(value).toFixed(6) : null,
      from: (value: string | null) => (value !== null ? parseFloat(value) : null),
    },
  })
  exchangeRate: number;

  // Description/Narration
  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  // Payment type (for journal entries)
  @Column({ name: 'payment_type', type: 'varchar', length: 50, nullable: true })
  paymentType: string;

  // Counter account (the other side of the transaction)
  @Column({ name: 'contra_account_id', type: 'uuid', nullable: true })
  contraAccountId: string;

  @Column({ name: 'contra_account_name', type: 'varchar', length: 255, nullable: true })
  contraAccountName: string;

  // Running balance after this transaction (can be calculated or stored)
  @Column({
    name: 'running_balance',
    type: 'decimal',
    precision: 30,
    scale: 2,
    nullable: true,
    transformer: {
      to: (value: number | null | undefined) =>
        value !== null && value !== undefined ? Number(value).toFixed(2) : null,
      from: (value: string | null) => (value !== null ? parseFloat(value) : null),
    },
  })
  runningBalance: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
