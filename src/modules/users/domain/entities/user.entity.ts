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

  // @Column({
  //   name: 'profile',
  //   type: 'text',
  //   default: 'https://cdn-icons-png.flaticon.com/512/8847/8847419.png',
  // })
  // profile: string;

  @Column({ name: 'block_status', type: 'bool', default: false })
  block_status: boolean;

  @Column({ name: 'last_login', type: Date, nullable: true })
  last_login: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
