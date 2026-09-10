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

import { HOT_CAPACITY } from "../config.js";

export interface Ohlcv {
  openTime: bigint; // ms since epoch — BigInt to avoid 53-bit issues
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export class RingBufferSoA {
  readonly capacity: number;

  /** SoA backing stores */
  readonly timestamps: BigUint64Array;
  readonly opens: Float64Array;
  readonly highs: Float64Array;
  readonly lows: Float64Array;
  readonly closes: Float64Array;
  readonly volumes: Float64Array;

  private _head = 0; // physical index of logical 0 (oldest)
  private _count = 0; // number of valid entries (0..capacity)

  constructor(capacity: number = HOT_CAPACITY) {
    if (capacity <= 0 || !Number.isInteger(capacity)) throw new Error(`capacity must be positive int, got ${capacity}`);
    this.capacity = capacity;
    this.timestamps = new BigUint64Array(capacity);
    this.opens = new Float64Array(capacity);
    this.highs = new Float64Array(capacity);
    this.lows = new Float64Array(capacity);
    this.closes = new Float64Array(capacity);
    this.volumes = new Float64Array(capacity);
  }

  // --- getters ---

  get head(): number { return this._head; }
  get count(): number { return this._count; }
  get isEmpty(): boolean { return this._count === 0; }
  get isFull(): boolean { return this._count === this.capacity; }

  /** Warmup: enough candles to draw indicators (5000). */
  get isWarmup(): boolean { return this._count >= 5000; }
  /** Live: enough candles to enable entries (6000). */
  get isLive(): boolean { return this._count >= 6000; }

  /** Physical index for logical idx (0=oldest). Bounds-checked. */
  private phys(logicalIdx: number): number {
    if (logicalIdx < 0 || logicalIdx >= this._count) throw new RangeError(`logicalIdx ${logicalIdx} out of range [0, ${this._count})`);
    return (this._head + logicalIdx) % this.capacity;
  }

  /**
   * O(1) push. If full, evicts oldest (head advances) — purge without copy.
   * Caller must ensure candles arrive in openTime order (Binance does).
   */
  push(c: Ohlcv): void {
    if (this._count < this.capacity) {
      const p = (this._head + this._count) % this.capacity;
      this.timestamps[p] = c.openTime;
      this.opens[p] = c.open;
      this.highs[p] = c.high;
      this.lows[p] = c.low;
      this.closes[p] = c.close;
      this.volumes[p] = c.volume;
      this._count++;
    } else {
      // overwrite oldest; head advances (ring)
      const p = this._head;
      this.timestamps[p] = c.openTime;
      this.opens[p] = c.open;
      this.highs[p] = c.high;
      this.lows[p] = c.low;
      this.closes[p] = c.close;
      this.volumes[p] = c.volume;
      this._head = (this._head + 1) % this.capacity;
      // _count stays at capacity
    }
  }

  /** Random access by logical index (0=oldest). */
  get(logicalIdx: number): Ohlcv {
    const p = this.phys(logicalIdx);
    return {
      openTime: this.timestamps[p]!,
      open: this.opens[p]!,
      high: this.highs[p]!,
      low: this.lows[p]!,
      close: this.closes[p]!,
      volume: this.volumes[p]!,
    };
  }

  /** Typed getters without object alloc (hot path). */
  getClose(logicalIdx: number): number { return this.closes[this.phys(logicalIdx)]!; }
  getOpenTime(logicalIdx: number): bigint { return this.timestamps[this.phys(logicalIdx)]!; }

  /** Newest close (logical count-1). Throws if empty. */
  get newestClose(): number {
    if (this._count === 0) throw new Error("RingBufferSoA is empty");
    return this.closes[(this._head + this._count - 1) % this.capacity]!;
  }

  /** Oldest openTime. */
  get oldestTime(): bigint | null {
    if (this._count === 0) return null;
    return this.timestamps[this._head]!;
  }

  /** Newest openTime. */
  get newestTime(): bigint | null {
    if (this._count === 0) return null;
    return this.timestamps[(this._head + this._count - 1) % this.capacity]!;
  }

  /**
   * Linearize closes into `dest` (must be >= count). Returns number written.
   * Copies at most 2 contiguous segments (no per-element modulo in hot loop).
   * Why: indicators that need a contiguous view (brute-force drift check, snapshot)
   * call this; normal O(1) update path does NOT call it.
   */
  snapshotLinear(dest: Float64Array): number {
    if (dest.length < this._count) throw new RangeError(`dest length ${dest.length} < count ${this._count}`);
    if (this._count === 0) return 0;
    const tail = this.capacity - this._head;
    if (this._count <= tail) {
      // single contiguous segment
      dest.set(this.closes.subarray(this._head, this._head + this._count), 0);
    } else {
      dest.set(this.closes.subarray(this._head, this.capacity), 0);
      dest.set(this.closes.subarray(0, this._count - tail), tail);
    }
    return this._count;
  }

  /** Linearize full OHLCV into arrays (for snapshot/parquet flush). */
  snapshotLinearOHLCV(dest: {
    timestamps: BigUint64Array;
    opens: Float64Array;
    highs: Float64Array;
    lows: Float64Array;
    closes: Float64Array;
    volumes: Float64Array;
  }): number {
    const n = this._count;
    const copy = (src: Float64Array | BigUint64Array, dst: Float64Array | BigUint64Array): void => {
      if (n === 0) return;
      const tail = this.capacity - this._head;
      if (n <= tail) {
        // @ts-expect-error subarray exists on both
        dst.set(src.subarray(this._head, this._head + n), 0);
      } else {
        // @ts-expect-error
        dst.set(src.subarray(this._head, this.capacity), 0);
        // @ts-expect-error
        dst.set(src.subarray(0, n - tail), tail);
      }
    };
    copy(this.timestamps, dest.timestamps);
    copy(this.opens, dest.opens);
    copy(this.highs, dest.highs);
    copy(this.lows, dest.lows);
    copy(this.closes, dest.closes);
    copy(this.volumes, dest.volumes);
    return n;
  }

  /** For snapshot persistence — expose raw ring state. */
  getState(): { head: number; count: number } {
    return { head: this._head, count: this._count };
  }

  /** Restore ring pointers (backing arrays must already be filled). */
  setState(head: number, count: number): void {
    if (head < 0 || head >= this.capacity) throw new RangeError(`head ${head} out of range`);
    if (count < 0 || count > this.capacity) throw new RangeError(`count ${count} out of range`);
    this._head = head;
    this._count = count;
  }

  /** Clear without deallocating backing stores. */
  clear(): void {
    this._head = 0;
    this._count = 0;
  }

  /** Iterate closes in logical order (oldest→newest). Alloc-free per step if inlined. */
  *closesIter(): Generator<number> {
    for (let i = 0; i < this._count; i++) yield this.closes[(this._head + i) % this.capacity]!;
  }
}

/* ── Inline tests (run with `npm run build && node --test` or manual) ──
import assert from "node:assert";
const rb = new RingBufferSoA(5);
rb.push({openTime:1n,open:1,high:1,low:1,close:10,volume:1});
rb.push({openTime:2n,open:1,high:1,low:1,close:20,volume:1});
assert.equal(rb.count,2);
assert.equal(rb.getClose(0),10);
assert.equal(rb.getClose(1),20);
for(let i=3;i<=6;i++) rb.push({openTime:BigInt(i),open:1,high:1,low:1,close:i*10,volume:1});
assert.equal(rb.count,5); // capped
assert.equal(rb.getClose(0),20); // oldest after wrap is 20 (10 evicted)
const dest=new Float64Array(5); rb.snapshotLinear(dest);
assert.deepEqual([...dest],[20,30,40,50,60]);
*/
