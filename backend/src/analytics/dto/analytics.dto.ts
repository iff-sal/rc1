import { ApiProperty } from '@nestjs/swagger'; // Assuming Swagger

export class PeakBookingHoursDto {
  @ApiProperty({ description: 'Hour of the day (0-23)' })
  hour: number;

  @ApiProperty({ description: 'Number of appointments booked in this hour' })
  appointmentCount: string; // TypeORM aggregation often returns counts as strings
}

export class DepartmentLoadDto {
  @ApiProperty({ description: 'Name of the department' })
  departmentName: string;

   @ApiProperty({ description: 'UUID of the department' })
   departmentId: string;

  @ApiProperty({ description: 'Number of appointments for this department' })
  appointmentCount: string; // TypeORM aggregation often returns counts as strings
}

export class NoShowRateDto {
  @ApiProperty({ description: 'Total number of confirmed appointments considered' })
  totalConfirmedAppointments: string;

  @ApiProperty({ description: 'Number of appointments cancelled by citizen' })
  cancelledByCitizen: string;

  @ApiProperty({ description: 'Number of appointments cancelled by officer' })
  cancelledByOfficer: string;

  @ApiProperty({ description: 'Calculated no-show rate (cancellations / total confirmed)' })
  noShowRate: number; // Calculate as number for easier frontend use
}

export class AverageProcessingTimeDto {
  @ApiProperty({ description: 'Name of the service' })
  serviceName: string;

   @ApiProperty({ description: 'UUID of the service' })
   serviceId: string;

  @ApiProperty({ description: 'Average processing time in minutes' })
  averageTimeMinutes: number; // Assuming this comes directly from the service entity as a number
}
