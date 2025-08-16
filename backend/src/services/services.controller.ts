import { Controller, Get, Query } from '@nestjs/common';
import { ServicesService } from './services.service';
import { Service } from './service.entity';
import { GetServicesFilterDto } from './dto/service.dto';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  findAll(@Query() filterDto: GetServicesFilterDto): Promise<Service[]> {
    return this.servicesService.findAll(filterDto);
  }
}
