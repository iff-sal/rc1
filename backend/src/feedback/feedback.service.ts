import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from './feedback.entity';
import { CreateFeedbackDto } from './dto/feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
  ) {}

  async create(citizenId: string, createFeedbackDto: CreateFeedbackDto): Promise<Feedback> {
    const newFeedback = this.feedbackRepository.create({
      citizen_id: citizenId,
      appointment_id: createFeedbackDto.appointmentId || null, // Link to appointment or set null
      rating: createFeedbackDto.rating,
      comments: createFeedbackDto.comments,
    });
    await this.feedbackRepository.save(newFeedback);
    return newFeedback;
  }

   // Optional: Add methods to find feedback (e.g., by appointment, by citizen, aggregated)
   findByAppointmentId(appointmentId: string): Promise<Feedback[]> {
       return this.feedbackRepository.find({ where: { appointment_id: appointmentId }, order: { created_at: 'DESC' } });
   }

   findByCitizenId(citizenId: string): Promise<Feedback[]> {
       return this.feedbackRepository.find({ where: { citizen_id: citizenId }, order: { created_at: 'DESC' } });
   }

   findAll(): Promise<Feedback[]> {
       return this.feedbackRepository.find({ order: { created_at: 'DESC' } });
   }

    // Aggregate feedback for analytics/reporting
    async getAverageRatingForService(serviceId: string): Promise<number | null> {
        const result = await this.feedbackRepository
            .createQueryBuilder('feedback')
            .select('AVG(feedback.rating)', 'averageRating')
             // Join with appointments and services to filter by serviceId
            .innerJoin('feedback.appointment', 'appointment')
            .where('appointment.service_id = :serviceId', { serviceId })
            .getRawOne();

        return result?.averageRating ? parseFloat(result.averageRating) : null;
    }
}
