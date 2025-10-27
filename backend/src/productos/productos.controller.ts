import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAccessAuthGuard } from 'src/auth/guards/jwt-access-auth.guard';
import { Public } from 'src/auth/decorators/auth-public.decorator';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { ProductosService } from './productos.service';
import { Producto } from './entities/producto.entity';

@UseGuards(JwtAccessAuthGuard)
@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Post()
  create(@Body() createProductoDto: CreateProductoDto): Promise<Producto> {
    return this.productosService.create(createProductoDto);
  }

  @Get()
  findAll(): Promise<Producto[]> {
    return this.productosService.findAll();
  }

  @Public()
  @Get('activos')
  findActive(): Promise<Producto[]> {
    return this.productosService.findActive();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Producto> {
    return this.productosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductoDto: UpdateProductoDto,
  ): Promise<Producto> {
    return this.productosService.update(id, updateProductoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.productosService.remove(id);
  }

  @Patch(':id/stock')
  updateStock(
    @Param('id', ParseIntPipe) id: number,
    @Body('quantity', ParseIntPipe) quantity: number,
  ): Promise<Producto> {
    return this.productosService.updateStock(id, quantity);
  }
}
