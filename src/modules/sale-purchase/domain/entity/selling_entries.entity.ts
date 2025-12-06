import { CurrencyAccountEntity } from 'src/modules/account/domain/entity/currency-account.entity';
import { AddCurrencyEntity } from 'src/modules/account/domain/entity/currency.entity';
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
  @Entity('selling_entries')
  export class SellingEntryEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ type: 'date' })
    date: Date;
  
    @Column({ name: 'from_currency_id', type: 'uuid', nullable: false })
    fromCurrencyId: string;

    @ManyToOne(() => CurrencyAccountEntity, { eager: true })
    @JoinColumn({ name: 'from_currency_id' })
    fromCurrency: AddCurrencyEntity;
  
    @Column({ name: 's_no', nullable: true })
    sNo: string;
  
    @Column({type: 'decimal',
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
    avgRate: number;
  
    @Column({ name: 'manual_ref', nullable: true })
    manualRef: string;
  
    @ManyToOne(() => CustomerAccountEntity, { eager: true })
    @JoinColumn({ name: 'customer_account_id' })
    customerAccount: CustomerAccountEntity;
  
    @Column({type: 'decimal',
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
    amountCurrency: number;
  
    @Column({type: 'decimal',
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
    rate: number;
  
    @Column({type: 'decimal',
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
    amountPkr: number;
  
    @Column({type: 'decimal',
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
    margin: number;
  
    @Column({type: 'decimal',
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
    pl: number;
  
    @Column({ type: 'text', nullable: true })
    description: string;
  
    @Column({ name: 'admin_id', type: 'uuid', nullable: false })
    adminId: string;
  
    @CreateDateColumn()
    created_at: Date;
  
    @UpdateDateColumn()
    updated_at: Date;
  }
  