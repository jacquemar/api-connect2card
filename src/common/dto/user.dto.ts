import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  userName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class UpdateUserProfileDto {
  @IsOptional()
  @IsString()
  nomComplet?: string;

  @IsOptional()
  @IsString()
  titre?: string;

  @IsOptional()
  @IsString()
  banniereURL?: string;

  @IsOptional()
  @IsString()
  photoProfilURL?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  facebook?: string;

  @IsOptional()
  @IsString()
  instagram?: string;

  @IsOptional()
  @IsString()
  snapchat?: string;

  @IsOptional()
  @IsString()
  youtube?: string;

  @IsOptional()
  @IsString()
  tiktok?: string;

  @IsOptional()
  @IsString()
  twitter?: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsOptional()
  @IsString()
  pinterest?: string;

  @IsOptional()
  @IsString()
  linkedin?: string;

  @IsOptional()
  @IsString()
  mail?: string;

  @IsOptional()
  @IsString()
  web?: string;

  @IsOptional()
  @IsString()
  googleReview?: string;

  @IsOptional()
  @IsString()
  tripadvisor?: string;

  @IsOptional()
  @IsString()
  behance?: string;

  @IsOptional()
  @IsString()
  service1?: string;

  @IsOptional()
  @IsString()
  service2?: string;

  @IsOptional()
  @IsString()
  service3?: string;

  @IsOptional()
  @IsString()
  service4?: string;

  @IsOptional()
  @IsString()
  telegram?: string;

  @IsOptional()
  @IsBoolean()
  isLocationEnabled?: boolean;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  address?: string;
}

export class CheckEmailDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class CheckUsernameDto {
  @IsNotEmpty()
  @IsString()
  userName: string;
}
