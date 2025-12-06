import { CustomerAccountEntity } from 'src/modules/account/domain/entity/customer-account.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';

@Entity('purchase_entries')
export class PurchaseEntryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'purchase_no',
    type: 'int',
    generated: 'increment',
  })
  purchaseNumber: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ name: 'currency_dr_id', type: 'uuid', nullable: false })
  currencyDrId: string;

  @Column({ name: 'manual_ref', nullable: true })
  manualRef: string;

  @Column({ name: 'customer_account_id' })
  customerAccountId: string;

  @ManyToOne(() => CustomerAccountEntity, { eager: true })
  @JoinColumn({ name: 'customer_account_id' })
  customerAccount: CustomerAccountEntity;

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
  amountCurrency: number;

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
  rate: number;

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
  amountPkr: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'admin_id', type: 'uuid', nullable: false })
  adminId: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
