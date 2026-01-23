import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsIn } from 'class-validator';
import { USER_ROLES } from '@hvac/shared';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsIn([USER_ROLES.ADMIN, USER_ROLES.TECHNICIAN])
  role: string;

  @IsString()
  @IsOptional()
  phone?: string;
}

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  @IsIn([USER_ROLES.ADMIN, USER_ROLES.TECHNICIAN])
  role?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}
