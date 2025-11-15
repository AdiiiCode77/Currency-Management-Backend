import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('currency_user')
export class AddCurrencyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  code: string;

  @Column({
    type: 'decimal',
    precision: 10,  // total digits
    scale: 2,       // digits after decimal
    nullable: true,
  })
  price: number;  

  @Column({ name: 'admin_id', type: 'uuid', nullable: false })
  adminId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
