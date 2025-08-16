import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './document.entity';
import { DocumentType, DocumentStatus } from '../common/enums';
import { UpdateDocumentStatusDto } from './dto/document.dto';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentsRepository: Repository<Document>,
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

  findByAppointmentId(appointmentId: string): Promise<Document[]> {
    return this.documentsRepository.find({ where: { appointment_id: appointmentId }, order: { uploaded_at: 'ASC' } });
  }

  async findById(id: string): Promise<Document | undefined> {
     return this.documentsRepository.findOne({ where: { id } });
  }


  async updateStatus(documentId: string, updateDto: UpdateDocumentStatusDto): Promise<Document> {
    const document = await this.documentsRepository.findOne({ where: { id: documentId } });

    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    document.status = updateDto.status;
    if (updateDto.officerComments !== undefined) {
        document.officer_comments = updateDto.officerComments;
    }
    document.updated_at = new Date(); // Update the updated_at timestamp

    await this.documentsRepository.save(document);

    // TODO: Potentially add logic here to trigger notifications based on status change

    return document;
  }
}
