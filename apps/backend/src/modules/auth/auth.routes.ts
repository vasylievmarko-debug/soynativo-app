import { Router } from 'express';
import { container } from 'tsyringe';
import rateLimit from 'express-rate-limit';
import { AuthController } from './auth.controller';
import { env } from '@config/env';

export function buildAuthRouter(): Router {
  const router = Router();
  const c = container.resolve(AuthController);

  // Tighter rate limit on auth endpoints to slow down credential stuffing.
  const authLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
  });

  router.post('/register', authLimiter, c.register);
  router.post('/login', authLimiter, c.login);
  router.post('/refresh', c.refresh);
  router.post('/logout', c.logout);

  return router;
}
