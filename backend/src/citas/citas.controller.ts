import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CitasService } from './citas.service';
import { CreateCitaDto } from './dto/create-cita.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';
import { Public } from '../auth/decorators/auth-public.decorator';
import { JwtAccessAuthGuard } from 'src/auth/guards/jwt-access-auth.guard';

@Controller('citas')
export class CitasController {
  constructor(private readonly citasService: CitasService) {}

  // Permitir crear citas sin autenticación (clientes públicos)
  @Public()
  @Post()
  create(@Body() createCitaDto: CreateCitaDto) {
    return this.citasService.create(createCitaDto);
  }

  // Permitir listar citas públicamente (necesario para validar disponibilidad)
  @Public()
  @Get()
  findAll() {
    return this.citasService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.citasService.findOne(+id);
  }

  // Permitir actualizar citas públicamente (para cambiar estado a "Pagada")
  @Public()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCitaDto: UpdateCitaDto) {
    return this.citasService.update(+id, updateCitaDto);
  }

  @UseGuards(JwtAccessAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.citasService.remove(+id);
  }
}
