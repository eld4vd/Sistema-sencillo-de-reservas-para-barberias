import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';
import {
  toOptionalBoolean,
  toTrimmedString,
  toTrimmedStringOrNull,
} from '../../common/utils/transformers';

export class CreateProductoDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  @Transform(({ value }) => toTrimmedString(value))
  readonly nombre: string;

  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El precio debe ser un número con máximo 2 decimales' },
  )
  @Min(0, { message: 'El precio debe ser mayor o igual a 0' })
  readonly precio: number;

  @Type(() => Number)
  @IsInt({ message: 'El stock debe ser un número entero' })
  @Min(0, { message: 'El stock debe ser mayor o igual a 0' })
  readonly stock: number;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @MaxLength(255, { message: 'La descripción no puede exceder 255 caracteres' })
  @Transform(({ value }) => toTrimmedStringOrNull(value))
  readonly descripcion?: string | null;

  @IsOptional()
  @IsUrl({}, { message: 'La URL de la imagen no es válida' })
  @MaxLength(255, { message: 'La URL de la imagen no puede exceder 255 caracteres' })
  @Transform(({ value }) => toTrimmedStringOrNull(value))
  readonly imagenUrl?: string | null;

  @IsOptional()
  @IsString({ message: 'La categoría debe ser una cadena de texto' })
  @MaxLength(50, { message: 'La categoría no puede exceder 50 caracteres' })
  @Transform(({ value }) => toTrimmedStringOrNull(value))
  readonly categoria?: string | null;

  @IsOptional()
  @Transform(({ value }) => toOptionalBoolean(value))
  @IsBoolean({ message: 'El estado activo debe ser un valor booleano' })
  readonly activo?: boolean;
}
