import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { PaymentType, EntryType } from '../dto/create-currency-entry.dto';
import { CustomerCurrencyAccountEntity } from './currencies-account.entity';

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

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: EntryType })
  entryType: EntryType;

  @Column({ name: 'admin_id', type: 'uuid' })
  adminId: string;
  
  @CreateDateColumn()
  created_at: Date;
}
