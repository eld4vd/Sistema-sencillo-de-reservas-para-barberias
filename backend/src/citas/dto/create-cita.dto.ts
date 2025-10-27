import {
  IsDateString,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import {
  toTrimmedLowerCaseString,
  toTrimmedString,
  toTrimmedStringOrNull,
} from '../../common/utils/transformers';

export class CreateCitaDto {
  @IsNotEmpty({ message: 'La fecha y hora de la cita es obligatoria' })
  @IsDateString()
  @Transform(({ value }) => toTrimmedString(value))
  readonly fechaHora: string; // ISO string

  @IsNotEmpty({ message: 'El ID del peluquero es obligatorio' })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  readonly peluqueroId: number;

  @IsNotEmpty({ message: 'El ID del servicio es obligatorio' })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  readonly servicioId: number;

  @IsNotEmpty({ message: 'El nombre del cliente es obligatorio' })
  @IsString()
  @Transform(({ value }) => toTrimmedString(value))
  readonly clienteNombre: string;

  @IsNotEmpty({ message: 'El email del cliente es obligatorio' })
  @IsEmail()
  @Transform(({ value }) => toTrimmedLowerCaseString(value))
  readonly clienteEmail: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => toTrimmedStringOrNull(value))
  readonly clienteTelefono?: string | null;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => toTrimmedStringOrNull(value))
  readonly notas?: string | null;
}
