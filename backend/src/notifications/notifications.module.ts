import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ConfigModule } from '@nestjs/config'; // Import ConfigModule
import { UsersModule } from '../users/users.module'; // Import UsersModule

@Module({
  imports: [ConfigModule, UsersModule], // Import ConfigModule and UsersModule
  providers: [NotificationsService],
  exports: [NotificationsService], // Export the service for use in other modules
})
export class NotificationsModule {}
