import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto, LoginUserDto } from './dto/auth.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.signup(registerUserDto);
  }

  @UseGuards(AuthGuard('local')) // Placeholder - replace with actual local strategy if implemented or adjust login logic
  @Post('login')
  async login(@Request() req, @Body() loginUserDto: LoginUserDto) {
    // The user object is added to the request by the local strategy
    return this.authService.login(req.user);
  }
}