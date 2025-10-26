import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('employee_accounts')
export class EmployeeAccountEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ name: 'father_name', nullable: false })
  fatherName: string;

  @Column({ nullable: false, unique: true })
  cnic: string;

  @Column({ nullable: false })
  contact: string;

  @Column({ nullable: false })
  address: string;

  @Column({ name: 'monthly_salary', type: 'decimal', precision: 10, scale: 2, nullable: false })
  monthlySalary: number;

  @Column({ name: 'joining_date', type: 'date', nullable: false })
  joiningDate: Date;

  @Column({ name: 'admin_id', type: 'uuid', nullable: false })
  adminId: string;
}
