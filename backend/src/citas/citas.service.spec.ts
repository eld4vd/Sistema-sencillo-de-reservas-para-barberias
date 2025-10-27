import { Test, TestingModule } from '@nestjs/testing';
import { CitasService } from './citas.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Cita } from './entities/cita.entity';
import { Peluquero } from '../peluqueros/entities/peluquero.entity';
import { Servicio } from '../servicios/entities/servicio.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateCitaDto } from './dto/create-cita.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';

type ValidatePeluqueroExists = (id: number) => Promise<Peluquero>;
type ValidateServicioExists = (id: number) => Promise<Servicio>;
type ValidateNoOverlap = (
  peluqueroId: number,
  fechaHora: Date,
  excludeId?: number,
) => Promise<void>;

type CitasServiceInternals = {
  validatePeluqueroExists: ValidatePeluqueroExists;
  validateServicioExists: ValidateServicioExists;
  validateNoOverlap: ValidateNoOverlap;
};

describe('CitasService Mejorado', () => {
  let service: CitasService;
  let citasRepository: jest.Mocked<Repository<Cita>>;
  let serviceInternals: CitasServiceInternals;
  let validatePeluqueroExistsSpy: jest.SpyInstance<
    ReturnType<ValidatePeluqueroExists>,
    Parameters<ValidatePeluqueroExists>
  >;
  let validateNoOverlapSpy: jest.SpyInstance<
    ReturnType<ValidateNoOverlap>,
    Parameters<ValidateNoOverlap>
  >;

  function mockCita(overrides: Partial<Cita> = {}): Cita {
    return {
      id: 1,
      fechaHora: new Date('2025-10-26T14:00:00Z'),
      peluquero: { id: 1 } as Peluquero,
      servicio: { id: 1 } as Servicio,
      clienteNombre: 'Juan',
      clienteEmail: 'juan@example.com',
      clienteTelefono: '123456789',
      notas: 'ninguna',
      estado: 'Pendiente',
      fechaCreacion: new Date('2025-09-01T10:00:00Z'),
      fechaModificacion: new Date('2025-09-01T10:00:00Z'),
      fechaEliminacion: undefined,
      pago: undefined,
      ...overrides,
    };
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CitasService,
        {
          provide: getRepositoryToken(Cita),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            preload: jest.fn(),
            softRemove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Peluquero),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(Servicio),
          useValue: { findOne: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<CitasService>(CitasService);
    citasRepository = module.get(getRepositoryToken(Cita));
    serviceInternals = service as unknown as CitasServiceInternals;

    // Mock helpers privados
    validatePeluqueroExistsSpy = jest
      .spyOn(serviceInternals, 'validatePeluqueroExists')
      .mockImplementation((id: number) => Promise.resolve({ id } as Peluquero));
    jest
      .spyOn(serviceInternals, 'validateServicioExists')
      .mockImplementation((id: number) => Promise.resolve({ id } as Servicio));
    validateNoOverlapSpy = jest
      .spyOn(serviceInternals, 'validateNoOverlap')
      .mockResolvedValue(undefined);
  });

  describe('create', () => {
    it('debe crear una cita correctamente', async () => {
      const createDto: CreateCitaDto = {
        fechaHora: '2025-10-26T14:00:00Z',
        peluqueroId: 1,
        servicioId: 1,
        clienteNombre: 'Juan',
        clienteEmail: 'juan@example.com',
      };
      const cita = mockCita();
      (citasRepository.create as jest.Mock).mockReturnValue(cita);
      (citasRepository.save as jest.Mock).mockResolvedValue(cita);

      const result = await service.create(createDto);
      expect(result).toEqual(cita);
    });

    it('debe lanzar NotFoundException si peluquero no existe', async () => {
      validatePeluqueroExistsSpy.mockImplementationOnce(() =>
        Promise.reject(new NotFoundException()),
      );
      await expect(
        service.create({
          fechaHora: '2025-10-26T14:00:00Z',
          peluqueroId: 1,
          servicioId: 1,
          clienteNombre: 'x',
          clienteEmail: 'x@example.com',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar ConflictException si ya existe cita en mismo horario', async () => {
      validateNoOverlapSpy.mockImplementationOnce(() =>
        Promise.reject(new ConflictException('Horario ocupado')),
      );
      await expect(
        service.create({
          fechaHora: '2025-10-26T14:00:00Z',
          peluqueroId: 1,
          servicioId: 1,
          clienteNombre: 'x',
          clienteEmail: 'x@example.com',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('debe aceptar campos opcionales como undefined', async () => {
      const createDto: CreateCitaDto = {
        fechaHora: '2025-10-26T14:00:00Z',
        peluqueroId: 1,
        servicioId: 1,
        clienteNombre: 'Juan',
        clienteEmail: 'juan@example.com',
        clienteTelefono: undefined,
        notas: undefined,
      };
      const cita = mockCita({ clienteTelefono: undefined, notas: undefined });
      (citasRepository.create as jest.Mock).mockReturnValue(cita);
      (citasRepository.save as jest.Mock).mockResolvedValue(cita);

      const result = await service.create(createDto);
      expect(result.clienteTelefono).toBeUndefined();
      expect(result.notas).toBeUndefined();
    });
  });

  describe('update', () => {
    it('debe actualizar nombre y fechaHora correctamente', async () => {
      const citaActual = mockCita();
      const nuevaFecha = '2025-10-27T10:00:00Z';
      const updateDto: UpdateCitaDto = {
        clienteNombre: 'Pedro',
        fechaHora: nuevaFecha,
      };
      const preloaded = {
        ...citaActual,
        ...updateDto,
        fechaHora: new Date(nuevaFecha),
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(citaActual);
      (citasRepository.preload as jest.Mock).mockResolvedValue(preloaded);
      (citasRepository.save as jest.Mock).mockResolvedValue(preloaded);

      const result = await service.update(1, updateDto);
      expect(result.clienteNombre).toBe('Pedro');
      expect(result.fechaHora.toISOString()).toBe(updateDto.fechaHora);
    });

    it('debe lanzar ConflictException si hay solapamiento en update', async () => {
      const citaActual = mockCita();
      const updateDto: UpdateCitaDto = {
        fechaHora: '2025-10-27T10:00:00Z',
      };
      jest.spyOn(service, 'findOne').mockResolvedValue(citaActual);
      validateNoOverlapSpy.mockImplementationOnce(() =>
        Promise.reject(new ConflictException('Horario ocupado')),
      );

      await expect(service.update(1, updateDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('debe lanzar NotFoundException si no existe cita', async () => {
      jest.spyOn(service, 'findOne').mockImplementation(() => {
        throw new NotFoundException();
      });
      await expect(service.update(1, {} as UpdateCitaDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('debe retornar todas las citas', async () => {
      const citas = [mockCita()];
      (citasRepository.find as jest.Mock).mockResolvedValue(citas);
      expect(await service.findAll()).toBe(citas);
    });
  });

  describe('findOne', () => {
    it('debe retornar una cita existente', async () => {
      const cita = mockCita();
      (citasRepository.findOne as jest.Mock).mockResolvedValue(cita);
      expect(await service.findOne(1)).toBe(cita);
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      (citasRepository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('debe soft eliminar correctamente', async () => {
      const cita = mockCita();
      jest.spyOn(service, 'findOne').mockResolvedValue(cita);
      (citasRepository.softRemove as jest.Mock).mockResolvedValue(cita);

      const result = await service.remove(1);
      expect(result).toEqual({ deleted: true });
    });
  });
});
