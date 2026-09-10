/**
 * ParquetColdStore — cold infinite store, hot 15k stays in RingBuffer.
 *
 * Interface is parquet-ready but current implementation uses monthly
 * JSONL.gz files (no native parquet dep required to compile). Swap the
 * inner read/write to parquet-wasm / parquetjs when you need columnar
 * compression — the callers don't change.
 *
 * Layout: data/parquet/<SYMBOL>/5m/YYYY-MM.jsonl.gz
 * Each line: [openTime, open, high, low, close, volume] as JSON array
 */
import type { Ohlcv } from "../core/RingBufferSoA.js";
export declare class ParquetColdStore {
    private baseDir;
    private symbol;
    private interval;
    constructor(baseDir: string, symbol: string, interval: string);
    private dir;
    private monthKey;
    private fileForMonth;
    /** Append batch; groups by month, appends gzipped JSONL. */
    appendBatch(candles: Ohlcv[]): Promise<void>;
    private readMonthSync;
    /** All months sorted. */
    private listMonths;
    /** Newest openTime in cold store, or null if empty. */
    getLastTimestamp(): bigint | null;
    /** Query range inclusive [from, to]. Streams months in order. */
    queryRange(from: bigint, to: bigint): AsyncIterable<Ohlcv>;
    /** Full scan as async iterable (for backtest). */
    scanAll(): AsyncIterable<Ohlcv>;
    /** Count (for diagnostics). */
    count(): number;
    private dedupAndSort;
    /** Load last N closes as Float64Array for seeding. */
    loadLastCloses(n: number): {
        closes: Float64Array;
        count: number;
    };
}
//# sourceMappingURL=ParquetColdStore.d.ts.map