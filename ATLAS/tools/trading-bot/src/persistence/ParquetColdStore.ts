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

import { createReadStream, createWriteStream, existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { createGzip, gunzipSync, gzipSync } from "node:zlib";
import type { Ohlcv } from "../core/RingBufferSoA.js";

export class ParquetColdStore {
  private baseDir: string;
  private symbol: string;
  private interval: string;

  constructor(baseDir: string, symbol: string, interval: string) {
    this.baseDir = baseDir;
    this.symbol = symbol;
    this.interval = interval;
    mkdirSync(this.dir(), { recursive: true });
  }

  private dir(): string {
    return join(this.baseDir, this.symbol, this.interval);
  }

  private monthKey(openTime: bigint): string {
    const d = new Date(Number(openTime));
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  }

  private fileForMonth(month: string): string {
    return join(this.dir(), `${month}.jsonl.gz`);
  }

  /** Append batch; groups by month, appends gzipped JSONL. */
  async appendBatch(candles: Ohlcv[]): Promise<void> {
    const byMonth = new Map<string, Ohlcv[]>();
    for (const c of candles) {
      const k = this.monthKey(c.openTime);
      if (!byMonth.has(k)) byMonth.set(k, []);
      byMonth.get(k)!.push(c);
    }
    for (const [month, rows] of byMonth) {
      const file = this.fileForMonth(month);
      mkdirSync(dirname(file), { recursive: true });
      // read existing, append, rewrite gz — simple and crash-safe for small files
      let existing: Ohlcv[] = [];
      if (existsSync(file)) {
        existing = this.readMonthSync(month);
      }
      const merged = this.dedupAndSort([...existing, ...rows]);
      const lines = merged.map((c) => JSON.stringify([Number(c.openTime), c.open, c.high, c.low, c.close, c.volume])).join("\n") + "\n";
      const gz = gzipSync(Buffer.from(lines, "utf-8"));
      // atomic write
      const tmp = `${file}.tmp`;
      const { writeFileSync, renameSync } = await import("node:fs");
      writeFileSync(tmp, gz);
      renameSync(tmp, file);
    }
  }

  private readMonthSync(month: string): Ohlcv[] {
    const file = this.fileForMonth(month);
    if (!existsSync(file)) return [];
    const gz = readFileSync(file);
    const buf = gunzipSync(gz);
    const lines = buf.toString("utf-8").split("\n").filter(Boolean);
    return lines.map((l) => {
      const [t, o, h, lo, c, v] = JSON.parse(l) as [number, number, number, number, number, number];
      return { openTime: BigInt(t), open: o, high: h, low: lo, close: c, volume: v };
    });
  }

  /** All months sorted. */
  private listMonths(): string[] {
    if (!existsSync(this.dir())) return [];
    return readdirSync(this.dir()).filter((f) => f.endsWith(".jsonl.gz")).map((f) => f.replace(".jsonl.gz", "")).sort();
  }

  /** Newest openTime in cold store, or null if empty. */
  getLastTimestamp(): bigint | null {
    const months = this.listMonths();
    if (months.length === 0) return null;
    for (let i = months.length - 1; i >= 0; i--) {
      const rows = this.readMonthSync(months[i]!);
      if (rows.length > 0) return rows[rows.length - 1]!.openTime;
    }
    return null;
  }

  /** Query range inclusive [from, to]. Streams months in order. */
  async *queryRange(from: bigint, to: bigint): AsyncIterable<Ohlcv> {
    const months = this.listMonths();
    for (const m of months) {
      const rows = this.readMonthSync(m);
      for (const c of rows) {
        if (c.openTime >= from && c.openTime <= to) yield c;
      }
    }
  }

  /** Full scan as async iterable (for backtest). */
  async *scanAll(): AsyncIterable<Ohlcv> {
    const months = this.listMonths();
    for (const m of months) {
      const rows = this.readMonthSync(m);
      for (const c of rows) yield c;
    }
  }

  /** Count (for diagnostics). */
  count(): number {
    let n = 0;
    for (const m of this.listMonths()) n += this.readMonthSync(m).length;
    return n;
  }

  private dedupAndSort(rows: Ohlcv[]): Ohlcv[] {
    const map = new Map<bigint, Ohlcv>();
    for (const c of rows) map.set(c.openTime, c);
    return [...map.values()].sort((a, b) => Number(a.openTime - b.openTime));
  }

  // --- Drift helpers ---
  /** Load last N closes as Float64Array for seeding. */
  loadLastCloses(n: number): { closes: Float64Array; count: number } {
    const all: number[] = [];
    const months = this.listMonths().reverse();
    for (const m of months) {
      const rows = this.readMonthSync(m).reverse();
      for (const c of rows) {
        all.push(c.close);
        if (all.length >= n) break;
      }
      if (all.length >= n) break;
    }
    all.reverse(); // oldest->newest
    const arr = new Float64Array(all.length);
    for (let i = 0; i < all.length; i++) arr[i] = all[i]!;
    return { closes: arr, count: all.length };
  }
}
