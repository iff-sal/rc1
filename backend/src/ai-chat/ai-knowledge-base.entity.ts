import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Service } from '../services/service.entity'; // Assuming Service entity exists

@Entity('ai_knowledge_base')
export class AiKnowledgeBase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('simple-array', { nullable: false }) // Store keywords as an array of strings
  query_keywords: string[];

  @Column({ nullable: false })
  response_text: string;

  @Column({ nullable: true }) // e.g., 'NAVIGATE_TO_SERVICE', 'OPEN_DOCUMENT'
  suggested_action_type: string;

  @Column({ nullable: true }) // e.g., Service UUID, Document UUID
  suggested_action_value: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

   // Optional relationship if suggested_action_value is a service ID
   @ManyToOne(() => Service)
   @JoinColumn({ name: 'suggested_action_value' }) // Assuming suggested_action_value holds the Service ID
   suggested_service?: Service;

}
