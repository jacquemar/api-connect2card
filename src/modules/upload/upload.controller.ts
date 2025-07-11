import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('banniere')
  @UseInterceptors(FileInterceptor('file'))
  async uploadBanniere(@UploadedFile() file: any) {
    return this.uploadService.uploadBanniere(file);
  }

  @Post('photoProfil')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPhotoProfil(@UploadedFile() file: any) {
    return this.uploadService.uploadPhotoProfil(file);
  }
}
