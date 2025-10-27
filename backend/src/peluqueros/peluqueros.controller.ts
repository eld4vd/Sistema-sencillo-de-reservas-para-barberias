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
import { PeluquerosService } from './peluqueros.service';
import { CreatePeluqueroDto } from './dto/create-peluquero.dto';
import { UpdatePeluqueroDto } from './dto/update-peluquero.dto';
import { JwtAccessAuthGuard } from 'src/auth/guards/jwt-access-auth.guard';
import { Public } from 'src/auth/decorators/auth-public.decorator';

@UseGuards(JwtAccessAuthGuard)
@Controller('peluqueros')
export class PeluquerosController {
  constructor(private readonly peluquerosService: PeluquerosService) {}

  @Post()
  create(@Body() createPeluqueroDto: CreatePeluqueroDto) {
    return this.peluquerosService.create(createPeluqueroDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.peluquerosService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.peluquerosService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePeluqueroDto: UpdatePeluqueroDto,
  ) {
    return this.peluquerosService.update(+id, updatePeluqueroDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.peluquerosService.remove(+id);
  }
}
