import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCitaDto } from './dto/create-cita.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, QueryFailedError, Repository } from 'typeorm';
import { Cita } from './entities/cita.entity';
import { Peluquero } from 'src/peluqueros/entities/peluquero.entity';
import { Servicio } from 'src/servicios/entities/servicio.entity';

@Injectable()
export class CitasService {
  constructor(
    @InjectRepository(Cita)
    private readonly citasRepository: Repository<Cita>,
    @InjectRepository(Peluquero)
    private readonly peluquerosRepository: Repository<Peluquero>,
    @InjectRepository(Servicio)
    private readonly serviciosRepository: Repository<Servicio>,
  ) {}

  // Crear una cita
  async create(createCitaDto: CreateCitaDto): Promise<Cita> {
    const fecha = new Date(createCitaDto.fechaHora);
    const peluquero = await this.validatePeluqueroExists(
      createCitaDto.peluqueroId,
    );
    const servicio = await this.validateServicioExists(
      createCitaDto.servicioId,
    );
    await this.validateNoOverlap(peluquero.id, fecha);

    const cita = this.citasRepository.create({
      fechaHora: fecha,
      peluquero,
      servicio,
      clienteNombre: createCitaDto.clienteNombre,
      clienteEmail: createCitaDto.clienteEmail,
      clienteTelefono: createCitaDto.clienteTelefono ?? null,
      notas: createCitaDto.notas ?? null,
    });
    try {
      return await this.citasRepository.save(cita);
    } catch (error) {
      if (this.isUniqueConstraintViolation(error)) {
        throw new ConflictException(
          'Ya existe una cita para ese peluquero en ese horario',
        );
      }
      throw error;
    }
  }

  // Listar citas
  async findAll(): Promise<Cita[]> {
    return this.citasRepository.find({
      relations: ['peluquero', 'servicio', 'pago'],
      order: { fechaHora: 'ASC' },
    });
  }

  // Obtener cita por ID
  async findOne(id: number): Promise<Cita> {
    const cita = await this.citasRepository.findOne({
      where: { id },
      relations: ['peluquero', 'servicio', 'pago'],
    });
    if (!cita) throw new NotFoundException('Cita no encontrada');
    return cita;
  }

  // Actualizar una cita
  async update(id: number, updateCitaDto: UpdateCitaDto): Promise<Cita> {
    let current: Cita | null = null;
    const needsCurrent = !updateCitaDto.peluqueroId || !updateCitaDto.fechaHora;
    if (needsCurrent) {
      current = await this.findOne(id);
    }

    let peluquero: Peluquero | undefined;
    let servicio: Servicio | undefined;
    if (updateCitaDto.peluqueroId !== undefined) {
      peluquero = await this.validatePeluqueroExists(updateCitaDto.peluqueroId);
    }
    if (updateCitaDto.servicioId !== undefined) {
      servicio = await this.validateServicioExists(updateCitaDto.servicioId);
    }

    const newPeluqueroId = updateCitaDto.peluqueroId ?? current!.peluquero.id;
    const newFecha = updateCitaDto.fechaHora
      ? new Date(updateCitaDto.fechaHora)
      : current!.fechaHora;

    if (
      updateCitaDto.peluqueroId !== undefined ||
      updateCitaDto.fechaHora !== undefined
    ) {
      await this.validateNoOverlap(newPeluqueroId, newFecha, id);
    }

    const partial: Partial<Cita> = { id };
    if (updateCitaDto.fechaHora !== undefined)
      partial.fechaHora = new Date(updateCitaDto.fechaHora);
    if (updateCitaDto.peluqueroId !== undefined) partial.peluquero = peluquero;
    if (updateCitaDto.servicioId !== undefined) partial.servicio = servicio;
    if (updateCitaDto.clienteNombre !== undefined)
      partial.clienteNombre = updateCitaDto.clienteNombre;
    if (updateCitaDto.clienteEmail !== undefined)
      partial.clienteEmail = updateCitaDto.clienteEmail;
    if (updateCitaDto.clienteTelefono !== undefined)
      partial.clienteTelefono = updateCitaDto.clienteTelefono ?? null;
    if (updateCitaDto.notas !== undefined) partial.notas = updateCitaDto.notas ?? null;
    if (updateCitaDto.estado !== undefined) partial.estado = updateCitaDto.estado;

    const preloaded = await this.citasRepository.preload(partial);
    if (!preloaded) throw new NotFoundException('Cita no encontrada');
    try {
      return await this.citasRepository.save(preloaded);
    } catch (error) {
      if (this.isUniqueConstraintViolation(error)) {
        throw new ConflictException(
          'Ya existe una cita para ese peluquero en ese horario',
        );
      }
      throw error;
    }
  }

  // Eliminar (soft delete)
  async remove(id: number) {
    const cita = await this.findOne(id);
    await this.citasRepository.softRemove(cita);
    return { deleted: true };
  }

  // ===== Helpers =====
  private async validatePeluqueroExists(id: number): Promise<Peluquero> {
    const peluquero = await this.peluquerosRepository.findOne({
      where: { id },
    });
    if (!peluquero)
      throw new NotFoundException(`Peluquero con ID ${id} no encontrado`);
    return peluquero;
  }

  private async validateServicioExists(id: number): Promise<Servicio> {
    const servicio = await this.serviciosRepository.findOne({ where: { id } });
    if (!servicio)
      throw new NotFoundException(`Servicio con ID ${id} no encontrado`);
    return servicio;
  }

  private async validateNoOverlap(
    peluqueroId: number,
    fechaHora: Date,
    excludeId?: number,
  ): Promise<void> {
    // Buscar citas existentes que no estén canceladas
    const existing = await this.citasRepository.findOne({
      where: {
        peluquero: { id: peluqueroId },
        fechaHora,
        estado: Not('Cancelada'), // Ignorar citas canceladas
        ...(excludeId ? { id: Not(excludeId) } : {}),
      },
      withDeleted: false,
    });
    if (existing) {
      throw new ConflictException(
        'Ya existe una cita para ese peluquero en ese horario',
      );
    }
  }

  private isUniqueConstraintViolation(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) return false;

    const driverError = error.driverError as { code?: string } | undefined;
    return driverError?.code === '23505';
  }
}
