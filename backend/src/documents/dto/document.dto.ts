import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DocumentType, DocumentStatus } from '../../common/enums';

// DTO for receiving document type during upload
export class UploadDocumentDto {
  @IsEnum(DocumentType)
  @IsNotEmpty()
  @ApiProperty({ enum: DocumentType, description: 'Type of the document being uploaded' })
  documentType: DocumentType;

  @IsOptional()
  @IsUUID()
  @ApiProperty({ required: false, description: 'Optional: Link document to an existing appointment UUID' })
  appointmentId?: string;
}

// DTO for updating document status and adding comments
export class UpdateDocumentStatusDto {
  @IsEnum(DocumentStatus)
  @IsNotEmpty()
  @ApiProperty({ enum: DocumentStatus, description: 'New status for the document' })
  status: DocumentStatus;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, description: 'Comments from the officer during review' })
  officerComments?: string;
}

// DTO for sending document details in responses
export class DocumentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ required: false })
  appointment_id?: string;

  @ApiProperty()
  user_id: string;

  @ApiProperty({ enum: DocumentType })
  document_type: DocumentType;

  @ApiProperty()
  file_path: string; // Note: May want to abstract this for frontend to avoid exposing file system details

  @ApiProperty({ enum: DocumentStatus })
  status: DocumentStatus;

  @ApiProperty({ required: false })
  officer_comments?: string;

  @ApiProperty()
  uploaded_at: Date;

  @ApiProperty()
  updated_at: Date;
}
