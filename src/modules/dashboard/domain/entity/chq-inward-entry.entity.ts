import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { CustomerAccountEntity } from 'src/modules/account/domain/entity/customer-account.entity';
import { AddChqRefBankEntity } from 'src/modules/account/domain/entity/add-chq-ref-bank.entity';

@Entity('chq_inward_entries')
export class ChqInwardEntryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  entryDate: string;

  @Column({ type: 'date' })
  chqDate: string;

  @Column({ type: 'date' })
  postingDate: string;

  @ManyToOne(() => CustomerAccountEntity, { eager: true })
  fromAccount: CustomerAccountEntity;

  @ManyToOne(() => CustomerAccountEntity, { eager: true })
  toAccount: CustomerAccountEntity;

  @Column({type: 'decimal',
    precision: 30,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number | null | undefined) =>
        value !== null && value !== undefined
          ? Number(value).toFixed(2)
          : '0.00',
      from: (value: string | null) =>
        value !== null ? parseFloat(value) : 0,
    }, })
  amount: number;

  @ManyToOne(() => AddChqRefBankEntity, { eager: true })
  chqBankRef: AddChqRefBankEntity;

  @Column()
  chqNumber: string;

  @Column()
  adminId: string;
}
