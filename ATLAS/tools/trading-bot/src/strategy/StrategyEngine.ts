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
import { SmaIncremental, EmaIncremental } from "../core/IncrementalState.js";
import { Watermarks } from "../core/Watermarks.js";

export type Signal = "LONG" | "SHORT" | "NONE";

export interface StrategyConfig {
  // indicator factory — supply your real indicators here
  createIndicatorA: () => IncrementalState;
  createIndicatorB: () => IncrementalState;
  // how many warm candles before engine trusts a cross (avoid warmup whipsaw)
  hysteresis?: number;
}

export class StrategyEngine {
  private indA: IncrementalState;
  private indB: IncrementalState;
  private watermarks: Watermarks;
  private prevSignal: Signal = "NONE";
  // for cross detection
  private prevDiff: number | null = null;

  constructor(cfg: StrategyConfig, watermarks?: Watermarks) {
    this.indA = cfg.createIndicatorA();
    this.indB = cfg.createIndicatorB();
    this.watermarks = watermarks ?? new Watermarks(5);
  }

  /** Seed both indicators from contiguous closes (cold+hot). */
  seed(closes: Float64Array, count: number): void {
    this.indA.seed(closes, count);
    this.indB.seed(closes, count);
    this.prevDiff = null;
    this.prevSignal = "NONE";
  }

  /**
   * O(1) per close — call only when kline.x==true.
   * Returns signal if watermarks allow entries, otherwise NONE.
   */
  onClose(close: number, hotCount: number): Signal {
    const state = this.watermarks.update(hotCount);
    void state; // for logging if needed
    this.indA.update(close);
    this.indB.update(close);

    if (!this.watermarks.canEnter()) return "NONE";
    if (!this.indA.isReady() || !this.indB.isReady()) return "NONE";

    const a = this.indA.getValue();
    const b = this.indB.getValue();
    if (!Number.isFinite(a) || !Number.isFinite(b)) return "NONE";

    const diff = a - b;
    let signal: Signal = "NONE";
    // Example condition: cross-over of A above B => LONG, cross-under => SHORT
    // Replace with your documented entry logic.
    if (this.prevDiff !== null) {
      if (this.prevDiff <= 0 && diff > 0) signal = "LONG";
      else if (this.prevDiff >= 0 && diff < 0) signal = "SHORT";
    }
    this.prevDiff = diff;

    // Optional: filter consecutive same signals
    if (signal !== "NONE" && signal === this.prevSignal) {
      // still emit but caller can dedupe via order queue
    }
    if (signal !== "NONE") this.prevSignal = signal;
    return signal;
  }

  /** Called on WS gap — resets watermark hysteresis. */
  onGap(): void {
    this.watermarks.onGap();
  }

  getValues(): { a: number; b: number; canEnter: boolean; state: string } {
    return {
      a: this.indA.getValue(),
      b: this.indB.getValue(),
      canEnter: this.watermarks.canEnter(),
      state: this.watermarks.getState(),
    };
  }

  // --- Snapshot ---

  getState(): { indicators: IncrementalSnapshot[]; watermarks: unknown; prevDiff: number | null; prevSignal: Signal } {
    return {
      indicators: [this.indA.getState(), this.indB.getState()],
      watermarks: this.watermarks.getSnapshot(),
      prevDiff: this.prevDiff,
      prevSignal: this.prevSignal,
    };
  }

  setState(s: { indicators: IncrementalSnapshot[]; watermarks: unknown; prevDiff: number | null; prevSignal: Signal }): void {
    if (s.indicators[0]) this.indA.setState(s.indicators[0]);
    if (s.indicators[1]) this.indB.setState(s.indicators[1]);
    this.watermarks.setSnapshot(s.watermarks as { state: import("../core/Watermarks.js").WatermarkState; consecutiveValid: number });
    this.prevDiff = s.prevDiff;
    this.prevSignal = s.prevSignal;
  }

  /** Factory helper for the default SMA/EMA example (replace with yours). */
  static withExampleIndicators(periodA = 5000, periodB = 200): StrategyEngine {
    return new StrategyEngine({
      createIndicatorA: () => new SmaIncremental(periodA),
      createIndicatorB: () => new EmaIncremental(periodB),
    });
  }
}
