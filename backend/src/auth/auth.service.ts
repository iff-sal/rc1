// backend/src/auth/auth.service.ts
import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service'; // Assuming you have a UsersService
import { JwtService } from '@nestjs/jwt'; // Assuming you have JwtService
import * as bcrypt from 'bcrypt';
import { RegisterUserDto } from './dto/auth.dto';
import { UserRole } from '../common/enums'; // Assuming UserRole enum exists
import { User } from '../users/user.entity'; // Assuming User entity exists

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService, // Inject JwtService
  ) {}

  // Method used by LocalStrategy to validate credentials
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email); // Assuming findByEmail exists in UsersService

    if (user && user.password_hash) { // Check if user and password_hash exist
      const isMatch = await bcrypt.compare(pass, user.password_hash);
      if (isMatch) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password_hash, ...result } = user; // Exclude password_hash
        return result; // Return user object without password hash
      }
    }
    return null; // Return null if user not found or password doesn't match
  }

  async signup(registerUserDto: RegisterUserDto) {
    const { email, password, ...userData } = registerUserDto;

    // Check if user already exists by email (already present in the original code [1])
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email address already in use.');
    }

    // Hash the password before creating the user (already present in the original code [1])
    const saltRounds = 10; // Cost factor for hashing
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Create the new user (already present in the original code [1])
    const newUser = await this.usersService.create({
      email,
      password_hash,
      ...userData,
      role: UserRole.Citizen, // Default role for signup is Citizen
      is_active: true, // User is active by default
      receives_email_notifications: true, // Opt-in to notifications by default
      department_id: null, // Citizens do not have a department
    });

    // Exclude password_hash from the returned user object (already present in the original code [1])
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash: excludedPasswordHash, ...result } = newUser;
    return result;
  }

  // Method used by AuthController after LocalStrategy validates the user
  async login(user: any) { // 'user' here is the object returned by LocalStrategy.validate
    // Generate JWT payload
    const payload = { email: user.email, sub: user.id, role: user.role };

    // Return access token and user details
    return {
      access_token: this.jwtService.sign(payload),
      user: user, // Include user details in the response for the frontend
    };
  }
}
