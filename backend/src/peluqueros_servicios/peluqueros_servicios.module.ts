import { Module } from '@nestjs/common';
import { PeluquerosServiciosService } from './peluqueros_servicios.service';
import { PeluquerosServiciosController } from './peluqueros_servicios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PeluquerosServicio } from './entities/peluqueros_servicio.entity';
import { Peluquero } from 'src/peluqueros/entities/peluquero.entity';
import { Servicio } from 'src/servicios/entities/servicio.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PeluquerosServicio, Peluquero, Servicio]),
  ],
  controllers: [PeluquerosServiciosController],
  providers: [PeluquerosServiciosService],
  exports: [PeluquerosServiciosService],
})
export class PeluquerosServiciosModule {}
