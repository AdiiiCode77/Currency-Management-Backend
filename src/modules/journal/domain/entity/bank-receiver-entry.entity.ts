import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CustomerAccountEntity } from '../../../account/domain/entity/customer-account.entity';
import { BankAccountEntity } from '../../../account/domain/entity/bank-account.entity';

@Entity('bank_receiver_entries')
export class BankReceiverEntryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: string;

  @ManyToOne(() => CustomerAccountEntity, { eager: true })
  @JoinColumn({ name: 'crAccountId' })
  crAccount: CustomerAccountEntity;

  @ManyToOne(() => BankAccountEntity, { eager: true })
  @JoinColumn({ name: 'bankAccountId' })
  drAccount: BankAccountEntity;

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
    },})
  amount: number;

  @Column({ type: 'varchar', length: 255 })
  branchCode: string;
  
  @Column({ name: 'admin_id', type: 'uuid', nullable: false })
  adminId: string;
}
