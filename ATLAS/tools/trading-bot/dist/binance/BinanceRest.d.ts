/**
 * BinanceRest — klines fetch with weight accounting.
 *
 * Single queue: all klines fetches go through one bucket so multi-symbol
 * callers don't burst in parallel and trip 429.
 */
import { BinanceWeightBucket } from "./BinanceWeightBucket.js";
import type { Ohlcv } from "../core/RingBufferSoA.js";
export interface KlineParams {
    symbol: string;
    interval: string;
    startTime?: number;
    endTime?: number;
    limit?: number;
}
export declare class BinanceRest {
    private bucket;
    private baseUrl;
    constructor(baseUrl: string, bucket?: BinanceWeightBucket);
    /** Fetch klines; returns Ohlcv[] sorted by openTime asc. */
    fetchKlines(params: KlineParams): Promise<Ohlcv[]>;
    /**
     * Fetch delta from `fromOpenTime` (exclusive) up to now.
     * Paginates with limit=1000, weight 10 each, via bucket.
     */
    fetchDelta(symbol: string, interval: string, fromOpenTime: bigint, maxCandles?: number): Promise<Ohlcv[]>;
    /**
     * Bootstrap `count` most recent candles (uses endTime pagination backwards).
     * For 6000 candles: 6 requests of 1000.
     */
    bootstrapRecent(symbol: string, interval: string, count: number): Promise<Ohlcv[]>;
}
//# sourceMappingURL=BinanceRest.d.ts.map