import { AddCurrencyEntity } from 'src/modules/account/domain/entity/currency.entity';
import { AccountType } from 'src/modules/account/domain/enums/account-type.enum';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
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

    @Column({ type: 'int', default: 0})
    balance: number;
    
    @ManyToOne(() => AddCurrencyEntity, { eager: true })
    @JoinColumn({ name: 'currency_id' })
    currency: AddCurrencyEntity;
    
    @Column({ name: 'currency_id', type: 'uuid', nullable: true })
    currencyId: string; 

    @CreateDateColumn()
    created_at: Date;
  
    @UpdateDateColumn()
    updated_at: Date;
  }
  