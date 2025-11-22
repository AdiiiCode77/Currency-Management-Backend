import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', nullable: true, default: null })
  email: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', nullable: true })
  phone: string;

  @Column({ name: 'password', type: 'varchar', nullable: true })
  password: string;

  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Column({ name: 'email_is_verified', type: 'boolean', default: false })
  email_is_verified: boolean;


  @Column({ name: 'block_status', type: 'bool', default: false })
  block_status: boolean;

  @Column({ type: 'int', default: 0 })
  account_balance: number;

  @Column({type: "varchar", default: "PKR"})
  balance_in: string

  @Column({ name: 'last_login', type: Date, nullable: true })
  last_login: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
