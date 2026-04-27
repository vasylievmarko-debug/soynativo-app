import { Router } from 'express';
import { container } from 'tsyringe';
import { UserController } from './user.controller';
import { authGuard } from '@shared/middleware/auth.middleware';

export function buildUserRouter(): Router {
  const router = Router();
  const c = container.resolve(UserController);

  // v1.0: only /me is exposed. Admin endpoints (getById, update, delete, list)
  // are intentionally not routed — accounts are managed via seed/SQL.
  // When admin panel ships (post-v1.4), re-add with roleGuard(['admin']).
  router.get('/me', authGuard, c.me);

  return router;
}
