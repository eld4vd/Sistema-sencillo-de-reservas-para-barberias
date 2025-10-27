// src/auth/strategies/jwt-access.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { Strategy } from 'passport-jwt';
import type { JwtFromRequestFunction } from 'passport-jwt';
import { Admin } from 'src/admins/entities/admin.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import type { CookieRecord } from '../interfaces/cookie-record.type';

type RequestWithCookies = Omit<Request, 'cookies'> & {
  cookies?: CookieRecord;
};

// Estrategia Passport para validar el access token extraído desde
// cookies HTTP-only. Ubicación recomendada: `src/auth/strategies`.
@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  constructor(private readonly authService: AuthService) {
    const jwtSecret = process.env.JWT_ACCESS_SECRET;
    if (!jwtSecret) {
      throw new Error(
        'JWT_ACCESS_SECRET no está definido en las variables de entorno',
      );
    }
    const useHostPrefix =
      (process.env.COOKIE_PREFIX_HOST || 'false').toLowerCase() === 'true';
    const accessCookieName = useHostPrefix
      ? '__Host-access_token'
      : 'access_token';

    // Extrae el token de la cookie (prefiere nombre con prefijo __Host-)
    const cookieExtractor: JwtFromRequestFunction = (request) => {
      const cookies = (request as RequestWithCookies | undefined)?.cookies;
      const direct = cookies?.[accessCookieName];
      const fallback = cookies?.access_token;
      return direct ?? fallback ?? null;
    };

    super({
      jwtFromRequest: cookieExtractor,
      secretOrKey: jwtSecret,
      ignoreExpiration: false,
    });
  }

  // validate se encarga de verificar el payload y devolver la entidad
  // de usuario (Admin). Delega en AuthService para la lógica de verificación.
  async validate(payload: JwtPayload): Promise<Admin> {
    return this.authService.verifyPayload(payload);
  }
}
