import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import {
  toTrimmedLowerCaseString,
  toTrimmedString,
} from '../../common/utils/transformers';

export class CreateAdminDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100, { message: 'El nombre no puede tener más de 100 caracteres' })
  @Transform(({ value }) => toTrimmedString(value)) // quita espacios al inicio y final
  readonly nombre: string;

  @IsNotEmpty()
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @MaxLength(100, {
    message: 'El correo electrónico no puede tener más de 100 caracteres',
  })
  @Transform(({ value }) => toTrimmedLowerCaseString(value)) // minusculiza y quita espacios
  readonly email: string; // readonly para que no se pueda modificar

  @IsNotEmpty()
  @IsString({ message: 'La contraseña debe ser un texto' })
  @MinLength(4, { message: 'La contraseña debe tener mínimo 4 caracteres' })
  @MaxLength(50, { message: 'La contraseña no puede exceder 50 caracteres' })
  @Transform(({ value }) => toTrimmedString(value))
  readonly password: string;
}
