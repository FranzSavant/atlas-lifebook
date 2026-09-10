/**
 * StrategyEngine — orchestrates 2 incremental indicators + watermark gates.
 *
 * Replace the two example indicators (SMA/EMA) with your real documented
 * ones by extending IncrementalState. The engine doesn't care — it just
 * calls update(close) O(1) and checks cross/condition.
 *
 * Signal semantics: LONG / SHORT / NONE. Caller decides order sizing.
 */
import type { IncrementalState, IncrementalSnapshot } from "../core/IncrementalState.js";
import { Watermarks } from "../core/Watermarks.js";
export type Signal = "LONG" | "SHORT" | "NONE";
export interface StrategyConfig {
    createIndicatorA: () => IncrementalState;
    createIndicatorB: () => IncrementalState;
    hysteresis?: number;
}
export declare class StrategyEngine {
    private indA;
    private indB;
    private watermarks;
    private prevSignal;
    private prevDiff;
    constructor(cfg: StrategyConfig, watermarks?: Watermarks);
    /** Seed both indicators from contiguous closes (cold+hot). */
    seed(closes: Float64Array, count: number): void;
    /**
     * O(1) per close — call only when kline.x==true.
     * Returns signal if watermarks allow entries, otherwise NONE.
     */
    onClose(close: number, hotCount: number): Signal;
    /** Called on WS gap — resets watermark hysteresis. */
    onGap(): void;
    getValues(): {
        a: number;
        b: number;
        canEnter: boolean;
        state: string;
    };
    getState(): {
        indicators: IncrementalSnapshot[];
        watermarks: unknown;
        prevDiff: number | null;
        prevSignal: Signal;
    };
    setState(s: {
        indicators: IncrementalSnapshot[];
        watermarks: unknown;
        prevDiff: number | null;
        prevSignal: Signal;
    }): void;
    /** Factory helper for the default SMA/EMA example (replace with yours). */
    static withExampleIndicators(periodA?: number, periodB?: number): StrategyEngine;
}
//# sourceMappingURL=StrategyEngine.d.ts.map