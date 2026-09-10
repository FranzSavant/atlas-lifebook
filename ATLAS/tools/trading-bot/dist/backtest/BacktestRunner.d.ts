/**
 * BacktestRunner — identical to live, but reads ParquetColdStore instead of WS.
 *
 * Guarantees: same StrategyEngine, same O(1) update path, same watermark gates.
 * Zero Binance API calls.
 */
import { ParquetColdStore } from "../persistence/ParquetColdStore.js";
import { StrategyEngine } from "../strategy/StrategyEngine.js";
export interface BacktestResult {
    totalCandles: number;
    signals: {
        openTime: bigint;
        close: number;
        signal: string;
        a: number;
        b: number;
    }[];
    elapsedMs: number;
}
export declare function runBacktest(opts: {
    store: ParquetColdStore;
    engine: StrategyEngine;
    from?: bigint;
    to?: bigint;
    hotCapacity?: number;
}): Promise<BacktestResult>;
//# sourceMappingURL=BacktestRunner.d.ts.map