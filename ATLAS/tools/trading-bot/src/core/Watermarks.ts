/**
 * Watermarks — state machine for 5000/6000/15000 gates with hysteresis.
 *
 * Why hysteresis: after a WS gap we don't want to flip LIVE->WARMUP->LIVE
 * on every reconnection tick. We require N consecutive valid closes before
 * re-enabling entries, preventing phantom trades on incomplete windows.
 */

import { WARMUP_DRAW_CANDLES, LIVE_CANDLES } from "../config.js";

export type WatermarkState = "INIT" | "WARMUP_DRAW" | "LIVE_FILL" | "ROLLING";

export class Watermarks {
  private state: WatermarkState = "INIT";
  private consecutiveValid = 0;
  private readonly hysteresis: number;

  constructor(hysteresis = 5) {
    this.hysteresis = hysteresis;
  }

  /** Call on every accepted close. `count` is RingBuffer count. */
  update(count: number): WatermarkState {
    if (count < WARMUP_DRAW_CANDLES) {
      this.state = "INIT";
      this.consecutiveValid = 0;
      return this.state;
    }
    if (count < LIVE_CANDLES) {
      this.state = "WARMUP_DRAW";
      this.consecutiveValid = 0;
      return this.state;
    }
    if (count < 15000) {
      // Need hysteresis to reach LIVE_FILL
      if (this.state !== "LIVE_FILL" && this.state !== "ROLLING") {
        this.consecutiveValid++;
        if (this.consecutiveValid >= this.hysteresis) {
          this.state = "LIVE_FILL";
        } else {
          this.state = "WARMUP_DRAW";
        }
      } else {
        this.state = "LIVE_FILL";
      }
      return this.state;
    }
    // Rolling at capacity
    this.state = "ROLLING";
    return this.state;
  }

  /** Called on gap/disconnect — reset hysteresis. */
  onGap(): void {
    this.consecutiveValid = 0;
    if (this.state === "LIVE_FILL" || this.state === "ROLLING") {
      this.state = "WARMUP_DRAW";
    }
  }

  getState(): WatermarkState {
    return this.state;
  }

  canDraw(): boolean {
    return this.state !== "INIT";
  }

  canEnter(): boolean {
    return this.state === "LIVE_FILL" || this.state === "ROLLING";
  }

  /** For snapshot persistence. */
  getSnapshot(): { state: WatermarkState; consecutiveValid: number } {
    return { state: this.state, consecutiveValid: this.consecutiveValid };
  }

  setSnapshot(s: { state: WatermarkState; consecutiveValid: number }): void {
    this.state = s.state;
    this.consecutiveValid = s.consecutiveValid;
  }
}
