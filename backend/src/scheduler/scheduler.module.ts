import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler.service';
import { AppointmentsModule } from '../appointments/appointments.module'; // Import AppointmentsModule
import { NotificationsModule } from '../notifications/notifications.module'; // Import NotificationsModule

@Module({
  imports: [
    ScheduleModule.forRoot(), // Configure the ScheduleModule
    AppointmentsModule, // Import AppointmentsModule to use AppointmentsService
    NotificationsModule, // Import NotificationsModule to use NotificationsService
  ],
  providers: [SchedulerService],
  exports: [SchedulerService], // Export the service if needed elsewhere
})
export class SchedulerModule {}
