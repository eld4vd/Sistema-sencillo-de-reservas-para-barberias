import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { toTrimmedStringOrNull } from '../../common/utils/transformers';

export class CreatePagoDto {
  @IsInt({ message: 'El ID de la cita debe ser un número entero' })
  @Min(1, { message: 'El ID de la cita debe ser un número positivo' })
  @Type(() => Number)
  readonly citaId: number;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  readonly monto: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => toTrimmedStringOrNull(value))
  readonly metodoPago?: string | null;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => toTrimmedStringOrNull(value))
  readonly transaccionId?: string | null;

  @IsOptional()
  @IsDateString()
  readonly fechaPago?: string; // ISO string
}
