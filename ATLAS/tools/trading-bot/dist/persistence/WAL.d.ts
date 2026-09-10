/**
 * WAL — file-based append-only log of closed candles between snapshots.
 *
 * Replaces better-sqlite3 with a simple JSONL file per symbol to avoid
 * native build requirements on Windows. Same API: append / replay / prune.
 * Crash-safe via append + fsync.
 */
import type { Ohlcv } from "../core/RingBufferSoA.js";
export declare class WAL {
    private path;
    constructor(path: string);
    append(c: Ohlcv): void;
    appendBatch(candles: Ohlcv[]): void;
    private readAll;
    /** Replay candles with openTime > fromOpenTime (exclusive), ordered asc. */
    replay(fromOpenTime: bigint): Ohlcv[];
    /** Prune candles older than cutoff. */
    pruneBefore(cutoffOpenTime: bigint): number;
    getCount(): number;
    close(): void;
}
//# sourceMappingURL=WAL.d.ts.map