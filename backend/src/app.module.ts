import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminsModule } from './admins/admins.module';
import { PeluquerosModule } from './peluqueros/peluqueros.module';
import { ServiciosModule } from './servicios/servicios.module';
import { PeluquerosServiciosModule } from './peluqueros_servicios/peluqueros_servicios.module';
import { CitasModule } from './citas/citas.module';
import { PagosModule } from './pagos/pagos.module';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { AuthModule } from './auth/auth.module';
import { ProductosModule } from './productos/productos.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    // Configuración global de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Throttler - Rate Limiting para prevenir ataques de fuerza bruta
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: Number(configService.get<string>('THROTTLE_TTL', '60000')), // 1 minuto por defecto
          limit: Number(configService.get<string>('THROTTLE_LIMIT', '10')), // 10 requests por defecto
        },
      ],
    }),

    // Configuración de TypeORM usando variables de entorno
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const synchronizeFromEnv =
          configService.get<string>('DB_SYNCHRONIZE', 'false') === 'true';
        const seedOnBoot =
          configService.get<string>('SEED_ON_BOOT', 'false') === 'true';

        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: Number(configService.get<string>('DB_PORT')),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          namingStrategy: new SnakeNamingStrategy(),
          // ⚠️ Controlado por variables:
          // - DB_SYNCHRONIZE=true en dev/test
          // - SEED_ON_BOOT=true fuerza una sincronización única para levantar tablas antes del seed.
          synchronize: synchronizeFromEnv || seedOnBoot,
          // Logs SQL habilitados por variable de entorno
          logging: configService.get<string>('DB_LOGGING', 'false') === 'true',
        };
      },
    }),

    // Módulos de la app
    AdminsModule,
    PeluquerosModule,
    ServiciosModule,
    PeluquerosServiciosModule,
    CitasModule,
    PagosModule,
    AuthModule,
    ProductosModule,
    SeedModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Guard global de rate limiting
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
