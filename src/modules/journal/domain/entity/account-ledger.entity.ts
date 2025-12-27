import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * Materialized Account Ledger
 * Pre-calculated ledger entries with running balances
 * Eliminates need to fetch and sort entries at runtime
 * Updated whenever an entry is created/modified
 */
@Entity('account_ledgers')
@Index(['adminId', 'accountId', 'accountType', 'date'])
@Index(['adminId', 'accountId'])
@Index(['adminId', 'date'])
export class AccountLedgerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  adminId: string;

  @Column()
  accountId: string;

  @Column({ type: 'enum', enum: ['CURRENCY', 'CUSTOMER', 'BANK', 'GENERAL'] })
  accountType: 'CURRENCY' | 'CUSTOMER' | 'BANK' | 'GENERAL';

  @Column()
  accountName: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({
    type: 'enum',
    enum: ['JOURNAL', 'BANK_PAYMENT', 'BANK_RECEIPT', 'CASH_PAYMENT', 'CASH_RECEIPT', 'SELLING', 'PURCHASE'],
  })
  entryType: string;

  @Column()
  narration: string;

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  debit: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  credit: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  balance: number; // Running balance at this point

  @Column({ nullable: true })
  reference: string; // CHQ no, S_no, etc

  // For quick filtering and balance calculations
  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  cumulativeDebit: number; // Total debit up to this date

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  cumulativeCredit: number; // Total credit up to this date

  @CreateDateColumn()
  createdAt: Date;

  // Link to original entry for reference
  @Column({ nullable: true })
  sourceEntryId: string;

  @Column({ nullable: true })
  sourceEntryType: 'JOURNAL' | 'BANK_PAYMENT' | 'BANK_RECEIVER' | 'CASH_PAYMENT' | 'CASH_RECEIVED';
}
