import { ApiProperty } from '@nestjs/swagger'; // Assuming Swagger will be used later

export class DepartmentDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  contact_email?: string;

  @ApiProperty({ required: false })
  contact_phone?: string;

  @ApiProperty({ required: false })
  address?: string; // Added based on entity

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
