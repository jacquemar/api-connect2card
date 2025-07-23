import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GeoReverseController } from './geo-reverse.controller';
import { GeoReverseService } from './geo-reverse.service';

@Module({
  imports: [HttpModule],
  controllers: [GeoReverseController],
  providers: [GeoReverseService],
})
export class GeoReverseModule {}
