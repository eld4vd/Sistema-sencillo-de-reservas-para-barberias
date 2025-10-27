import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PagosService } from './pagos.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { QueryPagosDto } from './dto/query-pagos.dto';
import { JwtAccessAuthGuard } from 'src/auth/guards/jwt-access-auth.guard';
import { Public } from '../auth/decorators/auth-public.decorator';

@UseGuards(JwtAccessAuthGuard)
@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  // Permitir crear pagos sin autenticación (clientes públicos)
  @Public()
  @Post()
  create(@Body() createPagoDto: CreatePagoDto) {
    return this.pagosService.create(createPagoDto);
  }

  @Get()
  findAll(@Query() queryDto: QueryPagosDto) {
    return this.pagosService.findAllPaginated(queryDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pagosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePagoDto: UpdatePagoDto) {
    return this.pagosService.update(+id, updatePagoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pagosService.remove(+id);
  }
}
