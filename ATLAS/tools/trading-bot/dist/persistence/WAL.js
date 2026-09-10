/**
 * WAL — file-based append-only log of closed candles between snapshots.
 *
 * Replaces better-sqlite3 with a simple JSONL file per symbol to avoid
 * native build requirements on Windows. Same API: append / replay / prune.
 * Crash-safe via append + fsync.
 */
import { mkdirSync, appendFileSync, readFileSync, existsSync, writeFileSync, openSync, closeSync, fsyncSync, renameSync } from "node:fs";
import { dirname } from "node:path";
export class WAL {
    path;
    constructor(path) {
        this.path = path;
        mkdirSync(dirname(this.path), { recursive: true });
        if (!existsSync(this.path))
            writeFileSync(this.path, "", "utf-8");
    }
    append(c) {
        const line = JSON.stringify([Number(c.openTime), c.open, c.high, c.low, c.close, c.volume]) + "\n";
        appendFileSync(this.path, line, "utf-8");
        // best-effort fsync
        try {
            const fd = openSync(this.path, "a");
            fsyncSync(fd);
            closeSync(fd);
        }
        catch { }
    }
    appendBatch(candles) {
        if (candles.length === 0)
            return;
        const lines = candles.map((c) => JSON.stringify([Number(c.openTime), c.open, c.high, c.low, c.close, c.volume])).join("\n") + "\n";
        appendFileSync(this.path, lines, "utf-8");
    }
    readAll() {
        if (!existsSync(this.path))
            return [];
        const raw = readFileSync(this.path, "utf-8");
        if (!raw.trim())
            return [];
        return raw.trim().split("\n").filter(Boolean).map((l) => {
            const [t, o, h, lo, c, v] = JSON.parse(l);
            return { openTime: BigInt(t), open: o, high: h, low: lo, close: c, volume: v };
        });
    }
    /** Replay candles with openTime > fromOpenTime (exclusive), ordered asc. */
    replay(fromOpenTime) {
        return this.readAll().filter((c) => c.openTime > fromOpenTime).sort((a, b) => Number(a.openTime - b.openTime));
    }
    /** Prune candles older than cutoff. */
    pruneBefore(cutoffOpenTime) {
        const all = this.readAll();
        const kept = all.filter((c) => c.openTime >= cutoffOpenTime);
        const removed = all.length - kept.length;
        if (removed > 0) {
            const lines = kept.map((c) => JSON.stringify([Number(c.openTime), c.open, c.high, c.low, c.close, c.volume])).join("\n") + (kept.length ? "\n" : "");
            const tmp = `${this.path}.tmp`;
            writeFileSync(tmp, lines, "utf-8");
            try {
                renameSync(tmp, this.path);
            }
            catch { }
        }
        return removed;
    }
    getCount() {
        return this.readAll().length;
    }
    close() {
        // no-op for file WAL
    }
}
//# sourceMappingURL=WAL.js.map