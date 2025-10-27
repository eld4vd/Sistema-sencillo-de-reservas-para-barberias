import { Test, TestingModule } from '@nestjs/testing';
import { PeluquerosServiciosController } from './peluqueros_servicios.controller';
import { PeluquerosServiciosService } from './peluqueros_servicios.service';

describe('PeluquerosServiciosController', () => {
  let controller: PeluquerosServiciosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PeluquerosServiciosController],
      providers: [PeluquerosServiciosService],
    }).compile();

    controller = module.get<PeluquerosServiciosController>(
      PeluquerosServiciosController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
