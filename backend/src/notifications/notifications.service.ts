import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { UsersService } from '../users/users.service'; // Assuming UsersService can fetch user details including email/phone
import { Appointment } from '../appointments/appointment.entity'; // Assuming Appointment entity
import { Document } from '../documents/document.entity'; // Assuming Document entity
import { format } from 'date-fns';
import { User } from '../users/user.entity'; // Assuming User entity


@Injectable()
export class NotificationsService {
    private transporter: Mail;
    private readonly logger = new Logger(NotificationsService.name);
    private mockSmsEnabled: boolean;

    constructor(
        private configService: ConfigService,
        private usersService: UsersService,
    ) {
        // Initialize Nodemailer transporter
        this.transporter = nodemailer.createTransport({
            host: this.configService.get<string>('EMAIL_SERVICE_HOST'),
            port: this.configService.get<number>('EMAIL_SERVICE_PORT'),
            secure: this.configService.get<number>('EMAIL_SERVICE_PORT') === 465, // true for 465, false for other ports
            auth: {
                user: this.configService.get<string>('EMAIL_SERVICE_USER'),
                pass: this.configService.get<string>('EMAIL_SERVICE_PASS'),
            },
        });

        // Check if mock SMS is enabled
        this.mockSmsEnabled = this.configService.get<string>('MOCK_SMS_ENABLED') === 'true';
    }

    private async sendEmail(to: string, subject: string, html: string): Promise<void> {
        try {
            const info = await this.transporter.sendMail({
                from: `"OneGovSL Appointment Portal" <${this.configService.get<string>('EMAIL_SERVICE_USER')}>`,
                to,
                subject,
                html,
            });
            this.logger.log(`Email sent: ${info.messageId} to ${to}`);
        } catch (error) {
            this.logger.error(`Error sending email to ${to}:`, error);
            // TODO: Implement retry mechanism or dead-letter queue if needed
        }
    }

    async sendSms(to: string, message: string): Promise<void> {
        if (this.mockSmsEnabled) {
            this.logger.log(`MOCK SMS Sent to: ${to}, Message: ${message}`);
        } else {
            // TODO: Integrate with a real SMS gateway API here
            this.logger.warn(`Mock SMS is disabled. SMS to ${to} with message "${message}" was not sent.`);
        }
    }

    async sendAppointmentConfirmationEmail(appointment: Appointment): Promise<void> {
        // Ensure the appointment object has nested citizen and service details loaded
        const citizen = appointment.citizen || await this.usersService.findById(appointment.citizen_id);
        const service = appointment.service; // Service should be loaded if relations are configured correctly

        if (!citizen || !citizen.email || !service) {
            this.logger.error(`Cannot send confirmation email: Missing citizen (${appointment.citizen_id}) or service (${appointment.service_id}) details for appointment ${appointment.id}`);
            return;
        }

        const subject = `Appointment Confirmation - ${service.name}`;
        const html = `
            <p>Dear ${citizen.first_name || citizen.email},</p>
            <p>Your appointment for <strong>${service.name}</strong> is confirmed.</p>
            <p><strong>Date and Time:</strong> ${format(new Date(appointment.appointment_date_time), 'PPP')} at ${format(new Date(appointment.appointment_date_time), 'p')}</p>
            <p><strong>Confirmation Reference:</strong> ${appointment.confirmation_reference}</p>
             ${appointment.qr_code_base64 ? `<p>Scan this QR code at the department:</p><img src="${appointment.qr_code_base64}" alt="QR Code"/>` : ''}
            <p>Please arrive 10 minutes early.</p>
            <p>Thank you.</p>
            <p>OneGovSL Team</p>
        `;

        if (citizen.receives_email_notifications) { // Check user preference
            await this.sendEmail(citizen.email, subject, html);
        } else {
             this.logger.log(`Email notifications disabled for ${citizen.email}. Confirmation email not sent.`);
        }


        // Also send mock SMS confirmation
         if (citizen.phone_number) {
             const smsMessage = `OneGovSL: Confirmed appt for ${service.name} on ${format(new Date(appointment.appointment_date_time), 'MMM dd, p')}. Ref: ${appointment.confirmation_reference}`;
             await this.sendSms(citizen.phone_number, smsMessage);
         }
    }

    async sendAppointmentReminderEmail(appointment: Appointment): Promise<void> {
         // Ensure the appointment object has nested citizen and service details loaded
        const citizen = appointment.citizen || await this.usersService.findById(appointment.citizen_id);
        const service = appointment.service; // Service should be loaded

        if (!citizen || !citizen.email || !service) {
            this.logger.error(`Cannot send reminder email: Missing citizen or service details for appointment ${appointment.id}`);
            return;
        }

        const subject = `Appointment Reminder - ${service.name}`;
        const html = `
            <p>Dear ${citizen.first_name || citizen.email},</p>
            <p>This is a reminder for your upcoming appointment for <strong>${service.name}</strong>.</p>
            <p><strong>Date and Time:</strong> ${format(new Date(appointment.appointment_date_time), 'PPP')} at ${format(new Date(appointment.appointment_date_time), 'p')}</p>
            <p><strong>Confirmation Reference:</strong> ${appointment.confirmation_reference}</p>
            <p>Please bring the following required documents:</p>
            <ul>
                <li>Original National Identity Card (NIC)</li>
                <li>Printed copy of the application form (if applicable)</li>
                <li>Any specific documents mentioned on the service page</li>
                <li>Relevant supporting documents (e.g., previous certificates, reports)</li>
            </ul>
            <p>Please arrive 10 minutes early.</p>
            <p>Thank you.</p>
            <p>OneGovSL Team</p>
        `;

         if (citizen.receives_email_notifications) { // Check user preference
            await this.sendEmail(citizen.email, subject, html);
         } else {
             this.logger.log(`Email notifications disabled for ${citizen.email}. Reminder email not sent.`);
         }

        // Also send mock SMS reminder
         if (citizen.phone_number) {
             const smsMessage = `OneGovSL: Reminder for appt for ${service.name} on ${format(new Date(appointment.appointment_date_time), 'MMM dd, p')} at ${format(new Date(appointment.appointment_date_time), 'p')}. Ref: ${appointment.confirmation_reference}`;
             await this.sendSms(citizen.phone_number, smsMessage);
         }
    }

    async sendDocumentStatusUpdateEmail(document: Document, officerComments: string = ''): Promise<void> {
        // Ensure document has citizen loaded (assuming user relation is loaded)
        const citizen = document.user || await this.usersService.findById(document.user_id);

         if (!citizen || !citizen.email) {
             this.logger.error(`Cannot send document status update email: Missing citizen details for document ${document.id}`);
             return;
         }

         const subject = `Document Status Updated - ${this.getDocumentTypeDisplayName(document.document_type)}`;
         const html = `
             <p>Dear ${citizen.first_name || citizen.email},</p>
             <p>The status of your uploaded document (${this.getDocumentTypeDisplayName(document.document_type)}) has been updated to: <strong>${this.getDocumentStatusDisplayName(document.status)}</strong>.</p>
             ${officerComments ? `<p>Officer Comments: ${officerComments}</p>` : ''}
             <p>Please check the portal for details.</p>
             <p>Thank you.</p>
             <p>OneGovSL Team</p>
         `;

         if (citizen.receives_email_notifications) { // Check user preference
             await this.sendEmail(citizen.email, subject, html);
         } else {
              this.logger.log(`Email notifications disabled for ${citizen.email}. Document status email not sent.`);
         }

        // Also send mock SMS update
         if (citizen.phone_number) {
             const smsMessage = `OneGovSL: Status updated for your ${this.getDocumentTypeDisplayName(document.document_type)} document to ${this.getDocumentStatusDisplayName(document.status)}. Check portal for details.`;
             await this.sendSms(citizen.phone_number, smsMessage);
         }
    }

    async sendAppointmentStatusUpdateEmail(appointment: Appointment, officerNotes: string = ''): Promise<void> {
         // Ensure the appointment object has nested citizen and service details loaded
        const citizen = appointment.citizen || await this.usersService.findById(appointment.citizen_id);
        const service = appointment.service; // Service should be loaded

         if (!citizen || !citizen.email || !service) {
             this.logger.error(`Cannot send appointment status update email: Missing citizen or service details for appointment ${appointment.id}`);
             return;
         }

         const subject = `Appointment Status Updated - ${service.name}`;
         const html = `
             <p>Dear ${citizen.first_name || citizen.email},</p>
             <p>The status of your appointment for <strong>${service.name}</strong> on ${format(new Date(appointment.appointment_date_time), 'PPP')} at ${format(new Date(appointment.appointment_date_time), 'p')} has been updated to: <strong>${appointment.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</strong>.</p>
              ${officerNotes ? `<p>Officer Notes: ${officerNotes}</p>` : ''}
              <p>Please check the portal for details.</p>
             <p>Thank you.</p>
             <p>OneGovSL Team</p>
         `;

         if (citizen.receives_email_notifications) { // Check user preference
             await this.sendEmail(citizen.email, subject, html);
         } else {
              this.logger.log(`Email notifications disabled for ${citizen.email}. Appointment status email not sent.`);
         }

         // Also send mock SMS update
         if (citizen.phone_number) {
             const smsMessage = `OneGovSL: Status updated for your appt on ${format(new Date(appointment.appointment_date_time), 'MMM dd, p')} for ${service.name} to ${appointment.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}. Check portal.`;
              await this.sendSms(citizen.phone_number, smsMessage);
         }
    }

    // Helper to display Document Type nicely
     private getDocumentTypeDisplayName(type: DocumentType): string {
        switch (type) {
           case DocumentType.NationalIdentityCard: return 'National Identity Card';
           case DocumentType.DrivingLicense: return 'Driving License';
           case DocumentType.BirthCertificate: return 'Birth Certificate';
           case DocumentType.ApplicationForm: return 'Application Form';
           case DocumentType.Photograph: return 'Photograph';
           case DocumentType.Passport: return 'Passport';
           case DocumentType.Other: return 'Other';
        }
    }

     // Helper to display Document Status nicely
     private getDocumentStatusDisplayName(status: DocumentStatus): string {
       switch (status) {
           case DocumentStatus.Uploaded: return 'Uploaded';
           case DocumentStatus.UnderReview: return 'Under Review';
           case DocumentStatus.Approved: return 'Approved';
           case DocumentStatus.Rejected: return 'Rejected';
       }
    }
}
