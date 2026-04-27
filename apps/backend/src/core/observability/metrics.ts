/**
 * Tiny histogram with HDR-style log-linear buckets. We don't want a full
 * Prometheus client at MVP stage — this gives us p50/p95/p99 per route with
 * O(1) memory. Drop-in replaceable with `prom-client` later.
 */
class Histogram {
  // 60 buckets covering 1ms..60s with 12 per decade
  private readonly buckets = new Int32Array(60);
  private count = 0;
  private sum = 0;

  observe(ms: number): void {
    if (ms < 0) return;
    const idx = Math.min(this.buckets.length - 1, Math.max(0, Math.floor(Math.log10(Math.max(ms, 1)) * 12)));
    this.buckets[idx]++;
    this.count++;
    this.sum += ms;
  }

  percentile(p: number): number {
    if (this.count === 0) return 0;
    const target = this.count * p;
    let cum = 0;
    for (let i = 0; i < this.buckets.length; i++) {
      cum += this.buckets[i];
      if (cum >= target) return Math.pow(10, i / 12);
    }
    return Math.pow(10, (this.buckets.length - 1) / 12);
  }

  snapshot() {
    return {
      count: this.count,
      avg: this.count ? this.sum / this.count : 0,
      p50: this.percentile(0.5),
      p95: this.percentile(0.95),
      p99: this.percentile(0.99),
    };
  }
}

const byRoute = new Map<string, Histogram>();

export function recordLatency(route: string, ms: number): void {
  let h = byRoute.get(route);
  if (!h) {
    h = new Histogram();
    byRoute.set(route, h);
  }
  h.observe(ms);
}

export function snapshotMetrics(): Record<string, ReturnType<Histogram['snapshot']>> {
  const out: Record<string, ReturnType<Histogram['snapshot']>> = {};
  for (const [route, h] of byRoute) out[route] = h.snapshot();
  return out;
}
