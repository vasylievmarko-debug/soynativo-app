import type { NextFunction, Request, Response } from 'express';
import type { UserRole } from '@soynativo/shared';
import { ForbiddenException, UnauthorizedException } from '@shared/exceptions/http.exception';

export function roleGuard(allowed: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) throw new UnauthorizedException();
    if (!allowed.includes(req.user.role as UserRole)) {
      throw new ForbiddenException(`Required role: ${allowed.join(', ')}`);
    }
    next();
  };
}
