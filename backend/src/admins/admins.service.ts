import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Admin } from './entities/admin.entity';

@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(Admin)
    private adminsRepository: Repository<Admin>,
  ) {}

  // Crear un administrador
  async create(createAdminDto: CreateAdminDto): Promise<Admin> {
    // email normalizado por DTO (trim + lowerCase)
    const buscarRepetido = await this.adminsRepository.findOne({
      where: { email: createAdminDto.email },
      withDeleted: true,
    });
    if (buscarRepetido) {
      throw new ConflictException('El correo electrónico ya está en uso');
    }
    const admin = this.adminsRepository.create({
      nombre: createAdminDto.nombre,
      email: createAdminDto.email,
      password: createAdminDto.password,
    });

    return this.adminsRepository.save(admin);
  }

  // Listar todos los administradores
  async findAll(): Promise<Admin[]> {
    return this.adminsRepository.find();
  }

  // Obtener un administrador por ID
  async findOne(id: number): Promise<Admin> {
    const admin = await this.adminsRepository.findOneBy({
      id,
    });

    if (!admin) {
      throw new NotFoundException('Administrador no encontrado');
    }
    return admin;
  }

  // Obtener el administrador autenticado (por ID)
  async findAuthenticatedUser(id: number): Promise<Admin> {
    // Reutilizamos findOne para obtener al empleado autenticado
    return this.findOne(id);
  }

  // Actualizar un administrador
  async update(id: number, updateAdminDto: UpdateAdminDto): Promise<Admin> {
    // Verificar email único si se intenta cambiar (excluyendo el propio id)
    if (updateAdminDto.email) {
      const existingAdmin = await this.adminsRepository.findOne({
        where: { email: updateAdminDto.email, id: Not(id) },
        withDeleted: true,
      });

      if (existingAdmin) {
        throw new ConflictException('El email ya está registrado');
      }
    }

    const adminActual = await this.adminsRepository.findOne({
      where: { id },
      withDeleted: false,
    });

    if (!adminActual) {
      throw new NotFoundException('Administrador no encontrado');
    }

    const partial: Partial<Admin> = {};
    if (updateAdminDto.nombre !== undefined) {
      partial.nombre = updateAdminDto.nombre;
    }
    if (updateAdminDto.email !== undefined) {
      partial.email = updateAdminDto.email;
    }
    if (updateAdminDto.password !== undefined) {
      partial.password = updateAdminDto.password;
    }

    const adminActualizado = this.adminsRepository.merge(
      adminActual,
      partial,
    );

    return this.adminsRepository.save(adminActualizado);
  }

  // Eliminar un administrador (soft delete)
  async remove(id: number) {
    const admin = await this.findOne(id);
    return this.adminsRepository.softRemove(admin);
  }

  async validate(email: string, clave: string): Promise<Admin | null> {
    const emailOk = await this.adminsRepository.findOne({
      where: { email },
      select: ['id', 'nombre', 'email', 'password'], // Campos seleccionados
    });

    if (!emailOk) {
      return null; // Retorna null si no encuentra el empleado
    }

    // Validamos la contraseña
    const isPasswordValid = await emailOk.validatePassword(clave);
    if (!isPasswordValid) {
      return null; // Retorna null si la contraseña no es válida
    }

    return emailOk; // Devuelve el empleado
  }
  async cambiarPassword(
    userId: number,
    passwordActual: string,
    nuevaPassword: string,
  ): Promise<string> {
    // 1. Buscar al empleado por ID
    const empleado = await this.findOne(userId);
    if (!empleado) {
      throw new NotFoundException('Empleado no encontrado.');
    }

    // 2. Validar la contraseña actual
    const isPasswordValid = await empleado.validatePassword(passwordActual);
    if (!isPasswordValid) {
      throw new UnauthorizedException('La contraseña actual es incorrecta.');
    }

    // 3. Actualizar la contraseña
    empleado.password = nuevaPassword; // Asignar la nueva contraseña
    await this.adminsRepository.save(empleado); // Guardar cambios (se hashea automáticamente en `hashPassword`)

    return 'La contraseña ha sido actualizada correctamente.';
  }

  async softDelete(id: number): Promise<{ message: string }> {
    const empleado = await this.findOne(id);
    await this.adminsRepository.softRemove(empleado);
    return { message: `Empleado con ID ${id} desactivado correctamente` };
  }
}
