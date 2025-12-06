import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserProfileEntity } from './user-profiles.entity';
@Entity('customers')
export class CustomerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'int', default: 0 })
  dateOfBirth: Date;
  @Column({ type: 'uuid' })
  user_profile_id: string;
  @ManyToOne(() => UserProfileEntity, { eager: true })
  @JoinColumn({ name: 'user_profile_id' })
  userProfile: UserProfileEntity;
}
