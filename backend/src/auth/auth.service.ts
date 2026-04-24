import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { Otp, OtpDocument } from '../otp/otp.schema';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/forgot-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    @InjectModel(Otp.name) private otpModel: Model<OtpDocument>,
  ) {}

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async saveOtp(email: string, type: string, userData?: any): Promise<string> {
    await this.otpModel.deleteMany({ email, type }); // remove previous OTPs
    const otp = this.generateOtp();
    await this.otpModel.create({
      email: email.toLowerCase(),
      otp,
      type,
      userData: userData || undefined,
    });
    return otp;
  }

  private signToken(userId: string, email: string, username: string): string {
    return this.jwtService.sign({ sub: userId, email, username });
  }

  // ─── Register ───────────────────────────────────────────────────────────────

  async register(dto: RegisterDto) {
    const emailLower = dto.email.toLowerCase();
    const usernameLower = dto.username.toLowerCase();

    // Check uniqueness
    if (await this.usersService.emailExists(emailLower)) {
      throw new ConflictException('An account with this email already exists');
    }
    if (await this.usersService.usernameExists(usernameLower)) {
      throw new ConflictException('This username is already taken');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    // Store temporary data in OTP record (NOT in Users collection yet)
    const userData = {
      username: usernameLower,
      fullname: dto.fullname,
      email: emailLower,
      mobileNumber: dto.mobileNumber,
      password: hashedPassword,
    };

    // Generate OTP and send email
    const otp = await this.saveOtp(emailLower, 'registration', userData);
    await this.mailService.sendOtpEmail(emailLower, otp, 'registration');

    return {
      message: 'Registration initiated. Please check your email for the OTP to complete your account creation.',
      email: emailLower,
    };
  }

  // ─── Verify OTP (Registration) ───────────────────────────────────────────────

  async verifyOtp(dto: VerifyOtpDto) {
    const emailLower = dto.email.toLowerCase();

    const otpRecord = await this.otpModel.findOne({
      email: emailLower,
      type: dto.type,
    });

    if (!otpRecord) {
      throw new BadRequestException('OTP not found or has expired. Please request a new one.');
    }

    if (otpRecord.otp !== dto.otp) {
      throw new BadRequestException('Invalid OTP. Please check and try again.');
    }

    if (dto.type === 'registration') {
      if (!otpRecord.userData) {
        throw new BadRequestException('Registration data not found. Please register again.');
      }

      // Create the user now that OTP is verified
      const user = await this.usersService.create({
        ...otpRecord.userData,
        isVerified: true,
      });

      // Delete the OTP record
      await this.otpModel.deleteOne({ _id: otpRecord._id });

      // Return JWT so user is logged in immediately
      const token = this.signToken(user._id.toString(), user.email, user.username);
      return {
        message: 'Account created and verified successfully! Welcome aboard.',
        accessToken: token,
        user: {
          id: user._id,
          username: user.username,
          fullname: user.fullname,
          email: user.email,
          mobileNumber: user.mobileNumber,
        },
      };
    }

    // For forgot-password — just confirm OTP is valid and delete it
    await this.otpModel.deleteOne({ _id: otpRecord._id });
    return { message: 'OTP verified. You can now reset your password.' };
  }

  // ─── Resend OTP ─────────────────────────────────────────────────────────────

  async resendOtp(email: string, type: 'registration' | 'forgot-password') {
    const emailLower = email.toLowerCase();

    if (type === 'registration') {
      // For registration, we check the pending OTP record
      const existingOtp = await this.otpModel.findOne({ email: emailLower, type: 'registration' });
      if (!existingOtp) {
        throw new NotFoundException('No pending registration found for this email. Please sign up again.');
      }

      const otp = await this.saveOtp(emailLower, 'registration', existingOtp.userData);
      await this.mailService.sendOtpEmail(emailLower, otp, 'registration');
    } else {
      // For forgot-password, we check the Users collection
      const user = await this.usersService.findByEmail(emailLower);
      if (!user) throw new NotFoundException('No account found with this email');

      const otp = await this.saveOtp(emailLower, 'forgot-password');
      await this.mailService.sendOtpEmail(emailLower, otp, 'forgot-password');
    }

    return { message: 'A new OTP has been sent to your email.' };
  }

  // ─── Login ──────────────────────────────────────────────────────────────────

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email.toLowerCase());

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException(
        'Your account is not verified. Please check your email for the OTP.',
      );
    }

    const token = this.signToken(user._id.toString(), user.email, user.username);

    return {
      message: 'Login successful',
      accessToken: token,
      user: {
        id: user._id,
        username: user.username,
        fullname: user.fullname,
        email: user.email,
        mobileNumber: user.mobileNumber,
      },
    };
  }

  // ─── Forgot Password ────────────────────────────────────────────────────────

  async forgotPassword(dto: ForgotPasswordDto) {
    const emailLower = dto.email.toLowerCase();
    const user = await this.usersService.findByEmail(emailLower);

    if (!user) {
      // Return generic message to prevent email enumeration
      return { message: 'If an account exists with this email, an OTP has been sent.' };
    }

    const otp = await this.saveOtp(emailLower, 'forgot-password');
    await this.mailService.sendOtpEmail(emailLower, otp, 'forgot-password');

    return { message: 'If an account exists with this email, an OTP has been sent.' };
  }

  // ─── Reset Password ─────────────────────────────────────────────────────────

  async resetPassword(dto: ResetPasswordDto) {
    const emailLower = dto.email.toLowerCase();

    const otpRecord = await this.otpModel.findOne({
      email: emailLower,
      type: 'forgot-password',
    });

    if (!otpRecord) {
      throw new BadRequestException('OTP not found or has expired. Please request a new one.');
    }
    if (otpRecord.otp !== dto.otp) {
      throw new BadRequestException('Invalid OTP.');
    }

    await this.otpModel.deleteOne({ _id: otpRecord._id });

    const user = await this.usersService.findByEmail(emailLower);
    if (!user) throw new NotFoundException('User not found');

    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);
    await this.usersService.updateById(user._id.toString(), { password: hashedPassword });

    return { message: 'Password reset successfully. You can now log in with your new password.' };
  }

  // ─── Check Uniqueness ───────────────────────────────────────────────────────

  async checkEmailAvailability(email: string) {
    const exists = await this.usersService.emailExists(email.toLowerCase());
    return { available: !exists, message: exists ? 'Email is already registered' : 'Email is available' };
  }

  async checkUsernameAvailability(username: string) {
    const exists = await this.usersService.usernameExists(username.toLowerCase());
    return { available: !exists, message: exists ? 'Username is already taken' : 'Username is available' };
  }

  // ─── Get Profile (Protected) ─────────────────────────────────────────────────

  async getMe(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
