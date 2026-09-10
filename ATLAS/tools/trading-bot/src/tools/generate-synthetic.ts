/**
 * generate-synthetic — creates 20k M5 candles with realistic walk, flushes to parquet.
 * Purpose: validate O(1) incremental vs brute force drift, watermark gates, and backtest perf
 * without touching Binance API (0 weight).
 */

import { ParquetColdStore } from "../persistence/ParquetColdStore.js";
import type { Ohlcv } from "../core/RingBufferSoA.js";

function genCandles(count: number, startPrice = 65000, startTimeMs = Date.UTC(2024, 0, 1)): Ohlcv[] {
  const out: Ohlcv[] = [];
  let price = startPrice;
  let time = startTimeMs;
  // simple seeded PRNG for reproducibility
  let seed = 123456;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0xffffffff;
  };
  for (let i = 0; i < count; i++) {
    const drift = (rand() - 0.5) * 20; // +-10
    const vol = rand() * 5;
    const open = price;
    price = Math.max(1000, price + drift);
    const high = Math.max(open, price) + vol;
    const low = Math.min(open, price) - vol;
    const close = price;
    const volume = 10 + rand() * 50;
    out.push({ openTime: BigInt(time), open, high, low, close, volume });
    time += 5 * 60 * 1000;
  }
  return out;
}

async function main(): Promise<void> {
  const symbol = process.env["SYMBOL"] ?? "BTCUSDT";
  const baseDir = process.env["PARQUET_DIR"] ?? "data/parquet";
  const store = new ParquetColdStore(baseDir, symbol, "5m");
  const n = parseInt(process.env["COUNT"] ?? "20000", 10);
  console.log(`[Generate] ${n} synthetic M5 candles for ${symbol} -> ${baseDir}/${symbol}/5m/`);

  const candles = genCandles(n);
  await store.appendBatch(candles);
  console.log(`[Generate] done. parquet count=${store.count()} last=${new Date(Number(candles[candles.length - 1]!.openTime)).toISOString()}`);

  // Quick O(1) drift check on the generated data
  const { SmaIncremental, EmaIncremental } = await import("../core/IncrementalState.js");
  const closes = new Float64Array(candles.map((c) => c.close));
  const sma = new SmaIncremental(5000);
  sma.seed(closes.subarray(0, 5000), 5000);
  for (let i = 5000; i < closes.length; i++) sma.update(closes[i]!);
  const brute = SmaIncremental.bruteForce(closes, 5000);
  const diff = Math.abs(sma.getValue() - brute);
  console.log(`[Drift] SMA5000 incremental=${sma.getValue().toFixed(6)} brute=${brute.toFixed(6)} diff=${diff.toExponential(2)} ${diff < 1e-9 ? "OK" : "DRIFT!"}`);

  const ema = new EmaIncremental(5000);
  ema.seed(closes, closes.length);
  // re-seed incremental style
  const ema2 = new EmaIncremental(5000);
  ema2.seed(closes.subarray(0, 5000), 5000);
  for (let i = 5000; i < closes.length; i++) ema2.update(closes[i]!);
  const eDiff = Math.abs(ema.getValue() - ema2.getValue());
  console.log(`[Drift] EMA5000 seed vs incremental diff=${eDiff.toExponential(2)} ${eDiff < 1e-6 ? "OK" : "DRIFT!"}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
