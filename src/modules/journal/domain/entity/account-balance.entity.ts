import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Materialized Account Balance
 * Pre-calculated balance for each account to avoid expensive runtime queries
 * Updated whenever an entry is created/modified
 */
@Entity('account_balances')
@Index(['adminId', 'accountId', 'accountType'])
@Index(['adminId'])
export class AccountBalanceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  adminId: string;

  @Column()
  accountId: string;

  @Column({ type: 'enum', enum: ['CURRENCY', 'CUSTOMER', 'BANK', 'GENERAL'] })
  accountType: 'CURRENCY' | 'CUSTOMER' | 'BANK' | 'GENERAL';

  @Column('varchar')
  accountName: string;

  // For currencies: name, For customers/banks: contact/accountNumber
  @Column({ nullable: true })
  accountMetadata: string;

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  totalDebit: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  totalCredit: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  balance: number;

  @Column({ nullable: true })
  balanceType: 'DEBIT' | 'CREDIT'; // Direction of balance

  @Column({ type: 'integer', default: 0 })
  entryCount: number; // Total number of entries for this account

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Optional: Store last entry timestamp for reference
  @Column({ nullable: true })
  lastEntryDate: Date;
}
