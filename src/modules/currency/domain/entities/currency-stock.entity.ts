import { AddCurrencyEntity } from '../../../account/domain/entity/currency.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

@Entity('currency_stocks')
export class CurrencyStockEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'currency_id', type: 'uuid', nullable: false })
  currencyId: string;

  @Column({ name: 'admin_id', type: 'uuid', nullable: false })
  adminId: string;

  @ManyToOne(() => AddCurrencyEntity, { eager: true })
  @JoinColumn({ name: 'currency_id' })
  currency: AddCurrencyEntity;

  @Column({
    name: 'stock_amount_pkr',
    type: 'decimal',
    precision: 30,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number | null | undefined) =>
        value !== null && value !== undefined
          ? Number(value).toFixed(2)
          : '0.00',
      from: (value: string | null) => (value !== null ? parseFloat(value) : 0),
    },
  })
  stockAmountPkr: number;

  @Column({
    name: 'currency_amount',
    type: 'decimal',
    precision: 30,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number | null | undefined) =>
        value !== null && value !== undefined
          ? Number(value).toFixed(2)
          : '0.00',
      from: (value: string | null) => (value !== null ? parseFloat(value) : 0),
    },
  })
  currencyAmount: number;

  @Column({
    name: 'rate',
    type: 'decimal',
    precision: 18,
    scale: 6,
    default: 0,
    transformer: {
      to: (value: number | null | undefined) =>
        value !== null && value !== undefined
          ? Number(value).toFixed(6)
          : '0.000000',
      from: (value: string | null) => (value !== null ? parseFloat(value) : 0),
    },
  })
  rate: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
