import { Controller, Post, Get, Patch, Body, Param, Req, UseGuards, UseInterceptors, UploadedFile, ParseUUIDPipe, BadRequestException, UnauthorizedException, NotFoundException, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../common/enums';
import { UploadDocumentDto, UpdateDocumentStatusDto, DocumentResponseDto } from './dto/document.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Request } from 'express';


@ApiTags('documents')
@Controller() // Controller paths defined at method level
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Citizen)
  @ApiBearerAuth()
  @Post('/documents/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    })
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
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
                 required: ['file', 'documentType'], // Specify required properties
                 description: 'Optional: UUID of the associated appointment',
              }
          },
      },
  })
  async uploadDocument(
    @Req() req: Request & { user: any }, // Type Req correctly to access user
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDocumentDto: UploadDocumentDto,
  ): Promise<DocumentResponseDto> {
     if (!file) {
         throw new BadRequestException('No file uploaded.');
     }
     if (req.user.role !== UserRole.Citizen) {
          throw new UnauthorizedException('Only citizens can upload documents via this endpoint.');
     }


    const citizenId = req.user.id; // Get citizen ID from JWT payload
    const filePath = file.path; // Multer provides the file path
    const { documentType, appointmentId } = uploadDocumentDto;

    const newDocument = await this.documentsService.create(citizenId, documentType, filePath, appointmentId);

    return newDocument as any;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Citizen)
  @ApiBearerAuth()
  @Get('/citizens/me/documents')
  async getMyCitizenDocuments(@Req() req: Request & { user: any }): Promise<DocumentResponseDto[]> {
     if (req.user.role !== UserRole.Citizen) {
         throw new UnauthorizedException('Only citizens can view their own documents via this endpoint.');
     }
     const citizenId = req.user.id;
     const documents = await this.documentsService.findByUserId(citizenId);
     return documents as any;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GovernmentOfficer, UserRole.Admin)
  @ApiBearerAuth()
  @Get('/appointments/:appointmentId/documents')
  async getAppointmentDocuments(
    @Param('appointmentId', ParseUUIDPipe) appointmentId: string,
    @Req() req: Request & { user: any }
  ): Promise<DocumentResponseDto[]> {
      // Authorization check is handled in the service based on officer's department
      const officerId = req.user.id; // Pass officer ID to the service for authorization
      const documents = await this.documentsService.findByAppointmentId(appointmentId, officerId);
      return documents as any;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GovernmentOfficer, UserRole.Admin)
  @ApiBearerAuth()
  @Patch('/documents/:id/status')
  async updateDocumentStatus(
    @Param('id', ParseUUIDPipe) documentId: string,
    @Body() updateStatusDto: UpdateDocumentStatusDto,
    @Req() req: Request & { user: any } // Access request to get officer ID
  ): Promise<DocumentResponseDto> {
    const officerId = req.user.id; // Pass officer ID to the service for authorization
    const updatedDocument = await this.documentsService.updateStatus(documentId, updateStatusDto, officerId);
    return updatedDocument as any;
  }

   // Optional: Endpoint to securely download a document (requires implementation)
   // @UseGuards(JwtAuthGuard, RolesGuard)
   // @Roles(UserRole.Citizen, UserRole.GovernmentOfficer, UserRole.Admin)
   // @Get('/documents/:id/download')
   // async downloadDocument(@Req() req: Request & { user: any }, @Param('id', ParseUUIDPipe) documentId: string, @Res() res: Response) {
   //     // Implement logic to find document, check user permissions (citizen owns it, or officer has department access),
   //     // then stream the file from file_path. Use officerId from req.user for auth check.
   // }
}
