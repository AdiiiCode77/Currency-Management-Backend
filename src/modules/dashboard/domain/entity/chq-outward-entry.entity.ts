import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { CustomerAccountEntity } from 'src/modules/account/domain/entity/customer-account.entity';
import { AddChqRefBankEntity } from 'src/modules/account/domain/entity/add-chq-ref-bank.entity';

@Entity('chq_outward_entries')
export class ChqOutwardEntryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  entryDate: string;

  @Column({ type: 'date' })
  chqDate: string;

  @ManyToOne(() => CustomerAccountEntity, { eager: true })
  fromAccount: CustomerAccountEntity;

  @ManyToOne(() => CustomerAccountEntity, { eager: true })
  toAccount: CustomerAccountEntity;

  @Column({ type: 'numeric' })
  amount: number;

  @ManyToOne(() => AddChqRefBankEntity, { eager: true })
  chqBankRef: AddChqRefBankEntity;

  @Column()
  chqNumber: string;

  @Column()
  adminId: string;
}
