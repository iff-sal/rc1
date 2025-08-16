import { Controller, Get, Post, Patch, Body, Param, Query, Req, UseGuards, ParseUUIDPipe, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto, AvailableSlotsQueryDto, AppointmentResponseDto, UpdateAppointmentStatusDto } from './dto/appointment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole, AppointmentStatus } from '../common/enums';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('appointments')
@Controller()
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get('/services/:serviceId/available-slots')
  @ApiQuery({ name: 'date', description: 'ISO 8601 date string (e.g., 2023-10-27)', example: '2023-10-27' })
  async getAvailableSlots(
    @Param('serviceId', ParseUUIDPipe) serviceId: string,
    @Query() query: AvailableSlotsQueryDto,
  ): Promise<string[]> {
     return this.appointmentsService.getAvailableSlots(serviceId, query.date);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Citizen)
  @ApiBearerAuth()
  @Post('/appointments')
  async createAppointment(
    @Req() req,
    @Body() createAppointmentDto: CreateAppointmentDto,
  ): Promise<AppointmentResponseDto> {
     if (req.user.role !== UserRole.Citizen) {
         throw new UnauthorizedException('Only citizens can book appointments via this endpoint.');
     }
    const citizenId = req.user.id;
    const appointment = await this.appointmentsService.createAppointment(citizenId, createAppointmentDto);
    return appointment as any;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Citizen)
  @ApiBearerAuth()
  @Get('/citizens/me/appointments')
   @ApiQuery({ name: 'status', description: 'Comma-separated list of statuses (e.g., pending,confirmed)', required: false, type: String })
  async getMyCitizenAppointments(@Req() req, @Query('status') status?: string): Promise<AppointmentResponseDto[]> {
     const citizenId = req.user.id;
     const appointments = await this.appointmentsService.findAppointmentsByCitizenId(citizenId, status);
     return appointments as any;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GovernmentOfficer, UserRole.Admin)
  @ApiBearerAuth()
   @Get('/officers/me/appointments')
   @ApiQuery({ name: 'date', description: 'ISO 8601 date string (optional)', required: false, example: '2023-10-27' })
   @ApiQuery({ name: 'status', description: 'Comma-separated list of statuses (optional, e.g., pending,confirmed)', required: false, type: String })
   async getMyOfficerAppointments(
        @Req() req,
        @Query('date') date?: string,
        @Query('status') status?: string
   ): Promise<AppointmentResponseDto[]> {
        const officerId = req.user.id; // Pass officer ID to the service for department check
        const appointments = await this.appointmentsService.findAppointmentsByOfficerDepartment(officerId, date, status);
        return appointments as any;
   }


  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GovernmentOfficer, UserRole.Admin)
  @ApiBearerAuth()
  @Patch('/appointments/:id/status')
  async updateAppointmentStatus(
    @Param('id', ParseUUIDPipe) appointmentId: string,
    @Body() updateStatusDto: UpdateAppointmentStatusDto,
    @Req() req // Access request to get officer ID
  ): Promise<AppointmentResponseDto> {
    const officerId = req.user.id; // Pass officer ID to the service for authorization
    const updatedAppointment = await this.appointmentsService.updateAppointmentStatus(appointmentId, updateStatusDto, officerId);
    return updatedAppointment as any;
  }

   @UseGuards(JwtAuthGuard, RolesGuard)
   @Roles(UserRole.GovernmentOfficer, UserRole.Citizen, UserRole.Admin)
   @ApiBearerAuth()
   @Get('/appointments/:id')
   async getAppointmentById(@Param('id', ParseUUIDPipe) id: string): Promise<AppointmentResponseDto> {
        const appointment = await this.appointmentsService.findById(id);
        if (!appointment) {
            throw new NotFoundException(`Appointment with ID ${id} not found`);
        }
        return appointment as any;
   }
}
