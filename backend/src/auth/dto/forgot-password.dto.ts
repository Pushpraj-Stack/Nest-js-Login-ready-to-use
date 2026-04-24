import { IsEmail, IsNotEmpty, IsString, MinLength, Length } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  otp: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'New password must be at least 6 characters' })
  newPassword: string;
}
