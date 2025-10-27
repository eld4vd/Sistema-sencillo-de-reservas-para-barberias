import { Test, TestingModule } from '@nestjs/testing';
import { PeluquerosServiciosService } from './peluqueros_servicios.service';

describe('PeluquerosServiciosService', () => {
  let service: PeluquerosServiciosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PeluquerosServiciosService],
    }).compile();

    service = module.get<PeluquerosServiciosService>(
      PeluquerosServiciosService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
