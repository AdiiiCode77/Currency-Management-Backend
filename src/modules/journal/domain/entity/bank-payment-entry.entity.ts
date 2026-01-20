import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CustomerAccountEntity } from '../../../account/domain/entity/customer-account.entity';
import { BankAccountEntity } from '../../../account/domain/entity/bank-account.entity';

@Entity('bank_payment_entries')
export class BankPaymentEntryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: Date;

  // Credit Account (Cr)
  @ManyToOne(() => BankAccountEntity, { eager: true })
  @JoinColumn({ name: 'bankAccountId' })
  crAccount: BankAccountEntity;

  // Debit Account (Dr)
  @ManyToOne(() => CustomerAccountEntity, { eager: true })
  @JoinColumn({ name: 'drAccountId' })
  drAccount: CustomerAccountEntity;

  @Column({ type: 'decimal',
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
    }, })
  amount: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  chqNo?: string;

  @Column({ name: 'admin_id', type: 'uuid', nullable: false })
  adminId: string;
}
