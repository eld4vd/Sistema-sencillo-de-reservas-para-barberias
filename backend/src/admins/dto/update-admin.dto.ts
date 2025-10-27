import { PartialType } from '@nestjs/mapped-types';
import { CreateAdminDto } from './create-admin.dto';

export class UpdateAdminDto extends PartialType(CreateAdminDto) {
  // PartialType ya incluye automáticamente:
  // - @Transform para nombre: value.trim() (del CreateAdminDto)
  // - @Transform para email: value.trim().toLowerCase() (del CreateAdminDto)
  // - @Transform para password: value.trim() (del CreateAdminDto)
  // - Todas las validaciones (@IsString, @MaxLength, @IsEmail, etc.)
  // - Hace todos los campos opcionales
}
