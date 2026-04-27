/**
 * Smoke load test for the backend. Compares observed latency against the
 * performance budget (see docs/adr/0005-performance-budget.md). Exits non-zero
 * if any p95 exceeds budget — wire into nightly CI.
 *
 * Run:
 *   yarn workspace @soynativo/backend bench
 *
 * Requires the server running at $BENCH_URL (default http://localhost:3000)
 * and a known auth token in $BENCH_TOKEN.
 */
import autocannon from 'autocannon';

interface Scenario {
  name: string;
  url: string;
  method?: 'GET' | 'POST';
  budgetP95Ms: number;
  body?: string;
  authed?: boolean;
}

const BASE_URL = process.env.BENCH_URL ?? 'http://localhost:3000';
const TOKEN = process.env.BENCH_TOKEN ?? '';

const scenarios: Scenario[] = [
  { name: 'GET /health', url: '/health', budgetP95Ms: 30 },
  { name: 'GET /api/v1/users/me', url: '/api/v1/users/me', budgetP95Ms: 100, authed: true },
  // Add more scenarios as endpoints land.
];

async function runOne(s: Scenario): Promise<{ ok: boolean; p95: number }> {
  const result = await autocannon({
    url: `${BASE_URL}${s.url}`,
    method: s.method ?? 'GET',
    body: s.body,
    headers: {
      'Content-Type': 'application/json',
      ...(s.authed && TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
    },
    connections: 50,
    duration: 15,
    pipelining: 1,
  });

  const p95 = result.latency.p97_5; // closest to p95 in autocannon
  const ok = p95 <= s.budgetP95Ms;
  // eslint-disable-next-line no-console
  console.log(
    `${ok ? '✅' : '❌'} ${s.name}: p95≈${p95.toFixed(0)}ms (budget ${s.budgetP95Ms}ms), p99=${result.latency.p99}ms, rps=${result.requests.average.toFixed(0)}`
  );
  return { ok, p95 };
}

async function main(): Promise<void> {
  let allOk = true;
  for (const s of scenarios) {
    const { ok } = await runOne(s);
    if (!ok) allOk = false;
  }
  if (!allOk) {
    // eslint-disable-next-line no-console
    console.error('\n💥 Performance budget violated.');
    process.exit(1);
  }
}

void main();
