import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

// Configuration pour la taille des fichiers (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

// Fonction de validation des fichiers
const fileFilter = (req: any, file: Express.Multer.File, callback: any) => {
  if (!file) {
    return callback(new BadRequestException('Aucun fichier fourni'), false);
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return callback(
      new BadRequestException(
        `Type de fichier non autorisé. Types autorisés: ${ALLOWED_MIME_TYPES.join(', ')}`
      ),
      false
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return callback(
      new BadRequestException(`Fichier trop volumineux. Taille maximale: ${MAX_FILE_SIZE / (1024 * 1024)}MB`),
      false
    );
  }

  callback(null, true);
};

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
      fileFilter: fileFilter,
    })
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiQuery({
    name: 'folder',
    description: 'Dossier de destination (optionnel)',
    required: false,
  })
  @ApiOperation({ summary: 'Uploader une image' })
  @ApiResponse({ status: 200, description: 'Image uploadée avec succès' })
  @ApiResponse({ status: 400, description: 'Fichier invalide ou trop volumineux' })
  async uploadImage(
    @UploadedFile() file: any,
    @Query('folder') folder: string = 'images',
  ) {
    return this.uploadService.uploadImage(file, folder);
  }

  @Post('banniere')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
      fileFilter: fileFilter,
    })
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Uploader une bannière' })
  @ApiResponse({ status: 200, description: 'Bannière uploadée avec succès' })
  @ApiResponse({ status: 400, description: 'Fichier invalide ou trop volumineux' })
  async uploadBanniere(@UploadedFile() file: any) {
    return this.uploadService.uploadBanniere(file);
  }

  @Post('photo-profil')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
      fileFilter: fileFilter,
    })
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Uploader une photo de profil' })
  @ApiResponse({
    status: 200,
    description: 'Photo de profil uploadée avec succès',
  })
  @ApiResponse({ status: 400, description: 'Fichier invalide ou trop volumineux' })
  async uploadPhotoProfil(@UploadedFile() file: any) {
    return this.uploadService.uploadPhotoProfil(file);
  }
}
