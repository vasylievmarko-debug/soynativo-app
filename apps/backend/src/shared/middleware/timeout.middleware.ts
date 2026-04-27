import type { NextFunction, Request, Response } from 'express';
import { logger } from '@core/logger/logger';

/**
 * Hard timeout for any HTTP request. Prevents stuck handlers from holding
 * connections + memory and starving the pool. Default 5s — write paths can
 * override per-route if they legitimately need more (file upload).
 */
export function requestTimeout(ms = 5_000) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const t = setTimeout(() => {
      if (res.headersSent) return;
      logger.warn({ method: req.method, path: req.path, ms }, 'request timed out');
      res.status(503).json({
        error: { code: 'TIMEOUT', message: 'Request took too long', requestId: req.id },
      });
    }, ms);
    res.on('finish', () => clearTimeout(t));
    res.on('close', () => clearTimeout(t));
    next();
  };
}
