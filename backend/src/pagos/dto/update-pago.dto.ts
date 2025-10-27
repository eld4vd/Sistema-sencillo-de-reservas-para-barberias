import { PartialType } from '@nestjs/mapped-types';
import { CreatePagoDto } from './create-pago.dto';

export class UpdatePagoDto extends PartialType(CreatePagoDto) {
  // PartialType ya incluye automáticamente:
  // - @Transform para metodoPago (del CreatePagoDto)
  // - @Transform para transaccionId (del CreatePagoDto)
  // - Todas las demás validaciones y transformaciones
  // - Hace todos los campos opcionales
}
