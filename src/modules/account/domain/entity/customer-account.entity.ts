import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('customer_accounts')
export class CustomerAccountEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  contact: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  address: string;

  @Column({ name: 'old_account_number', nullable: false })
  oldAccountNumber: string;

  @Column({ name: 'admin_id', type: 'uuid', nullable: false })
  adminId: string;
}
