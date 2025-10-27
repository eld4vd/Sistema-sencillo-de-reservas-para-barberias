import { PartialType } from '@nestjs/mapped-types';
import { CreatePeluquerosServicioDto } from './create-peluqueros_servicio.dto';

export class UpdatePeluquerosServicioDto extends PartialType(
  CreatePeluquerosServicioDto,
) {
  // PartialType ya incluye automáticamente:
  // - @IsOptional() en todos los campos
  // - @IsInt() validations
  // - @Min(1) validations
  // - Todas las validaciones del CreatePeluquerosServicioDto pero opcionales
}
