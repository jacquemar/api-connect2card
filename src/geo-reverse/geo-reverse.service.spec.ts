import { Test, TestingModule } from '@nestjs/testing';
import { GeoReverseService } from './geo-reverse.service';

describe('GeoReverseService', () => {
  let service: GeoReverseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GeoReverseService],
    }).compile();

    service = module.get<GeoReverseService>(GeoReverseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
