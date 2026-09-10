/**
 * PingPongBuffer — double-buffered snapshot for lock-free read.
 *
 * Why: WS writer runs on the event loop and must never block the evaluator.
 * Bank A is written by WS; on each kline close we atomically swap A<->B
 * (just pointer exchange) and the evaluator reads B contiguously.
 * Linearization (wrap fix) happens only at swap time, not per tick.
 */
import { RingBufferSoA } from "./RingBufferSoA.js";
export class PingPongBuffer {
    bankA;
    bankB;
    active = "A";
    /** Linearized snapshot visible to readers after last swap. */
    snapshotCloses;
    snapshotCount = 0;
    constructor(capacity) {
        this.bankA = new RingBufferSoA(capacity);
        this.bankB = new RingBufferSoA(capacity);
        this.snapshotCloses = new Float64Array(capacity);
    }
    /** WS hot path — write single candle to active bank. O(1). */
    writeToActive(c) {
        const bank = this.active === "A" ? this.bankA : this.bankB;
        bank.push(c);
    }
    /** Seed both banks (bootstrap path). */
    seedAll(candles) {
        this.bankA.clear();
        this.bankB.clear();
        for (const c of candles)
            this.bankA.push(c);
        // Copy A -> B so both are in sync before first swap
        const tmp = new Float64Array(this.bankA.capacity);
        const n = this.bankA.snapshotLinear(tmp);
        // refill B from linear snapshot is not needed; we swap pointers instead
        // Simpler: just push same candles to B
        for (const c of candles)
            this.bankB.push(c);
        void n;
    }
    /**
     * Atomic swap: active bank becomes the snapshot, previous snapshot bank
     * becomes the new active (empty or with tail). Returns linearized closes
     * and count for the evaluator to use without locks.
     *
     * In single-threaded Node this is just a pointer swap; with Worker threads
     * you'd use SharedArrayBuffer + Atomics here.
     */
    swap() {
        // whichever was active is now the snapshot source
        const snapshotBank = this.active === "A" ? this.bankA : this.bankB;
        this.snapshotCount = snapshotBank.snapshotLinear(this.snapshotCloses);
        const newestTime = snapshotBank.newestTime;
        // flip active
        this.active = this.active === "A" ? "B" : "A";
        // new active starts as copy of snapshot so we don't lose history
        // Instead of copying 15k elements, we just keep both banks in sync by
        // swapping references logically — both banks already hold same history
        // because we pushed to active only. For correctness, ensure new active
        // has same data: copy snapshot closes back is not needed if we maintain
        // invariant that both banks are kept in sync via swap.
        // Quick fix: if B was stale, sync it
        const newActive = this.active === "A" ? this.bankA : this.bankB;
        if (newActive.count !== snapshotBank.count) {
            // Re-sync by clearing and pushing linear snapshot (rare, bootstrap)
            newActive.clear();
            const tsArr = new BigUint64Array(this.snapshotCount);
            const opens = new Float64Array(this.snapshotCount);
            const highs = new Float64Array(this.snapshotCount);
            const lows = new Float64Array(this.snapshotCount);
            const vols = new Float64Array(this.snapshotCount);
            snapshotBank.snapshotLinearOHLCV({
                timestamps: tsArr,
                opens,
                highs,
                lows,
                closes: new Float64Array(this.snapshotCount),
                volumes: vols,
            });
            // Re-push via snapshotCloses only is enough for closes-based indicators;
            // full OHLCV sync would need those arrays — for now ensure count matches
            // by pushing closes as synthetic candles (open=close for sync)
            // In practice we keep both banks fully synced by pushing to both on swap
            // if divergence detected — simple loop:
            for (let i = 0; i < this.snapshotCount; i++) {
                // we push a minimal candle; real OHLCV sync is done via snapshotLinearOHLCV above
                // but to keep ring pointers correct we reconstruct from snapshotBank's get()
                const c = snapshotBank.get(i);
                // only push if not already present — dedupe by timestamp
                if (newActive.newestTime !== c.openTime) {
                    // clear and re-seed fully if diverged
                    newActive.clear();
                    for (let j = 0; j < this.snapshotCount; j++)
                        newActive.push(snapshotBank.get(j));
                    break;
                }
            }
        }
        return { closes: this.snapshotCloses.subarray(0, this.snapshotCount), count: this.snapshotCount, newestTime };
    }
    /** Direct access to active bank for diagnostics. */
    getActiveBank() {
        return this.active === "A" ? this.bankA : this.bankB;
    }
    getSnapshot() {
        return { closes: this.snapshotCloses.subarray(0, this.snapshotCount), count: this.snapshotCount };
    }
}
//# sourceMappingURL=PingPongBuffer.js.map