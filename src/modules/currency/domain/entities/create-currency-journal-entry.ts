import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { PaymentType } from '../dto/create-currency-entry.dto';
import { CustomerCurrencyAccountEntity } from './currencies-account.entity';
import { AddCurrencyEntity } from '../../../account/domain/entity/currency.entity';

@Entity('journal_currency_entries')
export class JournalCurrencyEntryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'enum', enum: PaymentType })
  paymentType: PaymentType;

  @ManyToOne(() => CustomerCurrencyAccountEntity, { eager: true })
  @JoinColumn({ name: 'Cr_account_id' })
  CrAccount: CustomerCurrencyAccountEntity;

  @ManyToOne(() => CustomerCurrencyAccountEntity, { eager: true })
  @JoinColumn({ name: 'Dr_account_id' })
  DrAccount: CustomerCurrencyAccountEntity;

  @Column({
    type: 'decimal',
    precision: 30,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number | null | undefined) =>
        value !== null && value !== undefined
          ? Number(value).toFixed(2)
          : '0.00', // safe fallback
      from: (value: string | null) => (value !== null ? parseFloat(value) : 0),
    },
  })
  amount: number;

  @Column({
    type: 'decimal',
    precision: 30,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number | null | undefined) =>
        value !== null && value !== undefined
          ? Number(value).toFixed(2)
          : '0.00', // safe fallback
      from: (value: string | null) => (value !== null ? parseFloat(value) : 0),
    },
  })
  balance: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'admin_id', type: 'uuid' })
  adminId: string;

  @ManyToOne(() => AddCurrencyEntity, { eager: true })
  @JoinColumn({ name: 'currency_id' })
  currency: AddCurrencyEntity;

  @CreateDateColumn()
  created_at: Date;
}
