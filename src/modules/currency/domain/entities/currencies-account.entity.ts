import { AccountType } from 'src/modules/account/domain/enums/account-type.enum';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  
  @Entity('customer_currency_accounts')
  export class CustomerCurrencyAccountEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({
      type: 'enum',
      enum: AccountType,
    })
    accountType: AccountType;
  
    @Column({ type: 'varchar' })
    name: string;
  
    @Column({ type: 'text', nullable: true })
    accountInfo: string;
  
    @Column({ name: 'admin_id', type: 'uuid' })
    adminId: string;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    balance: number;    

    @CreateDateColumn()
    created_at: Date;
  
    @UpdateDateColumn()
    updated_at: Date;
  }
  