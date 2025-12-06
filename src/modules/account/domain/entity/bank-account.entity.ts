import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('bank_accounts')
export class BankAccountEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'bank_name', nullable: false })
  bankName: string;

  @Column({ name: 'account_holder', nullable: false })
  accountHolder: string;

  @Column({ name: 'account_number', nullable: false })
  accountNumber: string;

  @Column({ nullable: false })
  contact: string;

  @Column({ nullable: false })
  address: string;

  @Column({ name: 'old_account_id', nullable: false })
  oldAccountId: string;

  @Column({ name: 'admin_id', type: 'uuid', nullable: false })
  adminId: string;
}
