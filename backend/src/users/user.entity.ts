import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { UserRole } from '../common/enums';
import { Appointment } from '../appointments/appointment.entity'; // Assuming Appointment entity exists
import { Document } from '../documents/document.entity'; // Assuming Document entity exists
import { Feedback } from '../feedback/feedback.entity'; // Assuming Feedback entity exists
import { Department } from '../departments/department.entity'; // Import Department entity

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false }) // Don't select password hash by default
  password_hash: string;

  @Column({ nullable: true })
  first_name: string;

  @Column({ nullable: true })
  last_name: string;

  @Column({ nullable: true })
  phone_number: string;

  @Column({ unique: true, nullable: true })
  national_id_number: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: true })
  receives_email_notifications: boolean;

   @Column({ type: 'uuid', nullable: true }) // Foreign key for department
  department_id: string | null; // Nullable as not all users (citizens) have a department

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Appointment, appointment => appointment.citizen)
  appointments: Appointment[]; // Appointments booked by this citizen

  @OneToMany(() => Document, document => document.user)
  documents: Document[]; // Documents uploaded by this user

  @OneToMany(() => Feedback, feedback => feedback.user)
  feedback: Feedback[]; // Feedback submitted by this user

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'department_id' })
  department: Department; // Department the user belongs to (for officers/admins)

}
