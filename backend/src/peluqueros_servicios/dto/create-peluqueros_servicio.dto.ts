import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreatePeluquerosServicioDto {
  @IsNotEmpty({ message: 'El ID del peluquero es obligatorio' })
  @IsInt({ message: 'El ID del peluquero debe ser un número entero' })
  @Min(1)
  readonly peluqueroId: number;

  @IsNotEmpty({ message: 'El ID del servicio es obligatorio' })
  @IsInt({ message: 'El ID del servicio debe ser un número entero' })
  @Min(1)
  readonly servicioId: number;
}
