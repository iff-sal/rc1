import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from '../appointments/appointment.entity';
import { Service } from '../services/service.entity';
import { Department } from '../departments/department.entity';
import { AppointmentStatus } from '../common/enums';
import { PeakBookingHoursDto, DepartmentLoadDto, NoShowRateDto, AverageProcessingTimeDto } from './dto/analytics.dto';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
    @InjectRepository(Service)
    private servicesRepository: Repository<Service>,
    @InjectRepository(Department)
    private departmentsRepository: Repository<Department>,
  ) {}

  async getPeakBookingHours(): Promise<PeakBookingHoursDto[]> {
    try {
      // Aggregate appointments by hour for completed or confirmed appointments
      const result = await this.appointmentsRepository
        .createQueryBuilder('appointment')
        .select('EXTRACT(HOUR FROM appointment.appointment_date_time)', 'hour')
        .addSelect('COUNT(*)', 'appointmentCount')
        .where('appointment.status IN (:...statuses)', { statuses: [AppointmentStatus.Confirmed, AppointmentStatus.Completed] })
        .groupBy('hour')
        .orderBy('hour', 'ASC')
        .getRawMany(); // getRawMany returns plain objects with selected fields

      return result as PeakBookingHoursDto[]; // Type assertion
    } catch (error) {
      this.logger.error('Error fetching peak booking hours:', error);
      throw error; // Re-throw to be handled by controller/exception filter
    }
  }

  async getDepartmentLoad(): Promise<DepartmentLoadDto[]> {
     try {
       // Aggregate appointments by department
       const result = await this.appointmentsRepository
         .createQueryBuilder('appointment')
         .select('appointment.department_id', 'departmentId')
         .addSelect('COUNT(*)', 'appointmentCount')
         .leftJoin('appointment.department', 'department') // Join with department entity
         .addSelect('department.name', 'departmentName') // Select department name
         .groupBy('appointment.department_id')
         .addGroupBy('department.name') // Group by department name as well
         .orderBy('department.name', 'ASC')
         .getRawMany(); // getRawMany returns plain objects

       return result as DepartmentLoadDto[]; // Type assertion
     } catch (error) {
       this.logger.error('Error fetching department load:', error);
       throw error;
     }
  }


  async getNoShowRates(): Promise<NoShowRateDto> {
    try {
      // Get total confirmed appointments
      const totalConfirmedResult = await this.appointmentsRepository
        .createQueryBuilder('appointment')
        .select('COUNT(*)', 'count')
        .where('appointment.status = :status', { status: AppointmentStatus.Confirmed })
        .getRawOne();

      const totalConfirmedAppointments = parseInt(totalConfirmedResult?.count || '0', 10);

      // Get cancelled by citizen count
      const cancelledByCitizenResult = await this.appointmentsRepository
        .createQueryBuilder('appointment')
        .select('COUNT(*)', 'count')
        .where('appointment.status = :status', { status: AppointmentStatus.CancelledByCitizen })
        .getRawOne();

      const cancelledByCitizen = parseInt(cancelledByCitizenResult?.count || '0', 10);


       // Get cancelled by officer count
      const cancelledByOfficerResult = await this.appointmentsRepository
        .createQueryBuilder('appointment')
        .select('COUNT(*)', 'count')
        .where('appointment.status = :status', { status: AppointmentStatus.CancelledByOfficer })
        .getRawOne();

      const cancelledByOfficer = parseInt(cancelledByOfficerResult?.count || '0', 10);


      // Calculate no-show rate
      const totalCancellations = cancelledByCitizen + cancelledByOfficer;
      const noShowRate = totalConfirmedAppointments > 0 ? (totalCancellations / totalConfirmedAppointments) : 0;


      return {
          totalConfirmedAppointments: totalConfirmedAppointments.toString(),
          cancelledByCitizen: cancelledByCitizen.toString(),
          cancelledByOfficer: cancelledByOfficer.toString(),
          noShowRate: parseFloat(noShowRate.toFixed(4)) // Return as a number, fixed to 4 decimal places
      };

    } catch (error) {
      this.logger.error('Error fetching no-show rates:', error);
      throw error;
    }
  }

  async getAverageProcessingTimes(): Promise<AverageProcessingTimeDto[]> {
     try {
       // For hackathon, we assume average_processing_time_minutes is in the Service entity
       // and simply retrieve it.
       const services = await this.servicesRepository.find({
           select: ['id', 'name', 'duration_minutes'] // Select necessary fields
       });

       // Map Service entities to AverageProcessingTimeDto
       return services.map(service => ({
           serviceId: service.id,
           serviceName: service.name,
           averageTimeMinutes: service.duration_minutes // Use duration_minutes as proxy
       }));

     } catch (error) {
       this.logger.error('Error fetching average processing times:', error);
       throw error;
     }
  }
}
