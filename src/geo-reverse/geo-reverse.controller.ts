import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GeoReverseService } from './geo-reverse.service';

@Controller('geo-reverse')
export class GeoReverseController {
  constructor(private readonly geoReverseService: GeoReverseService) {}

  @Get('reverse')
  async reverseGeocode(
    @Query('lat') lat: string,
    @Query('lon') lon: string,
  ): Promise<any> {
    if (!lat || !lon) {
      throw new HttpException(
        'la latitude et la longitude sont requises',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result: any = await this.geoReverseService.reverseGeocode(lat, lon);
      //console.log('Résultat reverse geocode:', result);
      return result;
    } catch (error) {
      console.error('Erreur reverse geocode:', error);
      throw new HttpException(
        'Erreur lors du reverse geocode',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
