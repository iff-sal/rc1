import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Appointment } from './appointment.entity';
import { CreateAppointmentDto, AvailableSlotsQueryDto, UpdateAppointmentStatusDto } from './dto/appointment.dto';
import { ServicesService } from '../services/services.service';
import { DepartmentsService } from '../departments/departments.service';
import { UserRole, AppointmentStatus } from '../common/enums';
import { v4 as uuidv4 } from 'uuid';
import * as QRCode from 'qrcode';
import { User } from '../users/user.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
    @InjectRepository(User) // Inject User repository to fetch officer's department
    private userRepository: Repository<User>,
    private servicesService: ServicesService,
    private departmentsService: DepartmentsService,
  ) {}

  async getAvailableSlots(serviceId: string, dateString: string): Promise<string[]> {
    const service = await this.servicesService.findById(serviceId);
    if (!service) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }

    const date = new Date(dateString);
    // Set time to start of the day in the server's timezone
    date.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Define fixed working hours for simplicity (e.g., 9 AM to 5 PM, Mon-Fri)
    const startHour = 9;
    const endHour = 17; // 5 PM
    const slotDurationMinutes = service.duration_minutes || 30; // Use service duration or default

    // Check if the requested date is a weekend (Saturday or Sunday) - simplified check
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
       return []; // No appointments on weekends
    }

    // Generate all possible slots for the day within working hours
    const availableSlots: string[] = [];
    let currentTime = new Date(date);
    currentTime.setHours(startHour, 0, 0, 0);

    const officeEndTime = new Date(date);
    officeEndTime.setHours(endHour, 0, 0, 0);

    while (currentTime < officeEndTime) {
      const slotEndTime = new Date(currentTime.getTime() + slotDurationMinutes * 60000);
      if (slotEndTime <= officeEndTime) {
         availableSlots.push(currentTime.toTimeString().substring(0, 5)); // Format as HH:MM
      }
      currentTime = slotEndTime; // Move to the next slot start time
    }


    // Query for existing appointments on this day for this service
    const bookedAppointments = await this.appointmentsRepository.find({
      where: {
        service_id: serviceId,
        appointment_date_time: Between(date, endOfDay),
        status: AppointmentStatus.Confirmed // Only consider confirmed bookings as unavailable
      },
      select: ['appointment_date_time']
    });

    const bookedSlots: string[] = bookedAppointments.map(app =>
      app.appointment_date_time.toTimeString().substring(0, 5) // Format as HH:MM
    );

    // Filter out booked slots from available slots
    const trulyAvailableSlots = availableSlots.filter(slot => !bookedSlots.includes(slot));

    return trulyAvailableSlots;
  }


  async createAppointment(citizenId: string, createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    const { serviceId, appointmentDateTime } = createAppointmentDto;

    const service = await this.servicesService.findById(serviceId);
    if (!service) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }

    const appointmentDate = new Date(appointmentDateTime);
    const requestedSlot = appointmentDate.toTimeString().substring(0, 5);

    // Re-check availability for the specific requested slot
    const availableSlotsToday = await this.getAvailableSlots(serviceId, appointmentDate.toISOString());
    if (!availableSlotsToday.includes(requestedSlot)) {
        throw new BadRequestException(`The requested slot ${requestedSlot} on ${appointmentDate.toDateString()} is not available.`);
    }

    // Generate unique confirmation reference and QR code
    const confirmationReference = uuidv4().substring(0, 8).toUpperCase(); // Simple unique ref
    const qrCodeBase64 = await QRCode.toDataURL(confirmationReference);

    const newAppointment = this.appointmentsRepository.create({
      citizen_id: citizenId,
      service_id: serviceId,
      department_id: service.department_id, // Get department ID from service
      appointment_date_time: appointmentDate,
      confirmation_reference: confirmationReference,
      qr_code_base64: qrCodeBase64,
      status: AppointmentStatus.Pending, // Start as pending, confirmed by officer
    });

    await this.appointmentsRepository.save(newAppointment);

    // TODO: Send confirmation email/SMS here (using NotificationsService later)

    return newAppointment;
  }

  async findAppointmentsByCitizenId(citizenId: string, status?: AppointmentStatus): Promise<Appointment[]> {
    const where: any = { citizen_id: citizenId };
    if (status) {
      where.status = status;
    }
    return this.appointmentsRepository.find({
        where,
        relations: ['service', 'department'], // Eager load relations for response
        order: { appointment_date_time: 'ASC' }
    });
  }

  async findAppointmentsByOfficer(officerId: string, dateString?: string, status?: AppointmentStatus): Promise<Appointment[]> {
    // Find the department the officer belongs to
    // This assumes the user entity has a department_id or there's a linking table
    // For now, let's assume officer user has a department_id column directly
    const officer = await this.userRepository.findOne({ where: { id: officerId }, select: ['id', 'department_id', 'role'] as (keyof User)[] });

    if (!officer || officer.role !== UserRole.GovernmentOfficer || !officer.department_id) {
        throw new UnauthorizedException('User is not a valid government officer or not assigned to a department.');
    }

    const where: any = { department_id: officer.department_id };

     if (dateString) {
        const date = new Date(dateString);
        date.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        where.appointment_date_time = Between(date, endOfDay);
    }

    if (status) {
        where.status = status;
    }


    return this.appointmentsRepository.find({
        where,
        relations: ['citizen', 'service'], // Eager load citizen and service details
        order: { appointment_date_time: 'ASC' }
    });
  }


  async updateAppointmentStatus(appointmentId: string, updateDto: UpdateAppointmentStatusDto): Promise<Appointment> {
    const appointment = await this.appointmentsRepository.findOne({ where: { id: appointmentId } });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${appointmentId} not found`);
    }

    appointment.status = updateDto.status;
    if (updateDto.officerNotes !== undefined) {
        appointment.officer_notes = updateDto.officerNotes;
    }


    await this.appointmentsRepository.save(appointment);

    // TODO: Send notification based on status change (using NotificationsService later)

    return appointment;
  }

  async findById(id: string): Promise<Appointment | undefined> {
     return this.appointmentsRepository.findOne({ where: { id }, relations: ['citizen', 'service', 'department'] });
  }
}
