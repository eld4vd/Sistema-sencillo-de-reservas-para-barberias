// src/auth/strategies/jwt-refresh.strategy.ts
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

@Injectable()
// Estrategia Passport para validar refresh tokens extraídos de cookies.
// Ubicación recomendada: `src/auth/strategies`.
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly authService: AuthService) {
    const jwtSecret = process.env.JWT_REFRESH_SECRET;
    if (!jwtSecret) {
      throw new Error(
        'JWT_REFRESH_SECRET no está definido en las variables de entorno',
      );
    }
    const useHostPrefix =
      (process.env.COOKIE_PREFIX_HOST || 'false').toLowerCase() === 'true';
    const refreshCookieName = useHostPrefix
      ? '__Host-refresh_token'
      : 'refresh_token';
    // Extrae el refresh token desde cookies HTTP-only (prefiere __Host-)
    const cookieExtractor: JwtFromRequestFunction = (request) => {
      const cookies = (request as RequestWithCookies | undefined)?.cookies;
      const direct = cookies?.[refreshCookieName];
      const fallback = cookies?.refresh_token;
      return direct ?? fallback ?? null;
    };

    super({
      // Extraer refresh token de la cookie
      jwtFromRequest: cookieExtractor,
      secretOrKey: jwtSecret,
      ignoreExpiration: false,
    });
  }

  // Valida el payload JWT y devuelve la entidad Admin mediante AuthService.
  async validate(payload: JwtPayload): Promise<Admin> {
    return this.authService.verifyPayload(payload);
  }
}
