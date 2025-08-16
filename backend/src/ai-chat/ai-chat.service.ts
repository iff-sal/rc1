import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { AiKnowledgeBase } from './ai-knowledge-base.entity';
import { AiChatResponseDto } from './dto/ai-chat.dto';
import { ServicesService } from '../services/services.service'; // Import ServicesService

@Injectable()
export class AiChatService {
  private readonly logger = new Logger(AiChatService.name);

  constructor(
    @InjectRepository(AiKnowledgeBase)
    private aiKnowledgeBaseRepository: Repository<AiKnowledgeBase>,
    private servicesService: ServicesService,
  ) {}

  async getResponse(query: string): Promise<AiChatResponseDto> {
    const lowerCaseQuery = query.toLowerCase();

    try {
       // Fetch all knowledge base entries
       const knowledgeBaseEntries = await this.aiKnowledgeBaseRepository.find({
            order: { created_at: 'ASC' } // Prioritize older (potentially more general) rules first? Or use a priority field.
       });

       let matchedEntry: AiKnowledgeBase | undefined;

       // Iterate and find the first matching entry
       for (const entry of knowledgeBaseEntries) {
           if (entry.query_keywords && entry.query_keywords.some(keyword => lowerCaseQuery.includes(keyword.toLowerCase()))) {
               matchedEntry = entry;
               break; // Found a match, stop searching
           }
       }

      if (matchedEntry) {
          const response: AiChatResponseDto = {
              responseText: matchedEntry.response_text,
              suggestedActionType: matchedEntry.suggested_action_type,
              suggestedActionValue: matchedEntry.suggested_action_value,
          };

          // If the suggested action is to navigate to a service, fetch service details
          if (matchedEntry.suggested_action_type === 'NAVIGATE_TO_SERVICE' && matchedEntry.suggested_action_value) {
              try {
                  const service = await this.servicesService.findById(matchedEntry.suggested_action_value);
                  if (service) {
                      response.suggestedActionDetails = {
                           id: service.id,
                           name: service.name,
                           description: service.description,
                           department_id: service.department_id,
                           duration_minutes: service.duration_minutes,
                           category: service.category
                           // Add other relevant service fields
                      };
                  } else {
                       this.logger.warn(`Suggested Service ID ${matchedEntry.suggested_action_value} not found for AI response ${matchedEntry.id}`);
                       // Clear suggested action if service not found
                       response.suggestedActionType = undefined;
                       response.suggestedActionValue = undefined;
                       response.suggestedActionDetails = undefined;
                  }
              } catch (serviceError) {
                  this.logger.error(`Error fetching suggested service ${matchedEntry.suggested_action_value}:`, serviceError);
                   // Clear suggested action on error
                   response.suggestedActionType = undefined;
                   response.suggestedActionValue = undefined;
                   response.suggestedActionDetails = undefined;
              }
          }


          return response;

      } else {
        // No match found, return generic fallback
        return {
          responseText: "I'm sorry, I can only assist with predefined government service queries. Please try rephrasing or ask about a specific service like 'passport' or 'driving license renewal'.",
        };
      }

    } catch (error) {
      this.logger.error('Error fetching AI response:', error);
      // Return a graceful error response
      return {
        responseText: "I apologize, I'm currently experiencing technical difficulties and cannot process your request.",
      };
    }
  }
}
