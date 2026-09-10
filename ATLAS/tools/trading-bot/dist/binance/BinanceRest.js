/**
 * BinanceRest — klines fetch with weight accounting.
 *
 * Single queue: all klines fetches go through one bucket so multi-symbol
 * callers don't burst in parallel and trip 429.
 */
import { klineWeight } from "../config.js";
import { BinanceWeightBucket, withBackoff } from "./BinanceWeightBucket.js";
export class BinanceRest {
    bucket;
    baseUrl;
    constructor(baseUrl, bucket) {
        this.baseUrl = baseUrl.replace(/\/$/, "");
        this.bucket = bucket ?? new BinanceWeightBucket();
    }
    /** Fetch klines; returns Ohlcv[] sorted by openTime asc. */
    async fetchKlines(params) {
        const limit = params.limit ?? 500;
        const weight = klineWeight(limit);
        await this.bucket.consume(weight);
        const qs = new URLSearchParams({
            symbol: params.symbol,
            interval: params.interval,
            limit: String(limit),
        });
        if (params.startTime !== undefined)
            qs.set("startTime", String(params.startTime));
        if (params.endTime !== undefined)
            qs.set("endTime", String(params.endTime));
        const url = `${this.baseUrl}/api/v3/klines?${qs.toString()}`;
        const doFetch = async () => {
            const res = await fetch(url);
            // update bucket from headers regardless of status
            this.bucket.updateFromHeaders(res.headers);
            if (!res.ok) {
                const body = await res.text().catch(() => "");
                const err = new Error(`klines ${res.status} ${body.slice(0, 300)}`);
                err.status = res.status;
                throw err;
            }
            const raw = (await res.json());
            // raw format: [ openTime, open, high, low, close, volume, closeTime, quoteVol, trades, takerBuyBase, takerBuyQuote, ignore ]
            return raw.map((k) => ({
                openTime: BigInt(k[0]),
                open: parseFloat(String(k[1])),
                high: parseFloat(String(k[2])),
                low: parseFloat(String(k[3])),
                close: parseFloat(String(k[4])),
                volume: parseFloat(String(k[5])),
            }));
        };
        return withBackoff(doFetch, { maxRetries: 4, baseMs: 800 });
    }
    /**
     * Fetch delta from `fromOpenTime` (exclusive) up to now.
     * Paginates with limit=1000, weight 10 each, via bucket.
     */
    async fetchDelta(symbol, interval, fromOpenTime, maxCandles = 10_000) {
        const out = [];
        let startTime = Number(fromOpenTime) + 5 * 60 * 1000; // next open after known
        let remaining = maxCandles;
        while (remaining > 0) {
            const limit = Math.min(1000, remaining);
            const batch = await this.fetchKlines({ symbol, interval, startTime, limit });
            if (batch.length === 0)
                break;
            out.push(...batch);
            if (batch.length < limit)
                break; // reached tip
            const last = batch[batch.length - 1];
            startTime = Number(last.openTime) + 5 * 60 * 1000;
            remaining -= batch.length;
            // slight yield to not hog bucket
            await new Promise((r) => setTimeout(r, 50));
        }
        return out;
    }
    /**
     * Bootstrap `count` most recent candles (uses endTime pagination backwards).
     * For 6000 candles: 6 requests of 1000.
     */
    async bootstrapRecent(symbol, interval, count) {
        if (count <= 0)
            return [];
        const batches = [];
        let remaining = count;
        // Fetch from most recent backwards by using no startTime first, then paginate with endTime
        // Simpler: fetch forward from (now - count*5m) — approximate
        const now = Date.now();
        let startTime = now - count * 5 * 60 * 1000 - 5 * 60 * 1000;
        while (remaining > 0) {
            const limit = Math.min(1000, remaining);
            const batch = await this.fetchKlines({ symbol, interval, startTime, limit });
            if (batch.length === 0)
                break;
            batches.push(batch);
            remaining -= batch.length;
            if (batch.length < limit)
                break;
            startTime = Number(batch[batch.length - 1].openTime) + 5 * 60 * 1000;
        }
        return batches.flat();
    }
}
//# sourceMappingURL=BinanceRest.js.map