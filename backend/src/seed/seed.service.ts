import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from 'src/admins/entities/admin.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Admin)
    private readonly adminsRepository: Repository<Admin>,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    try {
      const seedEnabledEnv = this.configService.get<string>('SEED_ON_BOOT');
      const nodeEnv = this.configService.get<string>('NODE_ENV');

      // Habilitar por defecto solo en production (deshabilitado en dev/test)
      const seedEnabledDefault = nodeEnv === 'production';
      const seedEnabled =
        seedEnabledEnv !== undefined
          ? seedEnabledEnv === 'true'
          : seedEnabledDefault;

      if (!seedEnabled) {
        this.logger.log(
          'Seed deshabilitado por configuración (SEED_ON_BOOT=false).',
        );
        return;
      }

      const adminsCount = await this.adminsRepository.count();
      if (adminsCount > 0) {
        this.logger.log('Admins ya existen, se omite seed inicial.');
        return;
      }

      const nombre =
        this.configService.get<string>('SEED_ADMIN_NAME') || 'Administrador';
      const email =
        this.configService.get<string>('SEED_ADMIN_EMAIL') || 'admin@demo.com';
      const password =
        this.configService.get<string>('SEED_ADMIN_PASSWORD') || 'admin123';

      const admin = new Admin();
      admin.nombre = nombre;
      admin.email = email;
      admin.password = password; // Será hasheado por el hook de la entidad

      await this.adminsRepository.save(admin);
      this.logger.log(`Admin por defecto creado: ${email}`);
    } catch (error) {
      this.logger.error(
        'Error ejecutando seed inicial',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
