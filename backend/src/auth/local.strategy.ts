// backend/src/auth/local.strategy.ts
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    // Configure the strategy to use 'email' instead of 'username'
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<any> {
    // Use the authService to validate the user
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    // If validation is successful, return the user object
    return user;
  }
}
