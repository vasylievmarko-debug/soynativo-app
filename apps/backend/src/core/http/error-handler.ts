import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { HttpException } from '@shared/exceptions/http.exception';
import { logger } from '@core/logger/logger';
import { isProduction } from '@config/env';

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
    requestId?: string;
  };
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const requestId = req.id;

  if (err instanceof HttpException) {
    logger.warn({ err, requestId, path: req.path }, 'HTTP exception');
    res.status(err.statusCode).json({
      error: { code: err.code, message: err.message, details: err.details, requestId },
    });
    return;
  }

  if (err instanceof ZodError) {
    logger.warn({ err: err.flatten(), requestId, path: req.path }, 'Validation error');
    res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: err.flatten().fieldErrors,
        requestId,
      },
    });
    return;
  }

  logger.error({ err, requestId, path: req.path }, 'Unhandled error');
  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: isProduction ? 'Internal server error' : err.message,
      requestId,
    },
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
      requestId: req.id,
    },
  });
}
