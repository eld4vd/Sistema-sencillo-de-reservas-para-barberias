import { PartialType } from '@nestjs/mapped-types';
import { CreatePeluqueroDto } from './create-peluquero.dto';

export class UpdatePeluqueroDto extends PartialType(CreatePeluqueroDto) {
  // PartialType ya incluye:
  // - Todas las validaciones del CreatePeluqueroDto
  // - Todas las transformaciones (@Transform)
  // - Todas las validaciones personalizadas (@Validate)
  // - Hace todos los campos opcionales automáticamente
  // No necesitas duplicar nada aquí
}
