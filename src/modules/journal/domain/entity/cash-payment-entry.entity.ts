import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CustomerAccountEntity } from '../../../account/domain/entity/customer-account.entity';

@Entity('cash_payment_entries')
export class CashPaymentEntryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: string;

  @Column({type: 'varchar'})
  crAccount: string;

  @ManyToOne(() => CustomerAccountEntity, { eager: true })
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

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({ name: 'admin_id', type: 'uuid', nullable: false })
  adminId: string;
}
