/**
 * BinanceWeightBucket — token bucket for 1200 weight/min.
 *
 * Reads X-MBX-USED-WEIGHT-1M header from every REST response and enforces
 * local budget with headroom. Handles 429 (rate limit) and 418 (IP ban)
 * with exponential backoff + jitter.
 */

import { BINANCE_WEIGHT_LIMIT_PER_MIN } from "../config.js";

export class BinanceWeightBucket {
  private usedWeight = 0;
  private windowStart = Date.now();
  private readonly limit: number;
  private readonly headroom: number;

  constructor(limit = BINANCE_WEIGHT_LIMIT_PER_MIN, headroom = 100) {
    this.limit = limit;
    this.headroom = headroom;
  }

  /** Update from response headers (call after every REST call). */
  updateFromHeaders(headers: Record<string, string | undefined> | Headers): void {
    let raw: string | undefined;
    if (headers instanceof Headers) {
      raw = headers.get("x-mbx-used-weight-1m") ?? headers.get("X-MBX-USED-WEIGHT-1M") ?? undefined;
    } else {
      raw = headers["x-mbx-used-weight-1m"] ?? headers["X-MBX-USED-WEIGHT-1M"];
    }
    if (raw !== undefined) {
      const n = parseInt(raw, 10);
      if (Number.isFinite(n)) this.usedWeight = Math.max(this.usedWeight, n);
    }
  }

  private resetIfNeeded(): void {
    if (Date.now() - this.windowStart >= 60_000) {
      this.usedWeight = 0;
      this.windowStart = Date.now();
    }
  }

  /** Wait until `cost` weight is affordable. */
  async consume(cost: number): Promise<void> {
    this.resetIfNeeded();
    while (this.usedWeight + cost > this.limit - this.headroom) {
      const waitMs = 60_000 - (Date.now() - this.windowStart) + 500 + Math.random() * 500;
      // console.debug(`[WeightBucket] throttling ${waitMs.toFixed(0)}ms for cost=${cost} used=${this.usedWeight}`);
      await sleep(waitMs);
      this.resetIfNeeded();
    }
    this.usedWeight += cost;
  }

  /** For logging. */
  getUsed(): number {
    return this.usedWeight;
  }

  getRemaining(): number {
    return this.limit - this.usedWeight;
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Exponential backoff for 429/418 with jitter. */
export async function withBackoff<T>(
  fn: () => Promise<T>,
  opts: { maxRetries?: number; baseMs?: number } = {}
): Promise<T> {
  const maxRetries = opts.maxRetries ?? 5;
  const baseMs = opts.baseMs ?? 1000;
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (e: unknown) {
      const status = (e as { status?: number })?.status ?? (e as { statusCode?: number })?.statusCode;
      const isRate = status === 429 || status === 418 || (e as Error)?.message?.includes("429");
      if (!isRate || attempt >= maxRetries) throw e;
      const delay = baseMs * Math.pow(2, attempt) + Math.random() * 500;
      // console.warn(`[Backoff] attempt ${attempt + 1}/${maxRetries} status=${status} wait=${delay.toFixed(0)}ms`);
      await sleep(delay);
      attempt++;
    }
  }
}
