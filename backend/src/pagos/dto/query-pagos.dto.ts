import { IsEnum, IsInt, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum EstadoPago {
  Completado = 'Completado',
  Pendiente = 'Pendiente',
  Fallido = 'Fallido',
}

export class QueryPagosDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(EstadoPago)
  estado?: EstadoPago;

  @IsOptional()
  @IsString()
  periodo?: 'hoy' | 'semana' | 'mes' | 'todo' = 'todo';
}
