import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
  MaxLength,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  fullname: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[6-9]\d{9}$/, { message: 'Please provide a valid 10-digit Indian mobile number' })
  mobileNumber: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;
}
