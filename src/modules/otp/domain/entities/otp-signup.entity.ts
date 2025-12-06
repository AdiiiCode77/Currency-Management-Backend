import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class OtpSignupEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: false })
  code: string;

  @Column({ type: 'text', nullable: true })
  email: string;
}
