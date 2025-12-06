import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class OtpEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: false })
  code: string;

  @Column({ type: 'uuid', nullable: false })
  userId: string;
}
