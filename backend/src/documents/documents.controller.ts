import { Controller, Post, Get, Patch, Body, Param, Req, UseGuards, UseInterceptors, UploadedFile, ParseUUIDPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../common/enums';
import { UploadDocumentDto, UpdateDocumentStatusDto, DocumentResponseDto } from './dto/document.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger'; // Assuming Swagger
import { diskStorage } from 'multer';
import { extname } from 'path';


@ApiTags('documents') // Assuming Swagger
@Controller() // Controller paths defined at method level
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Citizen) // Only citizens can upload documents
  @ApiBearerAuth() // Assuming Swagger
  @Post('/documents/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads', // Directory relative to backend root (Docker volume)
        filename: (req, file, cb) => {
          // Generate a unique filename
          const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      // Optional: File size limits, type filters could be added here
    })
  )
  @ApiConsumes('multipart/form-data') // Assuming Swagger
  @ApiBody({ // Assuming Swagger - describe the expected body
      schema: {
          type: 'object',
          properties: {
              file: {
                  type: 'string',
                  format: 'binary',
                  description: 'The document file to upload (PDF, JPEG, PNG, etc.)',
              },
              documentType: {
                 type: 'string',
                 enum: Object.values(UserRole), // Should be DocumentType, but OpenAPI spec gen might struggle
                 description: 'Type of the document (e.g., national_identity_card)',
              },
               appointmentId: {
                 type: 'string',
                 format: 'uuid',
                 required: false,
                 description: 'Optional: UUID of the associated appointment',
              }
          },
      },
  })
  async uploadDocument(
    @Req() req, // Contains user from JwtAuthGuard
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDocumentDto: UploadDocumentDto, // DTO for documentType and optional appointmentId
  ): Promise<DocumentResponseDto> {
     if (!file) {
         throw new BadRequestException('No file uploaded.');
     }

    const citizenId = req.user.id; // Assuming user ID is available on req.user
    const filePath = file.path; // Multer provides the file path
    const { documentType, appointmentId } = uploadDocumentDto;


    const newDocument = await this.documentsService.create(citizenId, documentType, filePath, appointmentId);

    // Note: The file itself is stored locally. For serving, you'd need an endpoint
    // that securely streams the file, verifying user permissions.

    // Map entity to DTO for response
    return newDocument as any; // Quick type assertion
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Citizen) // Citizens view their own documents
  @ApiBearerAuth() // Assuming Swagger
  @Get('/citizens/me/documents')
  async getMyCitizenDocuments(@Req() req): Promise<DocumentResponseDto[]> {
     const citizenId = req.user.id;
     const documents = await this.documentsService.findByUserId(citizenId);
     return documents as any; // Quick type assertion
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GovernmentOfficer, UserRole.Admin) // Officers and Admins view documents for an appointment
  @ApiBearerAuth() // Assuming Swagger
  @Get('/appointments/:appointmentId/documents')
  async getAppointmentDocuments(@Param('appointmentId', ParseUUIDPipe) appointmentId: string): Promise<DocumentResponseDto[]> {
      // TODO: Add authorization check to ensure the officer has access to this appointment's department
      const documents = await this.documentsService.findByAppointmentId(appointmentId);
      return documents as any; // Quick type assertion
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GovernmentOfficer, UserRole.Admin) // Only Officers and Admins can update document status
  @ApiBearerAuth() // Assuming Swagger
  @Patch('/documents/:id/status')
  async updateDocumentStatus(
    @Param('id', ParseUUIDPipe) documentId: string,
    @Body() updateStatusDto: UpdateDocumentStatusDto,
  ): Promise<DocumentResponseDto> {
    // TODO: Add authorization check to ensure the officer can update documents
    const updatedDocument = await this.documentsService.updateStatus(documentId, updateStatusDto);
    return updatedDocument as any; // Quick type assertion
  }

   // Optional: Endpoint to securely download a document (requires implementation)
   // @UseGuards(JwtAuthGuard, RolesGuard)
   // @Roles(UserRole.Citizen, UserRole.GovernmentOfficer, UserRole.Admin)
   // @Get('/documents/:id/download')
   // async downloadDocument(@Req() req, @Param('id', ParseUUIDPipe) documentId: string, @Res() res: Response) {
   //     // Implement logic to find document, check user permissions (citizen owns it, or officer has department access),
   //     // then stream the file from file_path.
   // }
}
