import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from './user.entity';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getProfile(@Request() req): Promise<User> {
    // The user object is attached to the request by the JwtAuthGuard
    return this.usersService.findById(req.user.id);
  }

  @Put('me')
  async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return this.usersService.update(req.user.id, updateUserDto);
  }
}