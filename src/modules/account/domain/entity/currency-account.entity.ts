import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { AddCurrencyEntity } from './currency.entity';

@Entity('currency_account')
export class CurrencyAccountEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  currencyAccountName: string;

  @Column()
  salePurchaseCode: string;

  @Column()
  formulaType: string;

  @Column({ name: 'admin_id', type: 'uuid', nullable: false })
  adminId: string;

  @ManyToOne(() => AddCurrencyEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'currencyId' })
  currency: AddCurrencyEntity;

  @Column()
  currencyId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
