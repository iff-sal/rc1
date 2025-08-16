import { Controller, Get, Post, Patch, Body, Param, Query, Req, UseGuards, ParseUUIDPipe, BadRequestException } from '@nestjs/common';
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
    // Ensure the authenticated user is a citizen attempting to book for themselves
     if (req.user.role !== UserRole.Citizen) {
         throw new UnauthorizedException('Only citizens can book appointments via this endpoint.');
     }
    const citizenId = req.user.id; // Assuming user ID is available on req.user (set by JwtStrategy)
    const appointment = await this.appointmentsService.createAppointment(citizenId, createAppointmentDto);
    // Map entity to DTO if needed, for simplicity returning entity for now
    return appointment as any; // Type assertion for quick demo
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Citizen)
  @ApiBearerAuth() // Assuming Swagger
  @Get('/citizens/me/appointments')
   @ApiQuery({ name: 'status', description: 'Comma-separated list of statuses (e.g., pending,confirmed)', required: false, type: String }) // Assuming Swagger
  async getMyCitizenAppointments(@Req() req, @Query('status') status?: string): Promise<AppointmentResponseDto[]> {
     const citizenId = req.user.id;
     const appointments = await this.appointmentsService.findAppointmentsByCitizenId(citizenId, status);
     return appointments as any; // Type assertion for quick demo
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GovernmentOfficer, UserRole.Admin) // Officers and Admins view appointments for their department
  @ApiBearerAuth() // Assuming Swagger
   @Get('/officers/me/appointments')
   @ApiQuery({ name: 'date', description: 'ISO 8601 date string (optional)', required: false, example: '2023-10-27' }) // Assuming Swagger
   @ApiQuery({ name: 'status', description: 'Comma-separated list of statuses (optional, e.g., pending,confirmed)', required: false, type: String }) // Assuming Swagger
   async getMyOfficerAppointments(
        @Req() req, // Contains user from JwtAuthGuard
        @Query('date') date?: string,
        @Query('status') status?: string
   ): Promise<AppointmentResponseDto[]> {
        // The officerId and department check is handled within the service method for better encapsulation
        const officerId = req.user.id; // Assuming user ID is available on req.user
        const appointments = await this.appointmentsService.findAppointmentsByOfficerDepartment(officerId, date, status);
        return appointments as any; // Type assertion for quick demo
   }


  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GovernmentOfficer, UserRole.Admin) // Only Officers and Admins can update status
  @ApiBearerAuth() // Assuming Swagger
  @Patch('/appointments/:id/status')
  async updateAppointmentStatus(
    @Param('id', ParseUUIDPipe) appointmentId: string,
    @Body() updateStatusDto: UpdateAppointmentStatusDto,
    @Req() req // To access officer's department for potential auth check
  ): Promise<AppointmentResponseDto> {
    // TODO: Add authorization check here or in service to ensure the officer performing the update
    // belongs to the same department as the appointment's service department.
    // This would involve fetching the appointment by ID and comparing its department_id
    // with the req.user.department_id.
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
