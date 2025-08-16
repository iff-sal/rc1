import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../common/enums';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | undefined> {
    // Use findOneBy for finding by primary key
    return this.usersRepository.findOneBy({ id });
  }

  async create(userData: Partial<User>): Promise<User> {
    // Ensure password_hash is provided or can be generated
    if (!userData.password_hash) {
        throw new BadRequestException('Password hash is required');
    }

    // Check if user with this email already exists
    const existingUser = await this.findByEmail(userData.email);
    if (existingUser) {
        throw new BadRequestException('User with this email already exists');
    }

    const newUser = this.usersRepository.create(userData);
    return this.usersRepository.save(newUser);
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Prevent updating password_hash directly via this method
    if (updateData.password_hash) {
        delete updateData.password_hash;
    }

    this.usersRepository.merge(user, updateData);
    return this.usersRepository.save(user);
  }

  // Helper method to hash passwords - useful for signup
  async hashPassword(password: string): Promise<string> {
      const saltRounds = 10; // Adjust salt rounds as needed (higher is more secure but slower)
      return bcrypt.hash(password, saltRounds);
  }

   // Helper method to compare passwords
  async comparePassword(password: string, hash: string): Promise<boolean> {
      return bcrypt.compare(password, hash);
  }
}