import { Router } from 'express';
import { container } from 'tsyringe';
import { UserController } from './user.controller';
import { authGuard } from '@shared/middleware/auth.middleware';
import { roleGuard } from '@shared/middleware/role.middleware';

export function buildUserRouter(): Router {
  const router = Router();
  const c = container.resolve(UserController);

  router.get('/me', authGuard, c.me);
  router.get('/:id', authGuard, c.getById);
  router.patch('/:id', authGuard, c.update);
  router.delete('/:id', authGuard, roleGuard(['admin']), c.delete);
  router.get('/', authGuard, roleGuard(['admin']), c.list);

  return router;
}
