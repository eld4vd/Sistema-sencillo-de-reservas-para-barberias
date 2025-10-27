import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePeluqueroDto } from './dto/create-peluquero.dto';
import { UpdatePeluqueroDto } from './dto/update-peluquero.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Peluquero } from './entities/peluquero.entity';

@Injectable()
export class PeluquerosService {
  constructor(
    @InjectRepository(Peluquero)
    private readonly peluquerosRepository: Repository<Peluquero>,
  ) {}

  //Crear un peluquero
  async create(createPeluqueroDto: CreatePeluqueroDto): Promise<Peluquero> {
    // Validación de duplicado por nombre (si aplica la regla de negocio)
    if (createPeluqueroDto.nombre) {
      const repetido = await this.peluquerosRepository.findOne({
        where: { nombre: createPeluqueroDto.nombre },
      });
      if (repetido) {
        throw new ConflictException('El nombre de peluquero ya está en uso');
      }
    }
    const peluquero = this.peluquerosRepository.create({
      nombre: createPeluqueroDto.nombre,
      fotoUrl: createPeluqueroDto.fotoUrl ?? null,
      especialidad: createPeluqueroDto.especialidad ?? null,
      horarioInicio: createPeluqueroDto.horarioInicio ?? null,
      horarioFin: createPeluqueroDto.horarioFin ?? null,
      diasLibres: createPeluqueroDto.diasLibres ?? null,
    });

    return this.peluquerosRepository.save(peluquero);
  }

  //Listar todos los peluqueros
  async findAll(): Promise<Peluquero[]> {
    return this.peluquerosRepository.find();
  }

  //Obtener un peluquero por ID
  async findOne(id: number): Promise<Peluquero> {
    const peluquero = await this.peluquerosRepository.findOne({
      where: { id },
    });
    if (!peluquero) throw new NotFoundException('Peluquero no encontrado');
    return peluquero;
  }

  //Actualizar un peluquero
  async update(
    id: number,
    updatePeluqueroDto: UpdatePeluqueroDto,
  ): Promise<Peluquero> {
    // Validación de nombre único si se intenta cambiar (excluyendo el propio id)
    if (updatePeluqueroDto.nombre) {
      const repetido = await this.peluquerosRepository.findOne({
        where: { nombre: updatePeluqueroDto.nombre, id: Not(id) },
        withDeleted: true,
      });
      if (repetido) {
        throw new ConflictException('El nombre de peluquero ya está en uso');
      }
    }
    const peluqueroActual = await this.peluquerosRepository.findOne({
      where: { id },
    });

    if (!peluqueroActual) {
      throw new NotFoundException('Peluquero no encontrado');
    }

    const partial: Partial<Peluquero> = {};
    if (updatePeluqueroDto.nombre !== undefined) {
      partial.nombre = updatePeluqueroDto.nombre;
    }
    if (updatePeluqueroDto.fotoUrl !== undefined) {
      partial.fotoUrl = updatePeluqueroDto.fotoUrl ?? null;
    }
    if (updatePeluqueroDto.especialidad !== undefined) {
      partial.especialidad = updatePeluqueroDto.especialidad ?? null;
    }
    if (updatePeluqueroDto.horarioInicio !== undefined) {
      partial.horarioInicio = updatePeluqueroDto.horarioInicio ?? null;
    }
    if (updatePeluqueroDto.horarioFin !== undefined) {
      partial.horarioFin = updatePeluqueroDto.horarioFin ?? null;
    }
    if (updatePeluqueroDto.diasLibres !== undefined) {
      partial.diasLibres = updatePeluqueroDto.diasLibres ?? null;
    }

    const peluqueroActualizado = this.peluquerosRepository.merge(
      peluqueroActual,
      partial,
    );

    return this.peluquerosRepository.save(peluqueroActualizado);
  }

  //Eliminar un peluquero (soft delete)
  async remove(id: number) {
    const peluquero = await this.findOne(id);
    return this.peluquerosRepository.softRemove(peluquero);
  }
}
