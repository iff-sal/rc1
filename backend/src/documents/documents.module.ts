import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { Document } from './document.entity';
import { UsersModule } from '../users/users.module'; // Import UsersModule
import { AuthModule } from '../auth/auth.module'; // Import AuthModule for guards
import { NotificationsModule } from '../notifications/notifications.module'; // Import NotificationsModule
import { AppointmentsModule } from '../appointments/appointments.module'; // Import AppointmentsModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Document]), // Include Document entity
    MulterModule.register({
      dest: './uploads', // Destination folder for uploaded files (relative to backend root)
    }),
    UsersModule, // Import UsersModule to make UserRepository available
    AuthModule, // Import AuthModule for guards,
    NotificationsModule, // Import NotificationsModule to make NotificationsService available
    AppointmentsModule, // Import AppointmentsModule to make AppointmentsService available
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService], // Export the service if needed by other modules
})
export class DocumentsModule {}
