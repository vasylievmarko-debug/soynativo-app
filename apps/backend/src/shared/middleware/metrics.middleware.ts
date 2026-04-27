import type { NextFunction, Request, Response } from 'express';
import { performance } from 'node:perf_hooks';
import { recordLatency } from '@core/observability/metrics';

export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = performance.now();
  res.on('finish', () => {
    // Use the matched route pattern (not the actual URL) so /lessons/:id
    // doesn't explode the cardinality with one bucket per id.
    const routePattern = req.route?.path ?? req.baseUrl + (req.route?.path ?? req.path);
    const key = `${req.method} ${routePattern} ${res.statusCode}`;
    recordLatency(key, performance.now() - start);
  });
  next();
}
