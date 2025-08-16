import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AppointmentsService } from '../appointments/appointments.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AppointmentStatus } from '../common/enums';
import { LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { addHours, isFuture } from 'date-fns';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private appointmentsService: AppointmentsService,
    private notificationsService: NotificationsService,
  ) {}

  // Cron job to check for upcoming appointments and send reminders
  // Example cron expression: */30 * * * * * (every 30 seconds - for testing)
  // For production, you might use '0 * * * *' (every hour) or '0 9 * * *' (daily at 9 AM)
  @Cron('*/30 * * * * *') // Schedule to run every 30 seconds for testing
  async handleAppointmentReminders() {
    this.logger.log('Running appointment reminder cron job...');

    // Define the time window for reminders (e.g., 24 to 48 hours from now)
    const now = new Date();
    const twentyFourHoursLater = addHours(now, 24);
    const fortyEightHoursLater = addHours(now, 48);

    try {
        // Find confirmed appointments scheduled in the next 24-48 hours
        // NOTE: In a real app, you'd track if a reminder has already been sent
        // using a flag on the appointment entity or a separate system.
        // For this hackathon demo, we just find appointments in the window and assume
        // we can send a reminder if they are 'confirmed' and in the future.
        // This is a simplified approach.

        const upcomingAppointments = await this.appointmentsService.appointmentsRepository.find({
             where: {
                 status: AppointmentStatus.Confirmed,
                 appointment_date_time: Between(twentyFourHoursLater, fortyEightHoursLater),
             },
             relations: ['citizen', 'service'] // Ensure relations are loaded for the notification service
        });


      if (upcomingAppointments.length > 0) {
        this.logger.log(`Found ${upcomingAppointments.length} appointments needing reminders.`);
        for (const appointment of upcomingAppointments) {
             // Double check it's in the future and within the exact reminder window
             if (isFuture(new Date(appointment.appointment_date_time))) {
                await this.notificationsService.sendAppointmentReminderEmail(appointment);
                // In a real app, mark appointment as reminder_sent = true here
             }
        }
      } else {
           this.logger.log('No appointments found needing reminders in the next 24-48 hours.');
      }

    } catch (error) {
      this.logger.error('Error during appointment reminder cron job:', error);
    }
  }

   // You could add other scheduled tasks here (e.g., daily summaries, data cleanup)
   // @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
   // handleDailySummary() {
   //    this.logger.log('Running daily summary cron job...');
   //    // Logic for daily reports, etc.
   // }
}
