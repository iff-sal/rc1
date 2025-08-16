import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Department } from '../departments/department.entity';
import { Appointment } from '../appointments/appointment.entity'; // Assuming Appointments module exists or will exist

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false }) // Changed to NOT NULL based on db_dump.sql context [1]
  department_id: string;

  @Column({ nullable: false }) // Changed to NOT NULL based on db_dump.sql context [1]
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true }) // Added category based on db_dump.sql context [1]
  category: string;

  @Column({ nullable: false }) // Changed to NOT NULL based on db_dump.sql context [1]
  duration_minutes: number;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Department, department => department.services)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  // @OneToMany(() => Appointment, appointment => appointment.service)
  // appointments: Appointment[]; // Uncomment when Appointment entity is created
}
