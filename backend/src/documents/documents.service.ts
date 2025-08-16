import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './document.entity';
import { DocumentType, DocumentStatus, UserRole } from '../common/enums';
import { UpdateDocumentStatusDto } from './dto/document.dto';
import { NotificationsService } from '../notifications/notifications.service'; // Import NotificationsService
import { AppointmentsService } from '../appointments/appointments.service'; // Import AppointmentsService to get appointment department
import { User } from '../users/user.entity'; // Import User entity to check officer department


@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentsRepository: Repository<Document>,
     @InjectRepository(User) // Inject User repository to fetch officer's department
    private userRepository: Repository<User>,
    private notificationsService: NotificationsService, // Inject NotificationsService
    private appointmentsService: AppointmentsService // Inject AppointmentsService
  ) {}

  async create(userId: string, documentType: DocumentType, filePath: string, appointmentId?: string): Promise<Document> {
    const newDocument = this.documentsRepository.create({
      user_id: userId,
      appointment_id: appointmentId,
      document_type: documentType,
      file_path: filePath,
      status: DocumentStatus.Uploaded, // Initial status
    });
    await this.documentsRepository.save(newDocument);
    return newDocument;
  }

  findByUserId(userId: string): Promise<Document[]> {
    return this.documentsRepository.find({ where: { user_id: userId }, order: { uploaded_at: 'DESC' } });
  }

  async findByAppointmentId(appointmentId: string, officerId?: string): Promise<Document[]> {
     // Optional: Add authorization check if officerId is provided
     if (officerId) {
         const appointment = await this.appointmentsService.findById(appointmentId);
         if (!appointment || !appointment.department_id) {
             throw new NotFoundException(`Appointment with ID ${appointmentId} not found or missing department.`);
         }

         const officer = await this.userRepository.findOne({ where: { id: officerId }, relations: ['department'] });
         if (!officer || officer.role !== UserRole.GovernmentOfficer || !officer.department || officer.department.id !== appointment.department_id) {
            throw new UnauthorizedException('You do not have permission to view documents for this appointment.');
         }
     }

    return this.documentsRepository.find({ where: { appointment_id: appointmentId }, order: { uploaded_at: 'ASC' }, relations: ['user'] }); // Load user for potential notifications
  }

  async findById(id: string): Promise<Document | undefined> {
     return this.documentsRepository.findOne({ where: { id }, relations: ['user', 'appointment'] }); // Load user and appointment
  }


  async updateStatus(documentId: string, updateDto: UpdateDocumentStatusDto, officerId: string): Promise<Document> {
    const document = await this.documentsRepository.findOne({ where: { id: documentId }, relations: ['appointment', 'user'] }); // Load appointment and user for auth/notification

    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    // Authorization check: Ensure the officer belongs to the same department as the appointment the document is linked to (if linked)
    // OR if the document is not linked to an appointment, maybe any officer can review general docs?
    // For simplicity, let's assume officers only review documents linked to appointments in their department.
    if (document.appointment) {
        const appointment = document.appointment; // Already loaded relation
        const officer = await this.userRepository.findOne({ where: { id: officerId }, relations: ['department'] });

         if (!officer || officer.role !== UserRole.GovernmentOfficer || !officer.department || officer.department.id !== appointment.department_id) {
            throw new UnauthorizedException('You do not have permission to update this document.');
         }
    } else {
        // What if the document is not linked to an appointment?
        // For hackathon simplicity, maybe only admin can update unlinked docs status, or any officer?
        // Let's assume for hackathon that documents are primarily linked to appointments for officer review.
        // If an officer tries to update an unlinked doc, they won't have an appointment.department,
        // so the check above will fail, which is okay for this scope.
         throw new BadRequestException('Document is not linked to an appointment.'); // Or adjust logic if officers review unlinked docs
    }


    document.status = updateDto.status;
    if (updateDto.officerComments !== undefined) {
        document.officer_comments = updateDto.officerComments;
    }
    document.updated_at = new Date(); // Update the updated_at timestamp


    const updatedDocument = await this.documentsRepository.save(document);

    // Send notification based on status change
     // Ensure user relation is loaded (it should be if we loaded it above)
     if (updatedDocument.user) {
         await this.notificationsService.sendDocumentStatusUpdateEmail(updatedDocument, updatedDocument.officer_comments);
     }


    return updatedDocument;
  }
}
