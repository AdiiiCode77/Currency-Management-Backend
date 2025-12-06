import { AddCurrencyEntity } from 'src/modules/account/domain/entity/currency.entity';
import { UserEntity } from 'src/modules/users/domain/entities/user.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
  } from 'typeorm';

@Entity('currency_relation')

export class CurrencyRelationEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'currency_id', type: 'uuid', nullable: false })
    currencyId: string;

    @Column({ name: 'user_id', type: 'uuid', nullable: false })
    userId: string;

    @Column({ name: 'admin_id', type: 'uuid', nullable: false })
    adminId: string;

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
    balance: number;

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
  balancePkr: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

}