import { IsUUID, IsInt, Min, Max, IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // Assuming Swagger

export class CreateFeedbackDto {
  @IsOptional() // Allow feedback not linked to a specific appointment
  @IsUUID()
  @ApiProperty({ required: false, description: 'UUID of the appointment this feedback relates to' })
  appointmentId?: string;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  @ApiProperty({ description: 'Rating out of 5', minimum: 1, maximum: 5 })
  rating: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, description: 'Optional comments regarding the feedback' })
  comments?: string;
}
