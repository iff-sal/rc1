import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Service } from './service.entity';
import { GetServicesFilterDto } from './dto/service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private servicesRepository: Repository<Service>,
  ) {}

  findAll(filterDto: GetServicesFilterDto): Promise<Service[]> {
    const { departmentId, category, search } = filterDto;
    const query: any = {};

    if (departmentId) {
      query.department_id = departmentId;
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.name = Like(`%${search}%`); // Simple search on name
      // You could extend this to search description as well or use full-text search for better results
    }

    return this.servicesRepository.find({ where: query });
  }

  findById(id: string): Promise<Service | undefined> {
    return this.servicesRepository.findOne({ where: { id } });
  }
}
