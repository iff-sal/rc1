import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { Feedback } from './feedback.entity';
import { AuthModule } from '../auth/auth.module'; // Import AuthModule for guards
import { AppointmentsModule } from '../appointments/appointments.module'; // Import AppointmentsModule if needed for feedback queries


@Module({
  imports: [
    TypeOrmModule.forFeature([Feedback]), // Include Feedback entity
    AuthModule, // Import AuthModule for guards
    // AppointmentsModule // Uncomment if FeedbackService methods require AppointmentsService
  ],
  controllers: [FeedbackController],
  providers: [FeedbackService],
  exports: [FeedbackService], // Export if needed elsewhere
})
export class FeedbackModule {}
