import { Controller, Get, Post, Patch, Body, Param, Query, Req, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto, AvailableSlotsQueryDto, AppointmentResponseDto, UpdateAppointmentStatusDto } from './dto/appointment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole, AppointmentStatus } from '../common/enums';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger'; // Assuming Swagger

@ApiTags('appointments') // Assuming Swagger
@Controller() // Controller paths defined at method level
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get('/services/:serviceId/available-slots')
  @ApiQuery({ name: 'date', description: 'ISO 8601 date string (e.g., 2023-10-27)', example: '2023-10-27' }) // Assuming Swagger
  async getAvailableSlots(
    @Param('serviceId', ParseUUIDPipe) serviceId: string,
    @Query() query: AvailableSlotsQueryDto,
  ): Promise<string[]> {
     // The date validation is handled by class-validator on AvailableSlotsQueryDto
     return this.appointmentsService.getAvailableSlots(serviceId, query.date);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Citizen)
  @ApiBearerAuth() // Assuming Swagger
  @Post('/appointments')
  async createAppointment(
    @Req() req, // Contains user from JwtAuthGuard
    @Body() createAppointmentDto: CreateAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    const citizenId = req.user.id; // Assuming user ID is available on req.user
    const appointment = await this.appointmentsService.createAppointment(citizenId, createAppointmentDto);
    // Map entity to DTO if needed, for simplicity returning entity for now
    return appointment as any; // Type assertion for quick demo
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Citizen)
  @ApiBearerAuth() // Assuming Swagger
  @Get('/citizens/me/appointments')
  @ApiQuery({ name: 'status', enum: AppointmentStatus, required: false }) // Assuming Swagger
  async getMyCitizenAppointments(@Req() req, @Query('status') status?: AppointmentStatus): Promise<AppointmentResponseDto[]> {
     const citizenId = req.user.id;
     const appointments = await this.appointmentsService.findAppointmentsByCitizenId(citizenId, status);
     return appointments as any; // Type assertion for quick demo
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GovernmentOfficer, UserRole.Admin) // Officers and Admins can view department appointments
  @ApiBearerAuth() // Assuming Swagger
   @Get('/officers/me/appointments')
   @ApiQuery({ name: 'date', description: 'ISO 8601 date string (optional)', required: false, example: '2023-10-27' }) // Assuming Swagger
   @ApiQuery({ name: 'status', enum: AppointmentStatus, required: false }) // Assuming Swagger
   async getMyOfficerAppointments(@Req() req, @Query('date') date?: string, @Query('status') status?: AppointmentStatus): Promise<AppointmentResponseDto[]> {
        const officerId = req.user.id; // Assuming user ID is available on req.user
        const appointments = await this.appointmentsService.findAppointmentsByOfficer(officerId, date, status);
        return appointments as any; // Type assertion for quick demo
   }


  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GovernmentOfficer, UserRole.Admin) // Only Officers and Admins can update status
  @ApiBearerAuth() // Assuming Swagger
  @Patch('/appointments/:id/status')
  async updateAppointmentStatus(
    @Param('id', ParseUUIDPipe) appointmentId: string,
    @Body() updateStatusDto: UpdateAppointmentStatusDto,
  ): Promise<AppointmentResponseDto> {
    const updatedAppointment = await this.appointmentsService.updateAppointmentStatus(appointmentId, updateStatusDto);
    return updatedAppointment as any; // Type assertion for quick demo
  }

   @UseGuards(JwtAuthGuard, RolesGuard)
   @Roles(UserRole.GovernmentOfficer, UserRole.Citizen, UserRole.Admin) // Allow all roles to view a single appointment
   @ApiBearerAuth() // Assuming Swagger
   @Get('/appointments/:id')
   async getAppointmentById(@Param('id', ParseUUIDPipe) id: string): Promise<AppointmentResponseDto> {
        const appointment = await this.appointmentsService.findById(id);
        if (!appointment) {
            throw new NotFoundException(`Appointment with ID ${id} not found`);
        }
        return appointment as any; // Type assertion for quick demo
   }
}
