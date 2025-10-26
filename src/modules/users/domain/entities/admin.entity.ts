
import { adminTypes } from 'src/shared/enums/admin.enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity('admins')
export class AdminEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'text', enum: adminTypes, nullable: false })
  type: string;
  @Column({ type: 'uuid' })
  user_profile_id: string;
}
