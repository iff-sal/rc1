import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Department } from '../departments/department.entity'; // Import Department


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // findByEmail method with optional parameter to select password_hash
  async findByEmail(email: string, selectPassword = false): Promise<User | undefined> {
      const queryBuilder = this.usersRepository.createQueryBuilder('user');
      queryBuilder.where('user.email = :email', { email });

      if (selectPassword) {
          queryBuilder.addSelect('user.password_hash');
      }

      // Optionally load department relationship if needed by the caller
       queryBuilder.leftJoinAndSelect('user.department', 'department');


      return queryBuilder.getOne();
  }

  // findById method
  async findById(id: string): Promise<User | undefined> {
      // Load department relationship when finding by ID
      return this.usersRepository.findOne({ where: { id }, relations: ['department'] });
  }


  async create(userData: Partial<User>): Promise<User> {
    const newUser = this.usersRepository.create(userData);
    return this.usersRepository.save(newUser);
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    this.usersRepository.merge(user, updateData);
    return this.usersRepository.save(user);
  }
}
