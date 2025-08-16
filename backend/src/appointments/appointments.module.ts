import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { Appointment } from './appointment.entity';
import { ServicesModule } from '../services/services.module'; // Import ServicesModule
import { DepartmentsModule } from '../departments/departments.module'; // Import DepartmentsModule
import { AuthModule } from '../auth/auth.module'; // Import AuthModule for JwtAuthGuard
import { User } from '../users/user.entity'; // Import User entity to inject UserRepository

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, User]), // Include Appointment and User entities
    ServicesModule,     // Import ServicesModule
    DepartmentsModule,  // Import DepartmentsModule
    AuthModule,         // Import AuthModule for guards
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService], // Export the service if needed by other modules
})
export class AppointmentsModule {}
