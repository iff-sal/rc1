import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './department.entity';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private departmentsRepository: Repository<Department>,
  ) {}

  findAll(): Promise<Department[]> {
    return this.departmentsRepository.find();
  }

  findById(id: string): Promise<Department | undefined> {
    return this.departmentsRepository.findOne({ where: { id } });
  }
}
