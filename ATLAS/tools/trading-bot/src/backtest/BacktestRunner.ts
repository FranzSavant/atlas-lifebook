/**
 * BacktestRunner — identical to live, but reads ParquetColdStore instead of WS.
 *
 * Guarantees: same StrategyEngine, same O(1) update path, same watermark gates.
 * Zero Binance API calls.
 */

import { ParquetColdStore } from "../persistence/ParquetColdStore.js";
import { StrategyEngine } from "../strategy/StrategyEngine.js";
import type { Ohlcv } from "../core/RingBufferSoA.js";

export interface BacktestResult {
  totalCandles: number;
  signals: { openTime: bigint; close: number; signal: string; a: number; b: number }[];
  elapsedMs: number;
}

export async function runBacktest(opts: {
  store: ParquetColdStore;
  engine: StrategyEngine;
  from?: bigint;
  to?: bigint;
  hotCapacity?: number;
}): Promise<BacktestResult> {
  const t0 = Date.now();
  const signals: BacktestResult["signals"] = [];
  let count = 0;
  let total = 0;

  // Stream closes in order; seed incrementally so watermarks evolve naturally
  // For simplicity we stream and call onClose for each — same as live but offline
  const iterable = opts.from !== undefined || opts.to !== undefined
    ? opts.store.queryRange(opts.from ?? 0n, opts.to ?? BigInt(Number.MAX_SAFE_INTEGER))
    : opts.store.scanAll();

  for await (const c of iterable) {
    total++;
    count++;
    const sig = opts.engine.onClose(c.close, count);
    if (sig !== "NONE") {
      const v = opts.engine.getValues();
      signals.push({ openTime: c.openTime, close: c.close, signal: sig, a: v.a, b: v.b });
    }
  }

  return { totalCandles: total, signals, elapsedMs: Date.now() - t0 };
}

// CLI entry: `npm run backtest`
if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}`) {
  const symbol = process.env["SYMBOL"] ?? "BTCUSDT";
  const baseDir = process.env["PARQUET_DIR"] ?? "data/parquet";
  const store = new ParquetColdStore(baseDir, symbol, "5m");
  const engine = StrategyEngine.withExampleIndicators(50, 20); // smaller periods for demo
  console.log(`[Backtest] scanning ${baseDir}/${symbol}/5m ... count=${store.count()}`);
  runBacktest({ store, engine }).then((r) => {
    console.log(`[Backtest] done ${r.totalCandles} candles in ${r.elapsedMs}ms, ${r.signals.length} signals`);
    for (const s of r.signals.slice(0, 20)) {
      console.log(`  ${new Date(Number(s.openTime)).toISOString()} close=${s.close} ${s.signal} a=${s.a.toFixed(2)} b=${s.b.toFixed(2)}`);
    }
    if (r.signals.length > 20) console.log(`  ... +${r.signals.length - 20} more`);
  });
}
