import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginUserDto, RegisterUserDto } from './dto/auth.dto';
import { UserRole } from '../common/enums';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    // Select the password_hash field explicitly for validation
    const user = await this.usersService.findByEmail(email, true); // Pass true to select password_hash
    if (user && user.password_hash) {
      const isMatch = await bcrypt.compare(pass, user.password_hash);
      if (isMatch) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password_hash, ...result } = user; // Exclude password_hash from result
        return result;
      }
    }
    return null;
  }

  async signup(registerUserDto: RegisterUserDto): Promise<any> {
    const { email, password, confirm_password, ...userData } = registerUserDto;

    if (password !== confirm_password) {
        throw new BadRequestException('Password and Confirm Password do not match.');
    }

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email address already in use.');
    }

    // Hash the password before creating the user
    const saltRounds = 10; // Cost factor for hashing
    const password_hash = await bcrypt.hash(password, saltRounds);

    const newUser = await this.usersService.create({
      email,
      password_hash,
      ...userData,
      role: UserRole.Citizen, // Default role for signup is Citizen
      is_active: true, // User is active by default
      receives_email_notifications: true, // Opt-in to notifications by default
      department_id: null, // Citizens do not have a department
    });

     // Exclude password_hash from the returned user object
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash: excludedPasswordHash, ...result } = newUser;
    return result;
  }


  async login(user: any) {
    const payload: any = { email: user.email, sub: user.id, role: user.role };

     // Include departmentId in JWT payload for officers
    if (user.role === UserRole.GovernmentOfficer || user.role === UserRole.Admin) {
        // Ensure the department relationship is loaded or fetch it if needed
        const fullUser = await this.usersService.findById(user.id);
        if (fullUser && fullUser.department_id) {
             payload.departmentId = fullUser.department_id;
        }
         // Alternatively, you could load the department relationship in validateUser
         // and ensure it's part of the 'user' object passed to login.
    }

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
