import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'First name cannot be empty' })
  first_name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Last name cannot be empty' })
  last_name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Phone number cannot be empty' })
  phone_number?: string;
}