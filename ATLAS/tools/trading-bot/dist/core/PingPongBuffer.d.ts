/**
 * PingPongBuffer — double-buffered snapshot for lock-free read.
 *
 * Why: WS writer runs on the event loop and must never block the evaluator.
 * Bank A is written by WS; on each kline close we atomically swap A<->B
 * (just pointer exchange) and the evaluator reads B contiguously.
 * Linearization (wrap fix) happens only at swap time, not per tick.
 */
import { RingBufferSoA, type Ohlcv } from "./RingBufferSoA.js";
export declare class PingPongBuffer {
    private bankA;
    private bankB;
    private active;
    /** Linearized snapshot visible to readers after last swap. */
    private snapshotCloses;
    private snapshotCount;
    constructor(capacity: number);
    /** WS hot path — write single candle to active bank. O(1). */
    writeToActive(c: Ohlcv): void;
    /** Seed both banks (bootstrap path). */
    seedAll(candles: Ohlcv[]): void;
    /**
     * Atomic swap: active bank becomes the snapshot, previous snapshot bank
     * becomes the new active (empty or with tail). Returns linearized closes
     * and count for the evaluator to use without locks.
     *
     * In single-threaded Node this is just a pointer swap; with Worker threads
     * you'd use SharedArrayBuffer + Atomics here.
     */
    swap(): {
        closes: Float64Array;
        count: number;
        newestTime: bigint | null;
    };
    /** Direct access to active bank for diagnostics. */
    getActiveBank(): RingBufferSoA;
    getSnapshot(): {
        closes: Float64Array;
        count: number;
    };
}
//# sourceMappingURL=PingPongBuffer.d.ts.map