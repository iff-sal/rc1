import { IsUUID, IsISO8601, IsNotEmpty, IsOptional, IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AppointmentStatus } from '../../common/enums';

export class CreateAppointmentDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ description: 'UUID of the service for the appointment' })
  serviceId: string;

  @IsISO8601()
  @IsNotEmpty()
  @ApiProperty({ description: 'ISO 8601 string for the appointment date and time' })
  appointmentDateTime: string;
}

export class AvailableSlotsQueryDto {
  @IsISO8601({ strict: true }) // Ensure it's a valid date string
  @IsNotEmpty()
  @ApiProperty({ description: 'ISO 8601 string for the date to check availability (time part ignored)' })
  date: string;
}

export class AppointmentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  citizen_id: string;

  @ApiProperty()
  service_id: string;

  @ApiProperty()
  department_id: string;

  @ApiProperty()
  appointment_date_time: Date;

  @ApiProperty()
  confirmation_reference: string;

  @ApiProperty({ required: false })
  qr_code_base64?: string;

  @ApiProperty({ enum: AppointmentStatus })
  status: AppointmentStatus;

  @ApiProperty({ required: false })
  officer_notes?: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  // You might include nested DTOs for service, department, etc. here
  // @ApiProperty({ type: ServiceDto })
  // service?: ServiceDto;
  // @ApiProperty({ type: DepartmentDto })
  // department?: DepartmentDto;
}

export class UpdateAppointmentStatusDto {
  @IsEnum(AppointmentStatus)
  @IsNotEmpty()
  @ApiProperty({ enum: AppointmentStatus, description: 'New status for the appointment' })
  status: AppointmentStatus;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, description: 'Notes added by the officer' })
  officerNotes?: string;
}