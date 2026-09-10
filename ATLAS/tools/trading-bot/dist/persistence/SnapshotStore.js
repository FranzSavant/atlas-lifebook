/**
 * SnapshotStore — atomic snapshot with SHA256 checksum.
 *
 * Atomicity: write to .tmp + fsync + rename. Keeps last SNAPSHOT_KEEP_LAST
 * files. Validates checksum on load; corrupted snapshot is ignored and
 * caller falls back to bootstrap.
 */
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync, readFileSync, renameSync, readdirSync, unlinkSync, existsSync, openSync, closeSync, fsyncSync } from "node:fs";
import { join, dirname } from "node:path";
import { SCHEMA_VERSION } from "../config.js";
export class SnapshotStore {
    dir;
    constructor(dir) {
        this.dir = dir;
        mkdirSync(this.dir, { recursive: true });
    }
    checksum(obj) {
        const json = JSON.stringify(obj);
        return createHash("sha256").update(json).digest("hex");
    }
    save(payload) {
        const full = {
            schemaVersion: SCHEMA_VERSION,
            timestamp: new Date().toISOString(),
            ...payload,
        };
        const sum = this.checksum({ schemaVersion: full.schemaVersion, newestOpenTime: full.newestOpenTime, count: full.count, head: full.head, watermarks: full.watermarks, indicators: full.indicators });
        const withSum = { ...full, checksum: sum };
        const fname = `snapshot-${String(full.newestOpenTime)}-${Date.now()}.json`;
        const tmp = join(this.dir, `.${fname}.tmp`);
        const dst = join(this.dir, fname);
        const json = JSON.stringify(withSum, null, 2);
        // ensure dir exists
        mkdirSync(dirname(dst), { recursive: true });
        writeFileSync(tmp, json, "utf-8");
        // fsync tmp
        try {
            const fd = openSync(tmp, "r");
            fsyncSync(fd);
            closeSync(fd);
        }
        catch { }
        renameSync(tmp, dst);
        this.prune();
        return dst;
    }
    loadLatest() {
        const files = readdirSync(this.dir).filter((f) => f.startsWith("snapshot-") && f.endsWith(".json")).sort().reverse();
        for (const f of files) {
            const p = join(this.dir, f);
            try {
                const raw = readFileSync(p, "utf-8");
                const obj = JSON.parse(raw);
                const { checksum, ...rest } = obj;
                const expected = this.checksum(rest);
                const valid = checksum === expected;
                if (!valid) {
                    // console.warn(`[Snapshot] checksum mismatch ${f}, skipping`);
                    continue;
                }
                if (rest.schemaVersion !== SCHEMA_VERSION) {
                    // console.warn(`[Snapshot] schema mismatch, skipping`);
                    continue;
                }
                return { payload: rest, checksumValid: valid };
            }
            catch {
                continue;
            }
        }
        return null;
    }
    prune() {
        const files = readdirSync(this.dir).filter((f) => f.startsWith("snapshot-") && f.endsWith(".json")).sort();
        const keep = 3;
        if (files.length <= keep)
            return;
        for (let i = 0; i < files.length - keep; i++) {
            try {
                unlinkSync(join(this.dir, files[i]));
            }
            catch { }
        }
    }
    exists() {
        return existsSync(this.dir) && readdirSync(this.dir).some((f) => f.startsWith("snapshot-"));
    }
}
//# sourceMappingURL=SnapshotStore.js.map