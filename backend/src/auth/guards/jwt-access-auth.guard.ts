// src/auth/guards/jwt-access-auth.guard.ts
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/auth-public.decorator';

@Injectable()
// Guard que protege rutas usando la estrategia 'jwt-access'.
// Permite marcar rutas públicas con el decorador @Public() para
// omitir la validación JWT y dejar que cualquier cliente acceda.
export class JwtAccessAuthGuard extends AuthGuard('jwt-access') {
  constructor(private reflector: Reflector) {
    super();
  }

  // Comprueba si la ruta/handler está marcada como pública; si no lo
  // está, delega en AuthGuard('jwt-access') para validar el token.
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    return super.canActivate(context);
  }
}
