import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository, MoreThanOrEqual, LessThanOrEqual, IsNull, In } from 'typeorm';
import { Appointment } from './appointment.entity';
import { CreateAppointmentDto, AvailableSlotsQueryDto, UpdateAppointmentStatusDto } from './dto/appointment.dto';
import { ServicesService } from '../services/services.service';
import { DepartmentsService } from '../departments/departments.service';
import { UserRole, AppointmentStatus } from '../common/enums';
import { v4 as uuidv4 } from 'uuid';
import * as QRCode from 'qrcode';
import { User } from '../users/user.entity';
import { NotificationsService } from '../notifications/notifications.service';


@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    public appointmentsRepository: Repository<Appointment>, // Made public for scheduler to access
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private servicesService: ServicesService,
    private departmentsService: DepartmentsService,
    private notificationsService: NotificationsService, // Inject NotificationsService
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

    // Check if the requested date is in the past
    const today = new Date();
    today.setHours(0,0,0,0); // Compare just the date
    if (date < today) {
        return []; // Cannot book appointments in the past
    }

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
       // Ensure the entire slot is within working hours
      if (slotEndTime <= officeEndTime) {
         availableSlots.push(currentTime.toTimeString().substring(0, 5)); // Format as HH:MM
      }
      currentTime = new Date(currentTime.getTime() + slotDurationMinutes * 60000); // Increment by slot duration
    }


    // Query for existing appointments on this day for this service
    const bookedAppointments = await this.appointmentsRepository.find({
      where: {
        service_id: serviceId,
        appointment_date_time: Between(date, endOfDay),
        // Consider statuses that block a slot
        status: In([AppointmentStatus.Pending, AppointmentStatus.Confirmed])
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

    // Check if the appointment date/time is in the past (double check)
    if (new Date(appointmentDateTime) < new Date()) {
        throw new BadRequestException('Cannot book appointments in the past.');
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

    const savedAppointment = await this.appointmentsRepository.save(newAppointment);

    // Send confirmation email/SMS
    // Load relations needed for notification service
     const appointmentWithRelations = await this.appointmentsRepository.findOne({
         where: { id: savedAppointment.id },
         relations: ['citizen', 'service'] // Ensure citizen and service are loaded
     });

     if (appointmentWithRelations) {
        await this.notificationsService.sendAppointmentConfirmationEmail(appointmentWithRelations);
     }


    return savedAppointment;
  }

  async findAppointmentsByCitizenId(citizenId: string, status?: string): Promise<Appointment[]> {
    const where: any = { citizen_id: citizenId };

     // Handle comma-separated statuses if provided
    if (status) {
       const statuses = status.split(',') as AppointmentStatus[];
       // Validate that all provided statuses are valid enum values
       const validStatuses = Object.values(AppointmentStatus) as string[];
       if (!statuses.every(s => validStatuses.includes(s))) {
           throw new BadRequestException('Invalid appointment status provided.');
       }
       where.status = In(statuses); // Use In for multiple statuses
    }


    return this.appointmentsRepository.find({
        where,
        relations: ['service', 'department'], // Eager load relations for response
        order: { appointment_date_time: 'ASC' }
    });
  }


  async findAppointmentsByOfficerDepartment(officerId: string, dateString?: string, status?: string): Promise<Appointment[]> {
    // Find the department the officer belongs to
    const officer = await this.userRepository.findOne({
         where: { id: officerId },
         relations: ['department'], // Eager load the department relationship
         select: ['id', 'role', 'department'] as (keyof User)[] // Select department relationship
    });

    if (!officer || officer.role !== UserRole.GovernmentOfficer || !officer.department) {
        throw new UnauthorizedException('User is not a valid government officer or not assigned to a department.');
    }

    const where: any = { department_id: officer.department.id };

     if (dateString) {
        const date = new Date(dateString);
        date.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        where.appointment_date_time = Between(date, endOfDay);
    } else {
        // If no date is provided, show appointments from today onwards by default for officers
         const today = new Date();
         today.setHours(0,0,0,0);
         where.appointment_date_time = MoreThanOrEqual(today);
    }


     // Handle comma-separated statuses if provided
    if (status) {
       const statuses = status.split(',') as AppointmentStatus[];
        // Validate that all provided statuses are valid enum values
       const validStatuses = Object.values(AppointmentStatus) as string[];
        if (!statuses.every(s => validStatuses.includes(s))) {
            throw new BadRequestException('Invalid appointment status provided.');
        }
       where.status = In(statuses); // Use In for multiple statuses
    } else {
         // If no status is provided, show pending and confirmed by default for today/future
         if (!dateString) { // Apply default status filter only when no specific date is set
              where.status = In([AppointmentStatus.Pending, AppointmentStatus.Confirmed, AppointmentStatus.Rescheduled]);
         }
    }


    return this.appointmentsRepository.find({
        where,
        relations: ['citizen', 'service'], // Eager load citizen and service details
        order: { appointment_date_time: 'ASC' }
    });
  }


  async updateAppointmentStatus(appointmentId: string, updateDto: UpdateAppointmentStatusDto, officerId: string): Promise<Appointment> {
    const appointment = await this.appointmentsRepository.findOne({ where: { id: appointmentId }, relations: ['department'] }); // Load department to check officer auth

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${appointmentId} not found`);
    }

    // Authorization check: Ensure the officer belongs to the same department as the appointment
    const officer = await this.userRepository.findOne({ where: { id: officerId }, relations: ['department'] });
    if (!officer || officer.role !== UserRole.GovernmentOfficer || !officer.department || officer.department.id !== appointment.department.id) {
        throw new UnauthorizedException('You do not have permission to update appointments in this department.');
    }


    appointment.status = updateDto.status;
    if (updateDto.officerNotes !== undefined) {
        appointment.officer_notes = updateDto.officerNotes;
    }
    appointment.updated_at = new Date(); // Update the updated_at timestamp


    const updatedAppointment = await this.appointmentsRepository.save(appointment);

    // Send notification based on status change
    // Load citizen and service relations for notification
     const appointmentWithRelations = await this.appointmentsRepository.findOne({
         where: { id: updatedAppointment.id },
         relations: ['citizen', 'service']
     });

     if (appointmentWithRelations) {
        await this.notificationsService.sendAppointmentStatusUpdateEmail(appointmentWithRelations, updatedAppointment.officer_notes);
     }


    return updatedAppointment;
  }

  async findById(id: string): Promise<Appointment | undefined> {
     return this.appointmentsRepository.findOne({ where: { id }, relations: ['citizen', 'service', 'department'] });
  }
}
