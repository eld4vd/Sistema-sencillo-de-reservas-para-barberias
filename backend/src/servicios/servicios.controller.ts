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
import { ServiciosService } from './servicios.service';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';
import { JwtAccessAuthGuard } from 'src/auth/guards/jwt-access-auth.guard';
import { Public } from 'src/auth/decorators/auth-public.decorator';

@UseGuards(JwtAccessAuthGuard)
@Controller('servicios')
export class ServiciosController {
  constructor(private readonly serviciosService: ServiciosService) {}

  @Post()
  create(@Body() createServicioDto: CreateServicioDto) {
    return this.serviciosService.create(createServicioDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.serviciosService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviciosService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateServicioDto: UpdateServicioDto,
  ) {
    return this.serviciosService.update(+id, updateServicioDto);
  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.serviciosService.remove(+id);
  }
}
