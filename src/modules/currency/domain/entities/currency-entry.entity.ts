import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { PaymentType, EntryType } from '../dto/create-currency-entry.dto';
import { CustomerCurrencyAccountEntity } from './currencies-account.entity';
import { AddCurrencyEntity } from '../../../account/domain/entity/currency.entity';

@Entity('customer_currency_entries')
export class CustomerCurrencyEntryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'enum', enum: PaymentType })
  paymentType: PaymentType;

  @ManyToOne(() => CustomerCurrencyAccountEntity, { eager: true })
  @JoinColumn({ name: 'account_id' })
  account: CustomerCurrencyAccountEntity;

  @Column( {type: 'decimal',
    precision: 30,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number | null | undefined) =>
        value !== null && value !== undefined
          ? Number(value).toFixed(2)
          : '0.00', // safe fallback
      from: (value: string | null) =>
        value !== null ? parseFloat(value) : 0,
    },})
  amount: number;

  @Column( {type: 'decimal',
    precision: 30,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number | null | undefined) =>
        value !== null && value !== undefined
          ? Number(value).toFixed(2)
          : '0.00', // safe fallback
      from: (value: string | null) =>
        value !== null ? parseFloat(value) : 0,
    },})
  balance: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: EntryType })
  entryType: EntryType;

  @Column({ name: 'admin_id', type: 'uuid' })
  adminId: string;
  
  @CreateDateColumn()
  created_at: Date;
}
