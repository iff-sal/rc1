import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../common/enums';
import { PeakBookingHoursDto, DepartmentLoadDto, NoShowRateDto, AverageProcessingTimeDto } from './dto/analytics.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'; // Assuming Swagger

@ApiTags('analytics') // Assuming Swagger
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.GovernmentOfficer, UserRole.Admin) // Only Officers and Admins can access analytics
@ApiBearerAuth() // Assuming Swagger
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('peak-booking-hours')
  getPeakBookingHours(): Promise<PeakBookingHoursDto[]> {
    return this.analyticsService.getPeakBookingHours();
  }

  @Get('department-load')
  getDepartmentLoad(): Promise<DepartmentLoadDto[]> {
    return this.analyticsService.getDepartmentLoad();
  }

  @Get('no-show-rates')
  getNoShowRates(): Promise<NoShowRateDto> {
    return this.analyticsService.getNoShowRates();
  }

  @Get('average-processing-times')
  getAverageProcessingTimes(): Promise<AverageProcessingTimeDto[]> {
    return this.analyticsService.getAverageProcessingTimes();
  }
}
