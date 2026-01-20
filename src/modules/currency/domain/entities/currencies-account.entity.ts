import { AddCurrencyEntity } from '../../../account/domain/entity/currency.entity';
import { AccountType } from '../../../account/domain/enums/account-type.enum';
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

    @Column({
      type: 'decimal',
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
      },
    })
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
  