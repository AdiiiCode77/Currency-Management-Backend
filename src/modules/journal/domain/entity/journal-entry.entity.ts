import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CustomerAccountEntity } from 'src/modules/account/domain/entity/customer-account.entity';
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

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  chqNo: string;

  @Column({ type: 'uuid' })
  adminId: string;

}
