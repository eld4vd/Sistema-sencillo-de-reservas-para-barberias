import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Validate,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { IsStartBeforeEndConstraint } from 'src/common/validators/time-range.validator';
import {
  toTrimmedString,
  toTrimmedStringOrNull,
} from '../../common/utils/transformers';

export class CreatePeluqueroDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100, { message: 'El nombre no puede tener más de 100 caracteres' })
  @Transform(({ value }) => toTrimmedString(value))
  readonly nombre: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @Transform(({ value }) => toTrimmedStringOrNull(value))
  readonly fotoUrl?: string | null;

  @IsOptional()
  @IsString({ message: 'La especialidad debe ser un texto' })
  @MaxLength(200, {
    message: 'La especialidad no puede tener más de 200 caracteres',
  })
  @Transform(({ value }) => toTrimmedStringOrNull(value))
  readonly especialidad?: string | null;

  @IsOptional()
  @IsString({ message: 'El horario de inicio debe ser un texto' })
  @Transform(({ value }) => toTrimmedStringOrNull(value))
  readonly horarioInicio?: string | null;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => toTrimmedStringOrNull(value))
  readonly horarioFin?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50, {
    message: 'Los días libres no pueden tener más de 50 caracteres',
  })
  @Transform(({ value }) => toTrimmedStringOrNull(value))
  readonly diasLibres?: string | null;

  // Validación personalizada para el rango de horario
  @Validate(IsStartBeforeEndConstraint)
  private readonly _timeRangeCheck?: true;
}
