import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CustomerAccountEntity } from '../../../account/domain/entity/customer-account.entity';
import { PaymentType } from '../enums/payment-type.enum';

@Entity('journal_entries')
export class JournalEntryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({
    type: 'enum',
    enum: PaymentType,
  })
  paymentType: PaymentType;

  @ManyToOne(() => CustomerAccountEntity, { eager: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'crAccountId' })
  crAccount: CustomerAccountEntity;

  @ManyToOne(() => CustomerAccountEntity, { eager: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'drAccountId' })
  drAccount: CustomerAccountEntity;

  @Column({type: 'decimal',
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

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  chqNo: string;

  @Column({ name: 'admin_id', type: 'uuid', nullable: false })
  adminId: string;

}
