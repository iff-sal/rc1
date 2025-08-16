import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any): Promise<User | undefined> {
    // In a real application, you might fetch the user from the database
    // based on the payload.sub (user ID) to ensure they are still active
    // and retrieve their latest information.
    // For this example, we assume the user payload contains enough info.
    // Be cautious about exposing sensitive data in the JWT payload.
    const user = await this.usersService.findById(payload.sub); // Assuming payload.sub is the user ID
    if (!user) {
      // User not found or inactive
      return undefined;
    }
    // Remove password hash before returning
    delete user.password_hash;
    return user;
  }
}