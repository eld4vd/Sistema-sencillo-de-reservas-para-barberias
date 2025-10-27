import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePeluquerosServicioDto } from './dto/create-peluqueros_servicio.dto';
import { UpdatePeluquerosServicioDto } from './dto/update-peluqueros_servicio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PeluquerosServicio } from './entities/peluqueros_servicio.entity';
import { Peluquero } from 'src/peluqueros/entities/peluquero.entity';
import { Servicio } from 'src/servicios/entities/servicio.entity';

@Injectable()
export class PeluquerosServiciosService {
  constructor(
    @InjectRepository(PeluquerosServicio)
    private readonly peluquerosServiciosRepository: Repository<PeluquerosServicio>,
    @InjectRepository(Peluquero)
    private readonly peluquerosRepository: Repository<Peluquero>,
    @InjectRepository(Servicio)
    private readonly serviciosRepository: Repository<Servicio>,
  ) {}

  // Crear una asignación peluquero-servicio
  async create(
    createPeluquerosServicioDto: CreatePeluquerosServicioDto,
  ): Promise<PeluquerosServicio> {
    const peluquero = await this.validatePeluqueroExists(
      createPeluquerosServicioDto.peluqueroId,
    );
    const servicio = await this.validateServicioExists(
      createPeluquerosServicioDto.servicioId,
    );

    // ⚡️ Verificar si ya existe (activo)
    const existente = await this.peluquerosServiciosRepository.findOne({
      where: {
        peluquero_id: createPeluquerosServicioDto.peluqueroId,
        servicio_id: createPeluquerosServicioDto.servicioId,
      },
      relations: ['peluquero', 'servicio'],
    });
    if (existente) {
      return existente;
    }

    // ⚡️ Verificar si existía pero fue soft-deleted
    const eliminado = await this.peluquerosServiciosRepository.findOne({
      where: {
        peluquero_id: createPeluquerosServicioDto.peluqueroId,
        servicio_id: createPeluquerosServicioDto.servicioId,
      },
      withDeleted: true,
      loadRelationIds: false,
    });
    if (eliminado) {
      await this.peluquerosServiciosRepository.restore({
        peluquero_id: createPeluquerosServicioDto.peluqueroId,
        servicio_id: createPeluquerosServicioDto.servicioId,
      });
      const restaurado = await this.peluquerosServiciosRepository.findOne({
        where: {
          peluquero_id: createPeluquerosServicioDto.peluqueroId,
          servicio_id: createPeluquerosServicioDto.servicioId,
        },
        relations: ['peluquero', 'servicio'],
      });
      if (!restaurado) {
        throw new NotFoundException('Asignación restaurada no encontrada');
      }
      return restaurado;
    }

    // ⚡️ Crear relación con ids y objetos
    const peluquerosServicio = this.peluquerosServiciosRepository.create({
      peluquero_id: createPeluquerosServicioDto.peluqueroId,
      servicio_id: createPeluquerosServicioDto.servicioId,
      peluquero,
      servicio,
    });
    return this.peluquerosServiciosRepository.save(peluquerosServicio);
  }

  // Listar todas las asignaciones
  async findAll(): Promise<PeluquerosServicio[]> {
    return this.peluquerosServiciosRepository.find({
      relations: ['peluquero', 'servicio'],
    });
  }

  // Obtener una asignación por clave compuesta
  async findOneComposite(
    peluqueroId: number,
    servicioId: number,
  ): Promise<PeluquerosServicio> {
    const peluquerosServicio = await this.peluquerosServiciosRepository.findOne(
      {
        where: {
          peluquero_id: peluqueroId,
          servicio_id: servicioId,
        },
        relations: ['peluquero', 'servicio'],
      },
    );
    if (!peluquerosServicio) {
      throw new NotFoundException('Asignación no encontrada');
    }
    return peluquerosServicio;
  }

  // Obtener servicios de un peluquero específico
  async findServicesByPeluquero(
    peluqueroId: number,
  ): Promise<PeluquerosServicio[]> {
    await this.validatePeluqueroExists(peluqueroId);
    return this.peluquerosServiciosRepository.find({
      where: { peluquero_id: peluqueroId },
      relations: ['servicio'],
    });
  }

  // Obtener peluqueros que ofrecen un servicio específico
  async findPeluquerosByServicio(
    servicioId: number,
  ): Promise<PeluquerosServicio[]> {
    await this.validateServicioExists(servicioId);
    return this.peluquerosServiciosRepository.find({
      where: { servicio_id: servicioId },
      relations: ['peluquero'],
    });
  }

  // Actualizar una asignación por clave compuesta
  async updateComposite(
    peluqueroId: number,
    servicioId: number,
    updatePeluquerosServicioDto: UpdatePeluquerosServicioDto,
  ): Promise<PeluquerosServicio> {
    const existing = await this.findOneComposite(peluqueroId, servicioId);

    let peluquero: Peluquero | undefined;
    let servicio: Servicio | undefined;
    if (updatePeluquerosServicioDto.peluqueroId !== undefined) {
      peluquero = await this.validatePeluqueroExists(
        updatePeluquerosServicioDto.peluqueroId,
      );
    }
    if (updatePeluquerosServicioDto.servicioId !== undefined) {
      servicio = await this.validateServicioExists(
        updatePeluquerosServicioDto.servicioId,
      );
    }

    const partial: Partial<PeluquerosServicio> = {
      peluquero_id: existing.peluquero_id,
      servicio_id: existing.servicio_id,
      peluquero: existing.peluquero,
      servicio: existing.servicio,
    };

    if (updatePeluquerosServicioDto.peluqueroId !== undefined) {
      partial.peluquero_id = updatePeluquerosServicioDto.peluqueroId;
      partial.peluquero = peluquero;
    }
    if (updatePeluquerosServicioDto.servicioId !== undefined) {
      partial.servicio_id = updatePeluquerosServicioDto.servicioId;
      partial.servicio = servicio;
    }

    const pre = await this.peluquerosServiciosRepository.preload(partial);
    if (!pre) throw new NotFoundException('Asignación no encontrada');
    return this.peluquerosServiciosRepository.save(pre);
  }

  // Eliminar una asignación por clave compuesta (soft delete)
  async removeComposite(peluqueroId: number, servicioId: number) {
    const peluquerosServicio = await this.findOneComposite(
      peluqueroId,
      servicioId,
    );
    return this.peluquerosServiciosRepository.softRemove(peluquerosServicio);
  }

  // Eliminar todas las asignaciones de un peluquero
  async removeAllByPeluquero(peluqueroId: number) {
    const asignaciones = await this.findServicesByPeluquero(peluqueroId);
    return this.peluquerosServiciosRepository.softRemove(asignaciones);
  }

  // Eliminar todas las asignaciones de un servicio
  async removeAllByServicio(servicioId: number) {
    const asignaciones = await this.findPeluquerosByServicio(servicioId);
    return this.peluquerosServiciosRepository.softRemove(asignaciones);
  }

  // 🔧 HELPER METHODS
  private async validatePeluqueroExists(
    peluqueroId: number,
  ): Promise<Peluquero> {
    const peluquero = await this.peluquerosRepository.findOne({
      where: { id: peluqueroId },
    });
    if (!peluquero) {
      throw new NotFoundException(
        `Peluquero con ID ${peluqueroId} no encontrado`,
      );
    }
    return peluquero;
  }

  private async validateServicioExists(servicioId: number): Promise<Servicio> {
    const servicio = await this.serviciosRepository.findOne({
      where: { id: servicioId },
    });
    if (!servicio) {
      throw new NotFoundException(
        `Servicio con ID ${servicioId} no encontrado`,
      );
    }
    return servicio;
  }
}
