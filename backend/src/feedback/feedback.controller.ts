import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/feedback.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../common/enums';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'; // Assuming Swagger


@ApiTags('feedback') // Assuming Swagger
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Citizen) // Only citizens can submit feedback
  @ApiBearerAuth() // Assuming Swagger
  @Post()
  async createFeedback(
    @Req() req, // Contains user from JwtAuthGuard
    @Body() createFeedbackDto: CreateFeedbackDto,
  ): Promise<any> { // Return type can be Feedback entity or DTO
    // Ensure the authenticated user is a citizen and matches the feedback submitter (implicit)
    if (req.user.role !== UserRole.Citizen) {
        throw new UnauthorizedException('Only citizens can submit feedback via this endpoint.');
    }
    const citizenId = req.user.id; // Get citizen ID from JWT payload
    const feedback = await this.feedbackService.create(citizenId, createFeedbackDto);
    return feedback; // Return the created feedback
  }

   // Optional: Add endpoints for officers/admins to view feedback
   // @UseGuards(JwtAuthGuard, RolesGuard)
   // @Roles(UserRole.GovernmentOfficer, UserRole.Admin)
   // @Get('/appointment/:appointmentId')
   // async getFeedbackForAppointment(@Param('appointmentId', ParseUUIDPipe) appointmentId: string) { ... }
   // @UseGuards(JwtAuthGuard, RolesGuard)
   // @Roles(UserRole.GovernmentOfficer, UserRole.Admin)
   // @Get('/service/:serviceId/average-rating')
   // async getAverageRatingForService(@Param('serviceId', ParseUUIDPipe) serviceId: string) { ... }
}
