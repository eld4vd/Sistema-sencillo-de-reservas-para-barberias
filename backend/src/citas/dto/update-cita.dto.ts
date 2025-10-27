import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateCitaDto } from './create-cita.dto';
import type { EstadoCita } from '../entities/cita.entity';

export class UpdateCitaDto extends PartialType(CreateCitaDto) {
  @IsOptional()
  @IsEnum([, 'Pagada', 'Completada', 'Cancelada'], {
    message: 'El estado debe ser Pagada, Completada o Cancelada',
  })
  readonly estado?: EstadoCita;
}
