import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Service } from '../services/service.entity';
import { Department } from '../departments/department.entity';
import { Document } from '../documents/document.entity'; // Assuming Documents module exists or will exist
import { Feedback } from '../feedback/feedback.entity'; // Assuming Feedback module exists or will exist
import { AppointmentStatus } from '../common/enums';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  citizen_id: string;

  @Column({ nullable: false })
  service_id: string;

  @Column({ nullable: false })
  department_id: string;

  @Column({ type: 'timestamp with time zone', nullable: false })
  appointment_date_time: Date;

  @Column({ unique: true, nullable: false })
  confirmation_reference: string;

  @Column({ nullable: true }) // Base64 string of QR code
  qr_code_base64: string;

  @Column({ type: 'enum', enum: AppointmentStatus, default: AppointmentStatus.Pending })
  status: AppointmentStatus;

  @Column({ nullable: true })
  officer_notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, user => user.appointments)
  @JoinColumn({ name: 'citizen_id' })
  citizen: User;

  @ManyToOne(() => Service, service => service.appointments)
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @OneToMany(() => Document, document => document.appointment)
  documents: Document[];

  @OneToMany(() => Feedback, feedback => feedback.appointment)
  feedback: Feedback[];
}