// src/auth/auth.service.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminsService } from 'src/admins/admins.service';
import { Admin } from 'src/admins/entities/admin.entity';
import { AuthLoginDto } from './dto/auth-login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private adminsService: AdminsService,
    private jwtService: JwtService,
  ) {}

  async login(authLoginDto: AuthLoginDto): Promise<{
    accessToken: string;
    refreshToken: string;
    user: Pick<Admin, 'id' | 'nombre' | 'email'>;
  }> {
    const { email, password } = authLoginDto;
    const adminOk = await this.adminsService.validate(email, password);

    if (!adminOk) {
      console.warn(`[AUTH] Login fallido: ${email}`);
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    const payload: JwtPayload = {
      sub: adminOk.id,
    };

    const accessToken = await this.generateAccessToken(payload);
    const refreshToken = await this.generateRefreshToken(payload);

    console.log(`[AUTH] Login exitoso: user ${adminOk.id} (${adminOk.email})`);

    return {
      accessToken,
      refreshToken,
      user: {
        id: adminOk.id,
        nombre: adminOk.nombre,
        email: adminOk.email,
      },
    };
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      // Verificar el refresh token
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        {
          secret: process.env.JWT_REFRESH_SECRET,
        },
      );

      // Verificar que el usuario aún existe
      const admin = await this.adminsService.findOne(payload.sub);
      if (!admin) {
        console.warn(`[AUTH] Refresh fallido: usuario ${payload.sub} no encontrado`);
        throw new UnauthorizedException('Usuario no encontrado');
      }

      // Generar nuevo access token
      const newPayload: JwtPayload = { sub: payload.sub };
      const accessToken = await this.generateAccessToken(newPayload);

      console.log(`[AUTH] Refresh exitoso: user ${payload.sub}`);

      return { accessToken };
    } catch (error) {
      console.warn(`[AUTH] Refresh fallido: token inválido o expirado`);
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }

  private async generateAccessToken(payload: JwtPayload): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
    });
  }

  private async generateRefreshToken(payload: JwtPayload): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
    });
  }

  async verifyAccessToken(token: string): Promise<Admin> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });

      const admin = await this.adminsService.findOne(payload.sub);
      if (!admin) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      return admin;
    } catch {
      throw new UnauthorizedException('Access token inválido o expirado');
    }
  }

  async verifyPayload(payload: JwtPayload): Promise<Admin> {
    let admin: Admin;
    try {
      admin = await this.adminsService.findOne(payload.sub);
    } catch {
      throw new UnauthorizedException(`Usuario inválido: ${payload.sub}`);
    }
    return admin;
  }
}
