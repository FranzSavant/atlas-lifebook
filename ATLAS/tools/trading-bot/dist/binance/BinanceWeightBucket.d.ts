/**
 * BinanceWeightBucket — token bucket for 1200 weight/min.
 *
 * Reads X-MBX-USED-WEIGHT-1M header from every REST response and enforces
 * local budget with headroom. Handles 429 (rate limit) and 418 (IP ban)
 * with exponential backoff + jitter.
 */
export declare class BinanceWeightBucket {
    private usedWeight;
    private windowStart;
    private readonly limit;
    private readonly headroom;
    constructor(limit?: number, headroom?: number);
    /** Update from response headers (call after every REST call). */
    updateFromHeaders(headers: Record<string, string | undefined> | Headers): void;
    private resetIfNeeded;
    /** Wait until `cost` weight is affordable. */
    consume(cost: number): Promise<void>;
    /** For logging. */
    getUsed(): number;
    getRemaining(): number;
}
export declare function sleep(ms: number): Promise<void>;
/** Exponential backoff for 429/418 with jitter. */
export declare function withBackoff<T>(fn: () => Promise<T>, opts?: {
    maxRetries?: number;
    baseMs?: number;
}): Promise<T>;
//# sourceMappingURL=BinanceWeightBucket.d.ts.map