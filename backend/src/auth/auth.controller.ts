import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/forgot-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('verify-otp')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @Post('resend-otp')
  resendOtp(@Body() body: { email: string; type: 'registration' | 'forgot-password' }) {
    return this.authService.resendOtp(body.email, body.type);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  // Real-time uniqueness checks (GET with query params)
  @Get('check-email')
  checkEmail(@Query('email') email: string) {
    return this.authService.checkEmailAvailability(email);
  }

  @Get('check-username')
  checkUsername(@Query('username') username: string) {
    return this.authService.checkUsernameAvailability(username);
  }

  // Protected route — returns logged-in user profile
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Request() req: any) {
    return this.authService.getMe(req.user.userId);
  }
}
