import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Query,
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

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FileInterceptor('file'))
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
  async uploadImage(
    @UploadedFile() file: any,
    @Query('folder') folder: string = 'images',
  ) {
    return this.uploadService.uploadImage(file, folder);
  }

  @Post('banniere')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FileInterceptor('file'))
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
  async uploadBanniere(@UploadedFile() file: any) {
    return this.uploadService.uploadBanniere(file);
  }

  @Post('photo-profil')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FileInterceptor('file'))
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
  async uploadPhotoProfil(@UploadedFile() file: any) {
    return this.uploadService.uploadPhotoProfil(file);
  }
}
