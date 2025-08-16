import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Appointment } from '../appointments/appointment.entity';
import { DocumentType, DocumentStatus } from '../common/enums';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true }) // Allow null for documents not initially linked to an appointment
  appointment_id: string;

  @Column({ nullable: false })
  user_id: string; // Citizen who uploaded the document

  @Column({ type: 'enum', enum: DocumentType, nullable: false })
  document_type: DocumentType;

  @Column({ nullable: false }) // Path relative to the uploads volume
  file_path: string;

  @Column({ type: 'enum', enum: DocumentStatus, default: DocumentStatus.Uploaded })
  status: DocumentStatus;

  @Column({ nullable: true }) // Comments from the officer review
  officer_comments: string;

  @CreateDateColumn()
  uploaded_at: Date;

  @UpdateDateColumn()
  updated_at: Date; // To track when status or comments were last updated

  @ManyToOne(() => Appointment, appointment => appointment.documents)
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;

  @ManyToOne(() => User) // Citizen who uploaded
  @JoinColumn({ name: 'user_id' })
  user: User;
}
