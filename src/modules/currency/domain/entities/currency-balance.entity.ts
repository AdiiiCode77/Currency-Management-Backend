import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AddCurrencyEntity } from '../../../account/domain/entity/currency.entity';

/**
 * Currency Balance Summary Table
 * Maintains one record per currency per admin
 * Automatically updated when sales/purchases are made
 */
@Entity('currency_balances')
@Unique(['currencyId', 'adminId'])
@Index(['adminId'])
@Index(['currencyId'])
export class CurrencyBalanceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'currency_id', type: 'uuid' })
  currencyId: string;

  @ManyToOne(() => AddCurrencyEntity, { eager: true })
  @JoinColumn({ name: 'currency_id' })
  currency: AddCurrencyEntity;

  @Column({ name: 'admin_id', type: 'uuid' })
  adminId: string;

  // Balance in PKR
  @Column({
    name: 'balance_pkr',
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
  balancePkr: number;

  // Balance in Currency
  @Column({
    name: 'balance_currency',
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
  balanceCurrency: number;

  // Average rate calculated from sales and purchases
  @Column({
    name: 'avg_rate',
    type: 'decimal',
    precision: 30,
    scale: 6,
    default: 0,
    transformer: {
      to: (value: number | null | undefined) =>
        value !== null && value !== undefined ? Number(value).toFixed(6) : '0.000000',
      from: (value: string | null) => (value !== null ? parseFloat(value) : 0),
    },
  })
  avgRate: number;

  // Total sales count for this currency
  @Column({ name: 'total_sales', type: 'int', default: 0 })
  totalSales: number;

  // Total purchases count for this currency
  @Column({ name: 'total_purchases', type: 'int', default: 0 })
  totalPurchases: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
