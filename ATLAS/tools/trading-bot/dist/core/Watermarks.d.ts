/**
 * Watermarks — state machine for 5000/6000/15000 gates with hysteresis.
 *
 * Why hysteresis: after a WS gap we don't want to flip LIVE->WARMUP->LIVE
 * on every reconnection tick. We require N consecutive valid closes before
 * re-enabling entries, preventing phantom trades on incomplete windows.
 */
export type WatermarkState = "INIT" | "WARMUP_DRAW" | "LIVE_FILL" | "ROLLING";
export declare class Watermarks {
    private state;
    private consecutiveValid;
    private readonly hysteresis;
    constructor(hysteresis?: number);
    /** Call on every accepted close. `count` is RingBuffer count. */
    update(count: number): WatermarkState;
    /** Called on gap/disconnect — reset hysteresis. */
    onGap(): void;
    getState(): WatermarkState;
    canDraw(): boolean;
    canEnter(): boolean;
    /** For snapshot persistence. */
    getSnapshot(): {
        state: WatermarkState;
        consecutiveValid: number;
    };
    setSnapshot(s: {
        state: WatermarkState;
        consecutiveValid: number;
    }): void;
}
//# sourceMappingURL=Watermarks.d.ts.map