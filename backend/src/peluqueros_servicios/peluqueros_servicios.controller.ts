import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PeluquerosServiciosService } from './peluqueros_servicios.service';
import { CreatePeluquerosServicioDto } from './dto/create-peluqueros_servicio.dto';
import { UpdatePeluquerosServicioDto } from './dto/update-peluqueros_servicio.dto';

@Controller('peluqueros-servicios')
export class PeluquerosServiciosController {
  constructor(
    private readonly peluquerosServiciosService: PeluquerosServiciosService,
  ) {}

  @Post()
  create(@Body() createPeluquerosServicioDto: CreatePeluquerosServicioDto) {
    return this.peluquerosServiciosService.create(createPeluquerosServicioDto);
  }

  @Get()
  findAll() {
    return this.peluquerosServiciosService.findAll();
  }

  @Get(':peluqueroId/:servicioId')
  findOne(
    @Param('peluqueroId') peluqueroId: string,
    @Param('servicioId') servicioId: string,
  ) {
    return this.peluquerosServiciosService.findOneComposite(
      +peluqueroId,
      +servicioId,
    );
  }

  @Patch(':peluqueroId/:servicioId')
  update(
    @Param('peluqueroId') peluqueroId: string,
    @Param('servicioId') servicioId: string,
    @Body() dto: UpdatePeluquerosServicioDto,
  ) {
    return this.peluquerosServiciosService.updateComposite(
      +peluqueroId,
      +servicioId,
      dto,
    );
  }

  @Delete(':peluqueroId/:servicioId')
  remove(
    @Param('peluqueroId') peluqueroId: string,
    @Param('servicioId') servicioId: string,
  ) {
    return this.peluquerosServiciosService.removeComposite(
      +peluqueroId,
      +servicioId,
    );
  }
}
