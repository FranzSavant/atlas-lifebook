/**
 * validate-incremental — strict O(1) vs brute force for 15k rolling with wrap.
 * Tests RingBuffer wrap-around + IncrementalState O(1) drift < 1e-9.
 */

import { RingBufferSoA } from "../core/RingBufferSoA.js";
import { SmaIncremental, EmaIncremental } from "../core/IncrementalState.js";
import { Watermarks } from "../core/Watermarks.js";

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(`ASSERT FAIL: ${msg}`);
}

function testRingWrap(): void {
  const rb = new RingBufferSoA(5);
  for (let i = 1; i <= 7; i++) rb.push({ openTime: BigInt(i), open: i, high: i, low: i, close: i * 10, volume: 1 });
  assert(rb.count === 5, "count capped 5");
  assert(rb.getClose(0) === 30, `oldest after wrap should be 30 got ${rb.getClose(0)}`);
  assert(rb.getClose(4) === 70, `newest should be 70 got ${rb.getClose(4)}`);
  const dest = new Float64Array(5);
  rb.snapshotLinear(dest);
  assert(dest[0] === 30 && dest[4] === 70, `linear ${[...dest]}`);
  console.log("[OK] RingBuffer wrap");
}

function testSmaO1(): void {
  const period = 5000;
  const total = 15000;
  // deterministic closes: 1..15000
  const closes = new Float64Array(total);
  for (let i = 0; i < total; i++) closes[i] = i + 1;

  const sma = new SmaIncremental(period);
  sma.seed(closes.subarray(0, period), period);
  for (let i = period; i < total; i++) sma.update(closes[i]!);

  const brute = SmaIncremental.bruteForce(closes, period);
  const diff = Math.abs(sma.getValue() - brute);
  assert(diff < 1e-9, `SMA drift ${diff} brute=${brute} inc=${sma.getValue()}`);
  console.log(`[OK] SMA5000 O(1) diff=${diff.toExponential(2)}`);

  // Snapshot restore must be bit-identical
  const snap = sma.getState();
  const sma2 = new SmaIncremental(period);
  sma2.setState(snap);
  for (let i = total; i < total + 100; i++) {
    const c = i + 1;
    const v1 = sma.update(c);
    const v2 = sma2.update(c);
    assert(Math.abs(v1 - v2) < 1e-12, `snapshot diverge at ${i}`);
  }
  console.log("[OK] SMA snapshot restore bit-identical");
}

function testEmaO1(): void {
  const period = 5000;
  const total = 15000;
  const closes = new Float64Array(total);
  for (let i = 0; i < total; i++) closes[i] = 100 + Math.sin(i / 100) * 10;

  const ema = new EmaIncremental(period);
  ema.seed(closes.subarray(0, total), total);
  const brute = EmaIncremental.bruteForce(closes, period);
  assert(Math.abs(ema.getValue() - brute) < 1e-9, `EMA brute mismatch`);

  const ema2 = new EmaIncremental(period);
  ema2.seed(closes.subarray(0, period), period);
  for (let i = period; i < total; i++) ema2.update(closes[i]!);
  const diff = Math.abs(ema.getValue() - ema2.getValue());
  assert(diff < 1e-9, `EMA incremental diff ${diff}`);
  console.log(`[OK] EMA5000 O(1) diff=${diff.toExponential(2)}`);
}

function testWatermarks(): void {
  const wm = new Watermarks(3);
  assert(wm.update(0) === "INIT" && !wm.canDraw() && !wm.canEnter(), "INIT");
  assert(wm.update(5000) === "WARMUP_DRAW" && wm.canDraw() && !wm.canEnter(), "WARMUP");
  // need 3 consecutive to reach LIVE_FILL
  wm.update(6000); wm.update(6000);
  assert(wm.update(6000) === "LIVE_FILL" && wm.canEnter(), "LIVE_FILL after hysteresis");
  assert(wm.update(15000) === "ROLLING" && wm.canEnter(), "ROLLING");
  wm.onGap();
  assert(wm.getState() === "WARMUP_DRAW" && !wm.canEnter(), "gap resets");
  console.log("[OK] Watermarks hysteresis");
}

function testPerf(): void {
  const period = 5000;
  const total = 20000;
  const closes = new Float64Array(total);
  for (let i = 0; i < total; i++) closes[i] = 50000 + (Math.random() - 0.5) * 1000;

  const t0 = performance.now();
  const sma = new SmaIncremental(period);
  sma.seed(closes.subarray(0, period), period);
  for (let i = period; i < total; i++) sma.update(closes[i]!);
  const t1 = performance.now();
  console.log(`[Perf] SMA5000 O(1) 15k updates: ${(t1 - t0).toFixed(2)}ms (~${((t1 - t0) / 15000 * 1e6).toFixed(0)}ns/update)`);

  const b0 = performance.now();
  let brute = 0;
  for (let i = period; i < total; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += closes[j]!;
    brute = sum / period;
  }
  const b1 = performance.now();
  console.log(`[Perf] SMA5000 brute 15k * 5k scan: ${(b1 - b0).toFixed(2)}ms (ratio ${(b1 - b0) / (t1 - t0 + 0.001) | 0}x slower)`);
  void brute;
}

testRingWrap();
testSmaO1();
testEmaO1();
testWatermarks();
testPerf();
console.log("All validate-incremental OK");
