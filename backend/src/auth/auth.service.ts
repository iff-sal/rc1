import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterUserDto, LoginUserDto } from './dto/auth.dto';
import { User } from '../users/user.entity';
import { UserRole } from '../common/enums';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user) {
      const isPasswordValid = await bcrypt.compare(pass, user.password_hash);
      if (isPasswordValid) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password_hash, ...result } = user; // Exclude password_hash from result
        return result;
      }
    }
    return null;
  }

  async signup(registerUserDto: RegisterUserDto): Promise<User> {
    const existingUser = await this.usersService.findByEmail(registerUserDto.email);
    if (existingUser) {
      throw new UnauthorizedException('User with this email already exists');
    }

    if (registerUserDto.password !== registerUserDto.confirm_password) {
        throw new UnauthorizedException('Passwords do not match');
    }

    const passwordHash = await bcrypt.hash(registerUserDto.password, 10); // Hash password with salt rounds

    const newUser = await this.usersService.create({
      email: registerUserDto.email,
      password_hash: passwordHash,
      first_name: registerUserDto.first_name,
      last_name: registerUserDto.last_name,
      phone_number: registerUserDto.phone_number,
      national_id_number: registerUserDto.national_id_number,
      role: UserRole.Citizen, // Assign citizen role by default
      is_active: true,
      receives_email_notifications: true,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...result } = newUser; // Exclude password_hash from result
    return result as User;
  }


  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}