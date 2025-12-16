import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum AdminType {
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin',
}

@Entity('admins')
export class AdminEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: AdminType,
    nullable: false,
  })
  type: AdminType;

  @Column({ type: 'uuid' })
  user_profile_id: string;
}

