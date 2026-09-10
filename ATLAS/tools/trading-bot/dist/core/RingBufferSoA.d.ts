/**
 * RingBufferSoA — hot rolling window O(1) push, zero-copy purge.
 *
 * Why SoA (Structure of Arrays): 5x Float64Array + 1x BigUint64Array gives
 * cache-friendly scans for indicator math (one field at a time = linear
 * access). Capacity is fixed at HOT_CAPACITY=15000; no reallocation on purge.
 *
 * Why ring: physical wrap avoids memmove. Logical index 0 = oldest retained,
 * logical count-1 = newest. `snapshotLinear(dest)` linearizes only when caller
 * needs a contiguous view (ping-pong swap or snapshot).
 */
export interface Ohlcv {
    openTime: bigint;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}
export declare class RingBufferSoA {
    readonly capacity: number;
    /** SoA backing stores */
    readonly timestamps: BigUint64Array;
    readonly opens: Float64Array;
    readonly highs: Float64Array;
    readonly lows: Float64Array;
    readonly closes: Float64Array;
    readonly volumes: Float64Array;
    private _head;
    private _count;
    constructor(capacity?: number);
    get head(): number;
    get count(): number;
    get isEmpty(): boolean;
    get isFull(): boolean;
    /** Warmup: enough candles to draw indicators (5000). */
    get isWarmup(): boolean;
    /** Live: enough candles to enable entries (6000). */
    get isLive(): boolean;
    /** Physical index for logical idx (0=oldest). Bounds-checked. */
    private phys;
    /**
     * O(1) push. If full, evicts oldest (head advances) — purge without copy.
     * Caller must ensure candles arrive in openTime order (Binance does).
     */
    push(c: Ohlcv): void;
    /** Random access by logical index (0=oldest). */
    get(logicalIdx: number): Ohlcv;
    /** Typed getters without object alloc (hot path). */
    getClose(logicalIdx: number): number;
    getOpenTime(logicalIdx: number): bigint;
    /** Newest close (logical count-1). Throws if empty. */
    get newestClose(): number;
    /** Oldest openTime. */
    get oldestTime(): bigint | null;
    /** Newest openTime. */
    get newestTime(): bigint | null;
    /**
     * Linearize closes into `dest` (must be >= count). Returns number written.
     * Copies at most 2 contiguous segments (no per-element modulo in hot loop).
     * Why: indicators that need a contiguous view (brute-force drift check, snapshot)
     * call this; normal O(1) update path does NOT call it.
     */
    snapshotLinear(dest: Float64Array): number;
    /** Linearize full OHLCV into arrays (for snapshot/parquet flush). */
    snapshotLinearOHLCV(dest: {
        timestamps: BigUint64Array;
        opens: Float64Array;
        highs: Float64Array;
        lows: Float64Array;
        closes: Float64Array;
        volumes: Float64Array;
    }): number;
    /** For snapshot persistence — expose raw ring state. */
    getState(): {
        head: number;
        count: number;
    };
    /** Restore ring pointers (backing arrays must already be filled). */
    setState(head: number, count: number): void;
    /** Clear without deallocating backing stores. */
    clear(): void;
    /** Iterate closes in logical order (oldest→newest). Alloc-free per step if inlined. */
    closesIter(): Generator<number>;
}
//# sourceMappingURL=RingBufferSoA.d.ts.map