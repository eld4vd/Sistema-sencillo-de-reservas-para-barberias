import { Test, TestingModule } from '@nestjs/testing';
import { PeluquerosService } from './peluqueros.service';

describe('PeluquerosService', () => {
  let service: PeluquerosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PeluquerosService],
    }).compile();

    service = module.get<PeluquerosService>(PeluquerosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
