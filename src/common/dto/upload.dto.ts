import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class UploadPhotoDto {
  @ApiProperty({
    description: 'Photo en format base64',
    example: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...',
  })
  @IsString()
  @IsNotEmpty()
  photo: string;

  @ApiProperty({
    description: 'Nom du fichier (optionnel)',
    example: 'profile-photo.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  fileName?: string;
}

export class UploadProfilePhotoDto extends UploadPhotoDto {}

export class UploadBannerPhotoDto extends UploadPhotoDto {}

export class PresignedUrlDto {
  @ApiProperty({
    description: 'Nom du fichier',
    example: 'photo.jpg',
  })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty({
    description: 'Type MIME du fichier',
    example: 'image/jpeg',
  })
  @IsString()
  @IsNotEmpty()
  fileType: string;

  @ApiProperty({
    description: 'Dossier de destination',
    example: 'profile-photos',
    required: false,
  })
  @IsString()
  @IsOptional()
  folder?: string;
}
