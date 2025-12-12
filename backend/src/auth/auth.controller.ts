// auth.controller.ts - Decorators actualizados
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './dto/auth-login.dto';
import type { Response, Request } from 'express';
import { JwtAccessAuthGuard } from './guards/jwt-access-auth.guard';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { Public } from './decorators/auth-public.decorator';
import { Admin } from 'src/admins/entities/admin.entity';
import type { CookieRecord } from './interfaces/cookie-record.type';

type RequestWithUser = Request & { user?: unknown };
type RequestWithCookies = Omit<Request, 'cookies'> & {
  cookies?: CookieRecord;
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Get('csrf')
  @HttpCode(HttpStatus.OK)
  getCsrf(@Res({ passthrough: true }) res: Response): { csrfToken: string } {
    const secure =
      (process.env.COOKIE_SECURE || 'false').toLowerCase() === 'true';
    const sameSite = (process.env.COOKIE_SAMESITE || 'lax') as
      | 'lax'
      | 'strict'
      | 'none';
    const csrfToken = randomBytes(32).toString('hex');
    res.cookie('csrf_token', csrfToken, {
      httpOnly: false,
      secure,
      sameSite,
      maxAge: 15 * 60 * 1000,
      path: '/',
    });
    return { csrfToken };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 intentos por minuto
  async login(
    @Body() authLoginDto: AuthLoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ success: true; user: Pick<Admin, 'id' | 'nombre' | 'email'> }> {
    const result = await this.authService.login(authLoginDto);

    // Flags de cookies desde .env
    const secure =
      (process.env.COOKIE_SECURE || 'false').toLowerCase() === 'true';
    const sameSite = (process.env.COOKIE_SAMESITE || 'lax') as
      | 'lax'
      | 'strict'
      | 'none';
    const useHostPrefix =
      (process.env.COOKIE_PREFIX_HOST || 'false').toLowerCase() === 'true';
    const refreshCookieName = useHostPrefix
      ? '__Host-refresh_token'
      : 'refresh_token';
    const accessCookieName = useHostPrefix
      ? '__Host-access_token'
      : 'access_token';

    res.cookie(refreshCookieName, result.refreshToken, {
      httpOnly: true,
      secure,
      sameSite,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      path: '/',
    });

    // Poner access token en cookie httpOnly (válida 15 minutos)
    res.cookie(accessCookieName, result.accessToken, {
      httpOnly: true,
      secure,
      sameSite,
      maxAge: 15 * 60 * 1000, // 15 minutos
      path: '/',
    });

    // Enviar cookie CSRF (legible por JS) para estrategia Double Submit Cookie
    // Mejores prácticas: usar un token aleatorio independiente del access token
    const csrfToken = randomBytes(32).toString('hex');
    res.cookie('csrf_token', csrfToken, {
      httpOnly: false,
      secure,
      sameSite,
      maxAge: 15 * 60 * 1000, // alinear con el access token
      path: '/',
    });

    return {
      success: true,
      user: result.user,
    };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 intentos por minuto
  @UseGuards(JwtRefreshAuthGuard)
  async refresh(
    @Req() req: RequestWithCookies,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ success: true }> {
    const useHostPrefix =
      (process.env.COOKIE_PREFIX_HOST || 'false').toLowerCase() === 'true';
    const refreshCookieName = useHostPrefix
      ? '__Host-refresh_token'
      : 'refresh_token';
    const accessCookieName = useHostPrefix
      ? '__Host-access_token'
      : 'access_token';
    const refreshToken = req.cookies?.[refreshCookieName];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token no encontrado');
    }

    const result = await this.authService.refresh(refreshToken);

    // Renovar CSRF token para mutaciones después de un refresh
    const csrfToken = randomBytes(32).toString('hex');
    const secure =
      (process.env.COOKIE_SECURE || 'false').toLowerCase() === 'true';
    const sameSite = (process.env.COOKIE_SAMESITE || 'lax') as
      | 'lax'
      | 'strict'
      | 'none';
    res.cookie('csrf_token', csrfToken, {
      httpOnly: false,
      secure,
      sameSite,
      maxAge: 15 * 60 * 1000, // 15 minutos
      path: '/',
    });

    // Actualizar cookie de access token
    res.cookie(accessCookieName, result.accessToken, {
      httpOnly: true,
      secure,
      sameSite,
      maxAge: 15 * 60 * 1000, // 15 minutos
      path: '/',
    });

    return {
      success: true,
    };
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response): { success: true } {
    const secure =
      (process.env.COOKIE_SECURE || 'false').toLowerCase() === 'true';
    const sameSite = (process.env.COOKIE_SAMESITE || 'lax') as
      | 'lax'
      | 'strict'
      | 'none';
    const useHostPrefix =
      (process.env.COOKIE_PREFIX_HOST || 'false').toLowerCase() === 'true';
    const refreshCookieName = useHostPrefix
      ? '__Host-refresh_token'
      : 'refresh_token';
    const accessCookieName = useHostPrefix
      ? '__Host-access_token'
      : 'access_token';

    res.clearCookie(refreshCookieName, {
      httpOnly: true,
      secure,
      sameSite,
      path: '/',
    });

    res.clearCookie(accessCookieName, {
      httpOnly: true,
      secure,
      sameSite,
      path: '/',
    });

    res.clearCookie('csrf_token', {
      httpOnly: false,
      secure,
      sameSite,
      path: '/',
    });

    return { success: true };
  }

  @UseGuards(JwtAccessAuthGuard)
  @Get('me')
  getProfile(@Req() req: RequestWithUser): { user: Admin } {
    const user = req.user as Admin;
    return { user };
  }
}
