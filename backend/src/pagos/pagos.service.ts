import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Pago } from './entities/pago.entity';
import { Cita } from 'src/citas/entities/cita.entity';

@Injectable()
export class PagosService {
  constructor(
    @InjectRepository(Pago)
    private readonly pagosRepository: Repository<Pago>,
    @InjectRepository(Cita)
    private readonly citasRepository: Repository<Cita>,
  ) {}

  // Crear un pago
  async create(createPagoDto: CreatePagoDto): Promise<Pago> {
    // Validar que la cita existe
    const cita = await this.validateCitaExists(createPagoDto.citaId);

    // Validación de duplicado por transaccionId (si aplica la regla de negocio)
    if (createPagoDto.transaccionId) {
      const repetido = await this.pagosRepository.findOne({
        where: { transaccionId: createPagoDto.transaccionId },
      });
      if (repetido) {
        throw new ConflictException('El ID de transacción ya está en uso');
      }
    }

    // Validar que no exista un pago duplicado para la misma cita
    const pagoDuplicado = await this.pagosRepository.findOne({
      where: { cita: { id: createPagoDto.citaId } },
    });
    if (pagoDuplicado) {
      throw new ConflictException('Ya existe un pago para esta cita');
    }

    // Los trims y normalizaciones ya se aplican en el DTO (class-transformer)
    const pago = this.pagosRepository.create({
      monto: createPagoDto.monto,
      metodoPago: createPagoDto.metodoPago ?? null,
      transaccionId: createPagoDto.transaccionId ?? null,
      fechaPago: createPagoDto.fechaPago
        ? new Date(createPagoDto.fechaPago)
        : null,
      cita, // Asignar la relación
    });
    return this.pagosRepository.save(pago);
  }

  // Listar todos los pagos (mantener para compatibilidad si es necesario)
  async findAll(): Promise<Pago[]> {
    return this.pagosRepository.find({
      relations: ['cita', 'cita.servicio', 'cita.peluquero'],
      order: { id: 'DESC' },
    });
  }

  // 🚀 Listar pagos con paginación, búsqueda y filtros
  async findAllPaginated(queryDto: any) {
    const {
      page = 1,
      limit = 20,
      search,
      estado,
      periodo = 'todo',
    } = queryDto;

    // Calcular skip
    const skip = (page - 1) * limit;

    // Construir query builder
    const queryBuilder = this.pagosRepository
      .createQueryBuilder('pago')
      .leftJoinAndSelect('pago.cita', 'cita')
      .leftJoinAndSelect('cita.servicio', 'servicio')
      .leftJoinAndSelect('cita.peluquero', 'peluquero')
      .orderBy('pago.fechaCreacion', 'DESC');

    // 🔍 Filtro de búsqueda
    if (search && search.trim()) {
      const searchTerm = `%${search.trim().toLowerCase()}%`;
      queryBuilder.andWhere(
        `(
          LOWER(cita.clienteNombre) LIKE :search OR
          LOWER(cita.clienteEmail) LIKE :search OR
          LOWER(pago.transaccionId) LIKE :search OR
          LOWER(pago.metodoPago) LIKE :search OR
          CAST(pago.id AS TEXT) LIKE :search
        )`,
        { search: searchTerm },
      );
    }

    // 📊 Filtro de estado
    if (estado) {
      queryBuilder.andWhere('pago.estado = :estado', { estado });
    }

    // 📅 Filtro de periodo
    if (periodo && periodo !== 'todo') {
      const now = new Date();
      let startDate: Date | null = null;

      switch (periodo) {
        case 'hoy':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'semana':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          break;
        case 'mes':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 30);
          break;
      }

      if (startDate) {
        queryBuilder.andWhere('pago.fechaCreacion >= :startDate', { startDate });
      }
    }

    // Ejecutar query con paginación
    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    // Calcular metadatos
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // 📈 Calcular estadísticas (solo de los datos filtrados, no paginados)
    const statsQuery = this.pagosRepository
      .createQueryBuilder('pago')
      .leftJoin('pago.cita', 'cita');

    // Aplicar los mismos filtros para las stats
    if (search && search.trim()) {
      const searchTerm = `%${search.trim().toLowerCase()}%`;
      statsQuery.andWhere(
        `(
          LOWER(cita.clienteNombre) LIKE :search OR
          LOWER(cita.clienteEmail) LIKE :search OR
          LOWER(pago.transaccionId) LIKE :search OR
          LOWER(pago.metodoPago) LIKE :search OR
          CAST(pago.id AS TEXT) LIKE :search
        )`,
        { search: searchTerm },
      );
    }

    if (estado) {
      statsQuery.andWhere('pago.estado = :estado', { estado });
    }

    if (periodo && periodo !== 'todo') {
      const now = new Date();
      let startDate: Date | null = null;

      switch (periodo) {
        case 'hoy':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'semana':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          break;
        case 'mes':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 30);
          break;
      }

      if (startDate) {
        statsQuery.andWhere('pago.fechaCreacion >= :startDate', { startDate });
      }
    }

    const stats = await statsQuery
      .select('SUM(pago.monto)', 'totalMonto')
      .addSelect(
        `SUM(CASE WHEN pago.estado = 'Completado' THEN 1 ELSE 0 END)`,
        'completados',
      )
      .addSelect(
        `SUM(CASE WHEN pago.estado = 'Pendiente' THEN 1 ELSE 0 END)`,
        'pendientes',
      )
      .addSelect(
        `SUM(CASE WHEN pago.estado = 'Fallido' THEN 1 ELSE 0 END)`,
        'fallidos',
      )
      .getRawOne();

    const totalMonto = parseFloat(stats.totalMonto) || 0;
    const completados = parseInt(stats.completados) || 0;
    const pendientes = parseInt(stats.pendientes) || 0;
    const fallidos = parseInt(stats.fallidos) || 0;
    const ticketPromedio = total > 0 ? totalMonto / total : 0;

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
      stats: {
        totalMonto,
        completados,
        pendientes,
        fallidos,
        ticketPromedio,
      },
    };
  }

  // Obtener un pago por ID
  async findOne(id: number): Promise<Pago> {
    const pago = await this.pagosRepository.findOne({
      where: { id },
      relations: ['cita'],
    });
    if (!pago) throw new NotFoundException('Pago no encontrado');
    return pago;
  }

  // Obtener pagos por cita ID
  async findByCita(citaId: number): Promise<Pago[]> {
    return this.pagosRepository.find({
      where: { cita: { id: citaId } },
      relations: ['cita'],
    });
  }

  // Actualizar un pago
  async update(id: number, updatePagoDto: UpdatePagoDto): Promise<Pago> {
    // Validación de citaId si se intenta cambiar
    let cita: Cita | undefined;
    if (updatePagoDto.citaId !== undefined) {
      cita = await this.validateCitaExists(updatePagoDto.citaId);
    }

    // Validación de transaccionId único si se intenta cambiar (excluyendo el propio id)
    if (updatePagoDto.transaccionId) {
      const repetido = await this.pagosRepository.findOne({
        where: { transaccionId: updatePagoDto.transaccionId, id: Not(id) },
        withDeleted: true,
      });
      if (repetido) {
        throw new ConflictException('El ID de transacción ya está en uso');
      }
    }

    // Usamos preload para mantener hooks y consistencia
    const partial: Partial<Pago> = { id };
    if (updatePagoDto.citaId !== undefined) partial.cita = cita;
    if (updatePagoDto.monto !== undefined) partial.monto = updatePagoDto.monto;
    if (updatePagoDto.metodoPago !== undefined)
      partial.metodoPago = updatePagoDto.metodoPago ?? null;
    if (updatePagoDto.transaccionId !== undefined)
      partial.transaccionId = updatePagoDto.transaccionId ?? null;
    if (updatePagoDto.fechaPago !== undefined)
      partial.fechaPago = updatePagoDto.fechaPago
        ? new Date(updatePagoDto.fechaPago)
        : null;
    const preloaded = await this.pagosRepository.preload(partial);
    if (!preloaded) {
      throw new NotFoundException('Pago no encontrado');
    }
    return this.pagosRepository.save(preloaded);
  }

  // Eliminar un pago (soft delete)
  async remove(id: number) {
    const pago = await this.findOne(id);
    return this.pagosRepository.softRemove(pago);
  }

  // Método adicional útil para pagos: obtener total de pagos por fecha
  async getTotalByDateRange(
    fechaInicio: string,
    fechaFin: string,
  ): Promise<number> {
    const result = await this.pagosRepository
      .createQueryBuilder('pago')
      .select('SUM(pago.monto)', 'total')
      .where('pago.fechaPago BETWEEN :fechaInicio AND :fechaFin', {
        fechaInicio,
        fechaFin,
      })
      .getRawOne<{ total: string | null }>();

    if (!result?.total) {
      return 0;
    }

    const total = Number.parseFloat(result.total);
    return Number.isNaN(total) ? 0 : total;
  }

  // Método adicional: obtener pagos por método de pago
  async findByMetodoPago(metodoPago: string): Promise<Pago[]> {
    return this.pagosRepository.find({
      where: { metodoPago },
      relations: ['cita'],
    });
  }

  // 🔧 HELPER METHOD - Método privado reutilizable
  private async validateCitaExists(citaId: number): Promise<Cita> {
    const cita = await this.citasRepository.findOne({
      where: { id: citaId },
    });
    if (!cita) {
      throw new NotFoundException(`Cita con ID ${citaId} no encontrada`);
    }
    return cita;
  }
}
