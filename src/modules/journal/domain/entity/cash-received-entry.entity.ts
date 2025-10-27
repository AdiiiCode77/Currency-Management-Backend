import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CustomerAccountEntity } from 'src/modules/account/domain/entity/customer-account.entity';

@Entity('cash_received_entries')
export class CashReceivedEntryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: string;

  @ManyToOne(() => CustomerAccountEntity, { eager: true })
  @JoinColumn({ name: 'crAccountId' })
  crAccount: CustomerAccountEntity;

  @ManyToOne(() => CustomerAccountEntity, { eager: true })
  @JoinColumn({ name: 'drAccountId' })
  drAccount: CustomerAccountEntity;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({ name: 'admin_id', type: 'uuid', nullable: false })
  adminId: string;
}
