import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AiChatService } from './ai-chat.service';
import { AiChatQueryDto, AiChatResponseDto } from './dto/ai-chat.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../common/enums';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'; // Assuming Swagger

@ApiTags('ai-chat') // Assuming Swagger
@Controller('ai-chat')
export class AiChatController {
  constructor(private readonly aiChatService: AiChatService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Citizen) // Only citizens can use the chat assistant
  @ApiBearerAuth() // Assuming Swagger
  @Post()
  async getAiResponse(@Body() queryDto: AiChatQueryDto): Promise<AiChatResponseDto> {
    // No need to pass user info to the service for this basic rule-based AI
    return this.aiChatService.getResponse(queryDto.query);
  }
}
