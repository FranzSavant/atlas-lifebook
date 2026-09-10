/**
 * SnapshotStore — atomic snapshot with SHA256 checksum.
 *
 * Atomicity: write to .tmp + fsync + rename. Keeps last SNAPSHOT_KEEP_LAST
 * files. Validates checksum on load; corrupted snapshot is ignored and
 * caller falls back to bootstrap.
 */
export interface SnapshotPayload {
    schemaVersion: number;
    timestamp: string;
    newestOpenTime: string;
    count: number;
    head: number;
    watermarks: unknown;
    indicators: unknown[];
}
export declare class SnapshotStore {
    private dir;
    constructor(dir: string);
    private checksum;
    save(payload: Omit<SnapshotPayload, "schemaVersion" | "timestamp"> & {
        newestOpenTime: string;
    }): string;
    loadLatest(): {
        payload: SnapshotPayload;
        checksumValid: boolean;
    } | null;
    private prune;
    exists(): boolean;
}
//# sourceMappingURL=SnapshotStore.d.ts.map