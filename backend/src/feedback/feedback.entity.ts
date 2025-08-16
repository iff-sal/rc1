import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity'; // Assuming User entity exists
import { Appointment } from '../appointments/appointment.entity'; // Assuming Appointment entity exists

@Entity('feedback')
export class Feedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  citizen_id: string;

  @Column({ type: 'uuid', nullable: true }) // Allow null for feedback not linked to a specific appointment (e.g., general feedback)
  appointment_id: string | null;

  @Column({ type: 'int', nullable: false })
  rating: number; // Integer between 1 and 5

  @Column({ nullable: true })
  comments: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, user => user.feedback)
  @JoinColumn({ name: 'citizen_id' })
  citizen: User;

  @ManyToOne(() => Appointment, appointment => appointment.feedback)
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;
}
