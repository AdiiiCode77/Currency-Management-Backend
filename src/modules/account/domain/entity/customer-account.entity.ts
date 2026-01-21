import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('customer_accounts')
export class CustomerAccountEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true, default: '' })
  contact: string;

  @Column({ nullable: true, default: '' })
  email: string;

  @Column({ nullable: true, default: '' })
  address: string;

  @Column({ name: 'old_account_number', nullable: true, default: '' })
  oldAccountNumber: string;

  @Column({ name: 'admin_id', type: 'uuid', nullable: false })
  adminId: string;
}
