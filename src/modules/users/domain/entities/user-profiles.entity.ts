import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
  ManyToOne,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { UserTypeEntity } from './user-type.entity';

@Entity('user_profiles')
@Index(['user_id', 'user_type_id'])
export class UserProfileEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'uuid' })
  user_type_id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => UserTypeEntity)
  @JoinColumn({ name: 'user_type_id' })
  userType: UserTypeEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
