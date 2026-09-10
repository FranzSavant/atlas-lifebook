/**
 * IncrementalState — O(1) per candle update + serializable state.
 *
 * Why incremental: recomputing SMA5000/EMA5000 over 5000-15000 closes on every
 * 5m close is O(N) and wasteful. Incremental keeps running sum/ema and updates
 * in constant time. `getState`/`setState` enables snapshot restore without
 * re-seeding from cold store.
 *
 * Drift guard: every DRIFT_CHECK_EVERY closes the caller should run a brute-force
 * recompute and compare to catch floating-point drift (documented, not enforced here).
 */
/** Serializable state bag — extend per indicator. */
export interface IncrementalSnapshot {
    kind: string;
    count: number;
    value: number;
    [k: string]: unknown;
}
export declare abstract class IncrementalState {
    abstract readonly kind: string;
    abstract readonly period: number;
    /** Seed from contiguous closes (length may be < period during warmup). */
    abstract seed(closes: Float64Array, count: number): void;
    /** O(1) update with newest close. Returns new indicator value. */
    abstract update(close: number): number;
    /** Current indicator value. NaN if not enough data. */
    abstract getValue(): number;
    /** Whether indicator has enough data to be valid. */
    abstract isReady(): boolean;
    /** Number of closes seen (including seed). */
    abstract getCount(): number;
    abstract getState(): IncrementalSnapshot;
    abstract setState(s: IncrementalSnapshot): void;
}
export interface SmaSnapshot extends IncrementalSnapshot {
    kind: "SMA";
    period: number;
    sum: number;
    window: number[];
}
export declare class SmaIncremental extends IncrementalState {
    readonly kind = "SMA";
    readonly period: number;
    private sum;
    private count;
    private idx;
    private window;
    private ready;
    constructor(period: number);
    seed(closes: Float64Array, count: number): void;
    update(close: number): number;
    getValue(): number;
    isReady(): boolean;
    getCount(): number;
    getState(): SmaSnapshot;
    setState(s: IncrementalSnapshot): void;
    /**
     * Drift validator — call in background (e.g., every 60 closes):
     *   const brute = closes.slice(-period).reduce((a,b)=>a+b,0)/period
     *   assert(Math.abs(sma.getValue()-brute) < 1e-9)
     * Keep epsilon proportional to price magnitude (e.g., 1e-9 * price).
     */
    static bruteForce(closes: Float64Array, period: number): number;
}
export interface EmaSnapshot extends IncrementalSnapshot {
    kind: "EMA";
    period: number;
    ema: number;
    k: number;
}
export declare class EmaIncremental extends IncrementalState {
    readonly kind = "EMA";
    readonly period: number;
    private readonly k;
    private ema;
    private count;
    private ready;
    constructor(period: number);
    seed(closes: Float64Array, count: number): void;
    update(close: number): number;
    getValue(): number;
    isReady(): boolean;
    getCount(): number;
    getState(): EmaSnapshot;
    setState(s: IncrementalSnapshot): void;
    static bruteForce(closes: Float64Array, period: number): number;
}
//# sourceMappingURL=IncrementalState.d.ts.map