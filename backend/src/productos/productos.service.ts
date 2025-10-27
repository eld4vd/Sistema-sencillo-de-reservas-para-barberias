import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, IsNull, Not, Repository } from 'typeorm';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { Producto } from './entities/producto.entity';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private readonly productosRepository: Repository<Producto>,
  ) {}

  async create(createProductoDto: CreateProductoDto): Promise<Producto> {
    const categoriaNormalizada = createProductoDto.categoria ?? null;

    if (createProductoDto.nombre) {
      const where: FindOptionsWhere<Producto> = {
        nombre: createProductoDto.nombre,
      };

      where.categoria =
        categoriaNormalizada === null ? IsNull() : categoriaNormalizada;

      const repetido = await this.productosRepository.findOne({
        where,
        withDeleted: true,
      });

      if (repetido) {
        throw new ConflictException(
          'El nombre de producto ya está en uso en esta categoría',
        );
      }
    }

    const producto = this.productosRepository.create({
      nombre: createProductoDto.nombre,
      descripcion: createProductoDto.descripcion ?? null,
      precio: createProductoDto.precio,
      stock: createProductoDto.stock,
      imagenUrl: createProductoDto.imagenUrl ?? null,
      categoria: categoriaNormalizada,
      activo: createProductoDto.activo ?? true,
    });

    return this.productosRepository.save(producto);
  }

  async findAll(): Promise<Producto[]> {
    return this.productosRepository.find({
      order: { fechaCreacion: 'DESC' },
    });
  }

  async findActive(): Promise<Producto[]> {
    return this.productosRepository.find({
      where: { activo: true },
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Producto> {
    const producto = await this.productosRepository.findOne({
      where: { id },
    });
    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }
    return producto;
  }

  async update(
    id: number,
    updateProductoDto: UpdateProductoDto,
  ): Promise<Producto> {
    const productoActual = await this.productosRepository.findOne({
      where: { id },
    });

    if (!productoActual) {
      throw new NotFoundException('Producto no encontrado');
    }

    if (updateProductoDto.nombre) {
      const categoriaParaValidar =
        updateProductoDto.categoria !== undefined
          ? updateProductoDto.categoria
          : productoActual.categoria ?? null;

      const where: FindOptionsWhere<Producto> = {
        nombre: updateProductoDto.nombre,
        id: Not(id),
      };

      where.categoria =
        categoriaParaValidar === null ? IsNull() : categoriaParaValidar;

      const repetido = await this.productosRepository.findOne({
        where,
        withDeleted: true,
      });

      if (repetido) {
        throw new ConflictException(
          'El nombre de producto ya está en uso en esta categoría',
        );
      }
    }

    const partial: Partial<Producto> = {};
    if (updateProductoDto.nombre !== undefined) {
      partial.nombre = updateProductoDto.nombre;
    }
    if (updateProductoDto.precio !== undefined) {
      partial.precio = updateProductoDto.precio;
    }
    if (updateProductoDto.stock !== undefined) {
      partial.stock = updateProductoDto.stock;
    }
    if (updateProductoDto.descripcion !== undefined) {
      partial.descripcion = updateProductoDto.descripcion ?? null;
    }
    if (updateProductoDto.imagenUrl !== undefined) {
      partial.imagenUrl = updateProductoDto.imagenUrl ?? null;
    }
    if (updateProductoDto.categoria !== undefined) {
      partial.categoria = updateProductoDto.categoria ?? null;
    }
    if (updateProductoDto.activo !== undefined) {
      partial.activo = updateProductoDto.activo;
    }

    const productoActualizado = this.productosRepository.merge(
      productoActual,
      partial,
    );

    return this.productosRepository.save(productoActualizado);
  }

  async remove(id: number): Promise<void> {
    const producto = await this.findOne(id);
    await this.productosRepository.softRemove(producto);
  }

  async updateStock(id: number, delta: number): Promise<Producto> {
    if (!Number.isFinite(delta) || !Number.isInteger(delta)) {
      throw new ConflictException('El ajuste de stock debe ser un número entero');
    }

    return this.productosRepository.manager.transaction(async (manager) => {
      const repo = manager.getRepository(Producto);
      const producto = await repo.findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!producto) {
        throw new NotFoundException(`Producto con ID ${id} no encontrado`);
      }

      const nuevoStock = Number(producto.stock) + Number(delta);
      if (nuevoStock < 0) {
        throw new ConflictException('Stock insuficiente');
      }

      producto.stock = nuevoStock;
      return repo.save(producto);
    });
  }
}
