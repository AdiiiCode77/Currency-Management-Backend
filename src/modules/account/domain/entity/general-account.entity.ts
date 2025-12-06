import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { AccountType } from '../enums/account-type.enum';

@Entity('general_accounts')
export class GeneralAccountEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'account_type', type: 'enum', enum: AccountType })
  accountType: AccountType;

  @Column({ nullable: false })
  name: string;

  @Column({ name: 'account_information', nullable: false })
  accountInformation: string;

  @Column({ name: 'admin_id', type: 'uuid', nullable: false })
  adminId: string;
}
