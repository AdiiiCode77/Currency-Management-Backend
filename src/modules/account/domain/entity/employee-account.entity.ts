import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('employee_accounts')
export class EmployeeAccountEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ name: 'father_name', nullable: true })
  fatherName: string;

  @Column({ nullable: true })
  cnic: string;

  @Column({ nullable: true })
  contact: string;

  @Column({ nullable: true })
  address: string;

  @Column({ name: 'monthly_salary', type: 'decimal', precision: 30, scale: 2, nullable: true })
  monthlySalary: number;

  @Column({ name: 'joining_date', type: 'date', nullable: true })
  joiningDate: Date;

  @Column({ name: 'admin_id', type: 'uuid', nullable: false })
  adminId: string;
}
