// backend/src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module'; // Import UsersModule
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt'; // Import JwtModule
import { JwtStrategy } from './jwt.strategy'; // Import JwtStrategy
import { LocalStrategy } from './local.strategy'; // Import LocalStrategy
import { ConfigService, ConfigModule } from '@nestjs/config'; // Import ConfigService and ConfigModule for JWT secret

@Module({
  imports: [
    UsersModule, // Needs access to UsersService
    PassportModule,
    JwtModule.registerAsync({ // Configure JwtModule asynchronously to use ConfigService
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // Get secret from configuration
        signOptions: { expiresIn: '60m' }, // Example: token expires in 60 minutes
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy], // Provide the AuthService and strategies
  exports: [AuthService, JwtModule], // Export AuthService and JwtModule if needed by other modules
})
export class AuthModule {}
