import type { NextFunction, Request, Response } from 'express';
import { container } from 'tsyringe';
import { TokenService } from '@modules/auth/token.service';
import { UnauthorizedException } from '@shared/exceptions/http.exception';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      id?: string;
      user?: { id: string; email: string; role: string };
    }
  }
}

export function authGuard(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw new UnauthorizedException('Missing bearer token');
  const token = header.slice('Bearer '.length);
  const payload = container.resolve(TokenService).verifyAccess(token);
  req.user = { id: payload.sub, email: payload.email, role: payload.role };
  next();
}
