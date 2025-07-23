import { Test, TestingModule } from '@nestjs/testing';
import { GeoReverseController } from './geo-reverse.controller';

describe('GeoReverseController', () => {
  let controller: GeoReverseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GeoReverseController],
    }).compile();

    controller = module.get<GeoReverseController>(GeoReverseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
