import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // Assuming Swagger

export class AiChatQueryDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The user\'s query for the AI assistant' })
  query: string;
}

export class AiChatResponseDto {
  @ApiProperty({ description: 'The AI assistant\'s response text' })
  responseText: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, description: 'Type of suggested action (e.g., NAVIGATE_TO_SERVICE)' })
  suggestedActionType?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, description: 'Value associated with the suggested action (e.g., service ID)' })
  suggestedActionValue?: string;

   @IsOptional()
   @ApiProperty({ required: false, description: 'Details of the suggested action (e.g., Service details if navigating to a service)' })
   suggestedActionDetails?: any; // Can be a ServiceDto or other relevant data
}
