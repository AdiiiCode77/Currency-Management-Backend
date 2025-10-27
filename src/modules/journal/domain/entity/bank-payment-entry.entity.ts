import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CustomerAccountEntity } from 'src/modules/account/domain/entity/customer-account.entity';

@Entity('bank_payment_entries')
export class BankPaymentEntryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: Date;

  // Credit Account (Cr)
  @ManyToOne(() => CustomerAccountEntity, { eager: true })
  @JoinColumn({ name: 'crAccountId' })
  crAccount: CustomerAccountEntity;

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
