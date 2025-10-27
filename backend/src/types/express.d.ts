import { Request } from 'express';

interface JwtUser {
  id: number;
  nombre: string;
  email: string;
}

declare module 'express' {
  export interface Request {
    user?: JwtUser;
  }
}
