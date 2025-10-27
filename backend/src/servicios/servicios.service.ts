import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThanOrEqual, Not, Repository } from 'typeorm';
import { Servicio } from './entities/servicio.entity';

@Injectable()
export class ServiciosService {
  constructor(
    @InjectRepository(Servicio)
    private readonly serviciosRepository: Repository<Servicio>,
  ) {}

  //Crear un servicio
  async create(createServicioDto: CreateServicioDto): Promise<Servicio> {
    // Validación de duplicado por nombre (si aplica la regla de negocio)
    if (createServicioDto.nombre) {
      const repetido = await this.serviciosRepository.findOne({
        where: { nombre: createServicioDto.nombre },
      });
      if (repetido) {
        throw new ConflictException('El nombre de servicio ya está en uso');
      }
    }
    const servicio = this.serviciosRepository.create({
      nombre: createServicioDto.nombre,
      precio: createServicioDto.precio,
      duracion: createServicioDto.duracion,
      descripcion: createServicioDto.descripcion ?? null,
      activo: createServicioDto.activo ?? true,
    });

    return this.serviciosRepository.save(servicio);
  }

  //Listar todos los servicios
  async findAll(): Promise<Servicio[]> {
    return this.serviciosRepository.find();
  }

  //Obtener un servicio por ID
  async findOne(id: number): Promise<Servicio> {
    const servicio = await this.serviciosRepository.findOne({
      where: { id },
    });
    if (!servicio) throw new NotFoundException('Servicio no encontrado');
    return servicio;
  }

  //Actualizar un servicio
  async update(
    id: number,
    updateServicioDto: UpdateServicioDto,
  ): Promise<Servicio> {
    // Validación de nombre único si se intenta cambiar (excluyendo el propio id)
    if (updateServicioDto.nombre) {
      const repetido = await this.serviciosRepository.findOne({
        where: { nombre: updateServicioDto.nombre, id: Not(id) },
        withDeleted: true,
      });
      if (repetido) {
        throw new ConflictException('El nombre de servicio ya está en uso');
      }
    }
    const servicioActual = await this.serviciosRepository.findOne({
      where: { id },
    });

    if (!servicioActual) {
      throw new NotFoundException('Servicio no encontrado');
    }

    const partial: Partial<Servicio> = {};
    if (updateServicioDto.nombre !== undefined) {
      partial.nombre = updateServicioDto.nombre;
    }
    if (updateServicioDto.precio !== undefined) {
      partial.precio = updateServicioDto.precio;
    }
    if (updateServicioDto.duracion !== undefined) {
      partial.duracion = updateServicioDto.duracion;
    }
    if (updateServicioDto.descripcion !== undefined) {
      partial.descripcion = updateServicioDto.descripcion ?? null;
    }
    if (updateServicioDto.activo !== undefined) {
      partial.activo = updateServicioDto.activo;
    }

    const servicioActualizado = this.serviciosRepository.merge(
      servicioActual,
      partial,
    );

    return this.serviciosRepository.save(servicioActualizado);
  }

  //Eliminar un servicio (soft delete)
  async remove(id: number) {
    const servicio = await this.findOne(id);
    return this.serviciosRepository.softRemove(servicio);
  }

  //Método adicional útil para servicios: buscar por rango de precio
  async findByPriceRange(
    minPrecio: number,
    maxPrecio: number,
  ): Promise<Servicio[]> {
    return this.serviciosRepository.find({
      where: {
        precio: Between(minPrecio, maxPrecio),
      },
    });
  }

  //Método adicional: buscar por duración máxima
  async findByMaxDuration(maxDuracion: number): Promise<Servicio[]> {
    return this.serviciosRepository.find({
      where: {
        duracion: LessThanOrEqual(maxDuracion),
      },
    });
  }
}
