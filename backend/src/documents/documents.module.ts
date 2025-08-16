import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { Document } from './document.entity';
import { AuthModule } from '../auth/auth.module'; // Import AuthModule for guards

@Module({
  imports: [
    TypeOrmModule.forFeature([Document]), // Include Document entity
    MulterModule.register({
      dest: './uploads', // Destination folder for uploaded files (relative to backend root)
    }),
    AuthModule, // Import AuthModule for guards
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService], // Export the service if needed by other modules
})
export class DocumentsModule {}
