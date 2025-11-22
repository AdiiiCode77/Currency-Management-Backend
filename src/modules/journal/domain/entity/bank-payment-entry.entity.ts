import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CustomerAccountEntity } from 'src/modules/account/domain/entity/customer-account.entity';
import { BankAccountEntity } from 'src/modules/account/domain/entity/bank-account.entity';

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

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  chqNo?: string;

  @Column({ name: 'admin_id', type: 'uuid', nullable: false })
  adminId: string;
}
