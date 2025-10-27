// src/auth/guards/jwt-refresh-auth.guard.ts
import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
// Guard específico para la estrategia de refresh tokens ('jwt-refresh').
// Actualmente delega la validación al AuthGuard por defecto pero se
// mantiene separado para poder personalizar el comportamiento de
// refresh (p. ej. políticas distintas o logging) en el futuro.
export class JwtRefreshAuthGuard extends AuthGuard('jwt-refresh') {
  constructor() {
    super();
  }

  // Por ahora simplemente reutiliza la lógica de Passport para
  // validar el token de refresh. Mantener este método permite
  // extenderlo sin romper las rutas que lo usan.
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
