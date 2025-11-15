import { CurrencyAccountEntity } from 'src/modules/account/domain/entity/currency-account.entity';
import { CustomerAccountEntity } from 'src/modules/account/domain/entity/customer-account.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
  } from 'typeorm';
  
  @Entity('purchase_entries')
  export class PurchaseEntryEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ type: 'date' })
    date: Date;
  
    @ManyToOne(() => CurrencyAccountEntity, { eager: true })
    @JoinColumn({ name: 'currency_dr_id' })
    currencyDr: CurrencyAccountEntity;
  
    @Column({ name: 'manual_ref', nullable: true })
    manualRef: string;
  
    @ManyToOne(() => CustomerAccountEntity, { eager: true })
    @JoinColumn({ name: 'customer_account_id' })
    customerAccount: CustomerAccountEntity;
  
    @Column('decimal', { precision: 12, scale: 2 })
    amountCurrency: number;
  
    @Column('decimal', { precision: 12, scale: 4 })
    rate: number;
  
    @Column('decimal', { precision: 12, scale: 2 })
    amountPkr: number;
  
    @Column({ type: 'text', nullable: true })
    description: string;
  
    @Column({ name: 'admin_id', type: 'uuid', nullable: false })
    adminId: string;
  
    @CreateDateColumn()
    created_at: Date;
  
    @UpdateDateColumn()
    updated_at: Date;
  }
  