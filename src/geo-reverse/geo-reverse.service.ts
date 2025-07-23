import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

@Injectable()
export class GeoReverseService {
  constructor(private readonly httpService: HttpService) {}

  async reverseGeocode(lat: string, lon: string): Promise<any> {
    const url = 'https://nominatim.openstreetmap.org/reverse';
    const params = {
      lat,
      lon,
      format: 'json',
      addressdetails: 1,
      zoom: 18,
    };
    const headers = {
      'User-Agent': 'api-connect2card/1.0',
    };
    const response$ = this.httpService.get(url, { params, headers });
    const response: AxiosResponse = await lastValueFrom(response$);
    return response.data;
  }
}
