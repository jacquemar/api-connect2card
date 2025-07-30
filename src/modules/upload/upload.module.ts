import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { S3Service } from '../../services/s3.service';
import { UsersModule } from '../users/users.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [UsersModule, HttpModule],
  controllers: [UploadController],
  providers: [UploadService, S3Service],
  exports: [UploadService],
})
export class UploadModule {} 