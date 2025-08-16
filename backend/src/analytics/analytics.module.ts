import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { Appointment } from '../appointments/appointment.entity'; // Import Appointment entity
import { Service } from '../services/service.entity'; // Import Service entity
import { Department } from '../departments/department.entity'; // Import Department entity
import { AuthModule } from '../auth/auth.module'; // Import AuthModule for guards


@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, Service, Department]), // Include entities for analytics
    AuthModule, // Import AuthModule for guards
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService], // Export if needed elsewhere (less likely for analytics)
})
export class AnalyticsModule {}
