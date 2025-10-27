import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import {
  toOptionalBoolean,
  toTrimmedString,
  toTrimmedStringOrNull,
} from '../../common/utils/transformers';

export class CreateServicioDto {
  @IsString({ message: 'El nombre debe ser un texto' })
  @MaxLength(100, { message: 'El nombre no puede tener más de 100 caracteres' })
  @Transform(({ value }) => toTrimmedString(value))
  readonly nombre: string;

  @IsNumber({}, { message: 'El precio debe ser un número' })
  @IsNotEmpty({ message: 'El precio es obligatorio' })
  @IsPositive({ message: 'El precio debe ser un número positivo' })
  @Type(() => Number)
  readonly precio: number;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  readonly duracion: number; // minutos

  @IsOptional()
  @IsString()
  @Transform(({ value }) => toTrimmedStringOrNull(value))
  readonly descripcion?: string | null;

  @IsOptional()
  @Transform(({ value }) => toOptionalBoolean(value))
  @IsBoolean({ message: 'El estado activo debe ser un valor booleano' })
  readonly activo?: boolean;
}
