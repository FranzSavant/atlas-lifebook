/**
 * 24/7 entry — glue: restore -> WS -> swap -> StrategyEngine -> OrderQueue
 *
 * Flow:
 * 1) Try restore snapshot + parquet tip. If missing, bootstrap 6k via REST (weight-aware).
 * 2) Start WS (frame-skip: only x==true mutates state).
 * 3) On each close: pingPong.write -> swap -> engine.onClose -> maybe order.
 * 4) Every SNAPSHOT_EVERY closes: snapshot + flush parquet + WAL prune.
 * 5) Every DRIFT_CHECK_EVERY closes: background brute-force drift guard.
 * 6) On WS gap: watermarks.onGap() + schedule REST reconcile after RECONCILE_DELAY_MS.
 */
export {};
//# sourceMappingURL=index.d.ts.map