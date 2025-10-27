import { Module } from '@nestjs/common';
import { PeluquerosService } from './peluqueros.service';
import { PeluquerosController } from './peluqueros.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Peluquero } from './entities/peluquero.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Peluquero])],
  controllers: [PeluquerosController],
  providers: [PeluquerosService],
  exports: [PeluquerosService],
})
export class PeluquerosModule {}
