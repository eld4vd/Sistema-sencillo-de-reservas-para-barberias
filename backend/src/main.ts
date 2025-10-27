// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { csrfMiddleware } from './common/middlewares/csrf.middleware'; // Descomenta si tienes CSRF middleware listo
import { helmetConfig } from './common/utils/helmet-config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Flags por variables de entorno (puedes activarlas sin cambiar el código)
  const csrfEnabled =
    (process.env.CSRF_ENABLED || 'true').toLowerCase() === 'true';
  const trustProxy =
    (process.env.TRUST_PROXY || 'false').toLowerCase() === 'true';

  // Reemplaza la línea de helmet por:
  app.use(helmetConfig());

  // 1) CORS habilitado para cookies JWT
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000', // true = cualquier origen en dev, usa variable en prod
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-CSRF-Token',
      'Cache-Control',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // 2) cookie-parser y trust proxy (necesario para cookies seguras en producción)
  app.use(cookieParser());
  if (trustProxy) {
    const httpAdapter = app.getHttpAdapter();
    const instance = httpAdapter.getInstance?.() as
      | { set?: (setting: string, value: unknown) => void }
      | undefined;
    if (typeof instance?.set === 'function') {
      instance.set('trust proxy', 1);
    }
  }
  // 3) CSRF middleware (opcional, solo si tienes implementado el middleware)
  if (csrfEnabled) app.use(csrfMiddleware());

  // 4) Pipes, prefijo y versionado
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  const port = Number(process.env.PORT) || 3000;
  const host = process.env.HOST || '127.0.0.1';

  await app.listen(port, host);
  const baseUrl = await app.getUrl();
  console.log(`🚀 App corriendo en: ${baseUrl}`);
}

bootstrap().catch((error: unknown) => {
  console.error('Error starting application', error);
  process.exitCode = 1;
});
