import { Test, TestingModule } from '@nestjs/testing';
import { PeluquerosController } from './peluqueros.controller';
import { PeluquerosService } from './peluqueros.service';

describe('PeluquerosController', () => {
  let controller: PeluquerosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PeluquerosController],
      providers: [PeluquerosService],
    }).compile();

    controller = module.get<PeluquerosController>(PeluquerosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
