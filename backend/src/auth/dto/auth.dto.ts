import { IsEmail, IsString, MinLength, Matches, IsNotEmpty, IsOptional } from 'class-validator';

export class RegisterUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'First name cannot be empty' })
  first_name: string;

  @IsString()
  @IsNotEmpty({ message: 'Last name cannot be empty' })
  last_name: string;

  @IsString()
  @IsOptional() // Making this optional as per the general flow, though required in the form
  phone_number?: string;

  @IsString()
  @IsOptional() // Making this optional as per the general flow, though required in the form
  national_id_number?: string;

  @IsString()
  @Matches(
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/,
    { message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' }
  )
  confirm_password: string;
}

export class LoginUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password cannot be empty' })
  password: string;
}