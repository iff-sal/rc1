import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiChatService } from './ai-chat.service';
import { AiChatController } from './ai-chat.controller';
import { AiKnowledgeBase } from './ai-knowledge-base.entity';
import { ServicesModule } from '../services/services.module'; // Import ServicesModule

@Module({
  imports: [
    TypeOrmModule.forFeature([AiKnowledgeBase]), // Include AiKnowledgeBase entity
    ServicesModule, // Import ServicesModule to use ServicesService
  ],
  controllers: [AiChatController],
  providers: [AiChatService],
  exports: [AiChatService], // Export if needed elsewhere
})
export class AiChatModule {}
