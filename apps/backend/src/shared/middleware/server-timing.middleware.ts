import type { NextFunction, Request, Response } from 'express';
import { performance } from 'node:perf_hooks';

interface Timing {
  name: string;
  start: number;
  duration?: number;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      timings?: Timing[];
      startTime?: (name: string) => () => void;
    }
  }
}

/**
 * Add `Server-Timing` header to every response. Handlers add segments via
 * `req.startTime('db')()` — the header lets DevTools and clients see exactly
 * where the request spent its time without external APM.
 *
 * Example header:
 *   Server-Timing: db;dur=23.4, cache;dur=1.8, total;dur=45.1
 */
export function serverTiming(req: Request, res: Response, next: NextFunction): void {
  const timings: Timing[] = [];
  req.timings = timings;
  const requestStart = performance.now();

  req.startTime = (name: string) => {
    const start = performance.now();
    const entry: Timing = { name, start };
    timings.push(entry);
    return () => {
      entry.duration = performance.now() - start;
    };
  };

  res.on('finish', () => {
    const total = performance.now() - requestStart;
    const segments = timings
      .filter((t) => t.duration !== undefined)
      .map((t) => `${t.name};dur=${t.duration!.toFixed(1)}`)
      .concat(`total;dur=${total.toFixed(1)}`)
      .join(', ');
    if (!res.headersSent) res.setHeader('Server-Timing', segments);
  });

  next();
}
