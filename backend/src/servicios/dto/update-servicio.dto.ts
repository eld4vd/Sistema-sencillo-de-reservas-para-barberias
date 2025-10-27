import { PartialType } from '@nestjs/mapped-types';
import { CreateServicioDto } from './create-servicio.dto';

export class UpdateServicioDto extends PartialType(CreateServicioDto) {
  // PartialType ya incluye automáticamente:
  // - @Transform para nombre (del CreateServicioDto)
  // - @Transform para descripcion (del CreateServicioDto)
  // - Todas las validaciones (@IsString, @MaxLength, etc.)
  // - Hace todos los campos opcionales
}
