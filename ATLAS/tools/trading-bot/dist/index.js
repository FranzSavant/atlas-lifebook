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
import { loadConfig, HOT_CAPACITY, SNAPSHOT_EVERY, DRIFT_CHECK_EVERY, RECONCILE_DELAY_MS } from "./config.js";
import { PingPongBuffer } from "./core/PingPongBuffer.js";
import { Watermarks } from "./core/Watermarks.js";
import { StrategyEngine } from "./strategy/StrategyEngine.js";
import { BinanceWeightBucket } from "./binance/BinanceWeightBucket.js";
import { BinanceRest } from "./binance/BinanceRest.js";
import { BinanceWs } from "./binance/BinanceWs.js";
import { SnapshotStore } from "./persistence/SnapshotStore.js";
import { WAL } from "./persistence/WAL.js";
import { ParquetColdStore } from "./persistence/ParquetColdStore.js";
import { OrderQueue, MockExecutor, clientOrderId } from "./order/OrderQueue.js";
import { SmaIncremental, EmaIncremental } from "./core/IncrementalState.js";
const cfg = loadConfig();
const bucket = new BinanceWeightBucket();
const rest = new BinanceRest(cfg.restBaseUrl, bucket);
const snapshotStore = new SnapshotStore("data/snapshots");
const wal = new WAL("data/wal.db");
const parquet = new ParquetColdStore("data/parquet", cfg.symbol, cfg.interval);
const watermarks = new Watermarks(5);
// Replace with your real indicators: keep the same constructor shape
const engine = new StrategyEngine({
    createIndicatorA: () => new SmaIncremental(5000),
    createIndicatorB: () => new EmaIncremental(5000),
}, watermarks);
const pingPong = new PingPongBuffer(HOT_CAPACITY);
const orderQueue = new OrderQueue(new MockExecutor()); // swap to BinanceExecutor(cfg.restBaseUrl, cfg.apiKey, cfg.apiSecret, bucket) for live
let closesSinceSnapshot = 0;
let closesSinceDriftCheck = 0;
let lastOpenTime = null;
async function bootstrap() {
    const snap = snapshotStore.loadLatest();
    if (snap) {
        console.log(`[Bootstrap] restoring snapshot ts=${snap.payload.timestamp} count=${snap.payload.count}`);
        // Restore watermarks + indicators
        engine.setState(snap.payload);
        // Restore ring head/count — need to repopulate SoA arrays from WAL+parquet
        // Simplified: replay from WAL after snapshot tip
        const tip = BigInt(snap.payload.newestOpenTime);
        const replay = wal.replay(tip);
        console.log(`[Bootstrap] WAL replay ${replay.length} candles after ${new Date(Number(tip)).toISOString()}`);
        for (const c of replay) {
            pingPong.writeToActive(c);
            lastOpenTime = c.openTime;
        }
        // Fetch delta from Binance for gap after WAL tip
        const parquetTip = parquet.getLastTimestamp();
        const from = lastOpenTime ?? parquetTip ?? null;
        if (from !== null) {
            console.log(`[Bootstrap] fetching delta from ${new Date(Number(from)).toISOString()}`);
            const delta = await rest.fetchDelta(cfg.symbol, cfg.interval, from);
            console.log(`[Bootstrap] delta ${delta.length} candles`);
            for (const c of delta) {
                pingPong.writeToActive(c);
                engine.onClose(c.close, pingPong.getActiveBank().count);
                wal.append(c);
                lastOpenTime = c.openTime;
            }
            if (delta.length > 0)
                await parquet.appendBatch(delta);
        }
        // Seed watermarks with current count
        watermarks.update(pingPong.getActiveBank().count);
        console.log(`[Bootstrap] restored, count=${pingPong.getActiveBank().count} state=${watermarks.getState()}`);
        return;
    }
    // Fresh bootstrap — fetch 6000 most recent
    console.log(`[Bootstrap] no snapshot, fetching 6000 recent klines (6 requests, ~60 weight)`);
    const recent = await rest.bootstrapRecent(cfg.symbol, cfg.interval, 6000);
    console.log(`[Bootstrap] fetched ${recent.length}`);
    for (const c of recent) {
        pingPong.writeToActive(c);
        lastOpenTime = c.openTime;
    }
    // Seed engine from linear snapshot
    const closes = new Float64Array(recent.length);
    for (let i = 0; i < recent.length; i++)
        closes[i] = recent[i].close;
    engine.seed(closes, recent.length);
    wal.appendBatch(recent);
    await parquet.appendBatch(recent);
    watermarks.update(pingPong.getActiveBank().count);
    console.log(`[Bootstrap] seeded, state=${watermarks.getState()} canEnter=${watermarks.canEnter()}`);
}
function onClosedCandle(candle) {
    pingPong.writeToActive(candle);
    wal.append(candle);
    lastOpenTime = candle.openTime;
    // Swap so evaluator sees consistent snapshot
    const snap = pingPong.swap();
    const signal = engine.onClose(candle.close, snap.count);
    if (signal !== "NONE") {
        const v = engine.getValues();
        console.log(`[Signal] ${signal} close=${candle.close} a=${v.a.toFixed(2)} b=${v.b.toFixed(2)} state=${v.state}`);
        const cid = clientOrderId(cfg.symbol, candle.openTime, signal);
        const side = signal === "LONG" ? "BUY" : "SELL";
        // quantity should come from risk manager — placeholder 0.001
        orderQueue.submit({ symbol: cfg.symbol, side, type: "MARKET", quantity: 0.001, clientOrderId: cid }).catch((e) => console.error("[Order]", e));
    }
    closesSinceSnapshot++;
    closesSinceDriftCheck++;
    if (closesSinceSnapshot >= SNAPSHOT_EVERY) {
        closesSinceSnapshot = 0;
        const st = engine.getState();
        const active = pingPong.getActiveBank();
        snapshotStore.save({
            newestOpenTime: String(candle.openTime),
            count: active.count,
            head: active.head,
            watermarks: st.watermarks,
            indicators: st.indicators,
        });
        // Flush last SNAPSHOT_EVERY from WAL to parquet
        const recent = wal.replay(lastOpenTime !== null ? lastOpenTime - BigInt(SNAPSHOT_EVERY * 5 * 60 * 1000) : 0n);
        if (recent.length > 0)
            parquet.appendBatch(recent).catch((e) => console.error("[Parquet]", e));
        console.log(`[Snapshot] saved count=${active.count} parquet=${parquet.count()}`);
    }
    if (closesSinceDriftCheck >= DRIFT_CHECK_EVERY) {
        closesSinceDriftCheck = 0;
        // Drift guard: compare incremental vs brute-force in background
        setImmediate(() => {
            const snapCloses = (() => {
                const n = Math.min(snap.count, 6000);
                const arr = snap.closes.subarray(snap.count - n, snap.count);
                return arr;
            })();
            // Example: check first indicator brute-force if it's SMA
            // Real: call each indicator's static bruteForce
            void snapCloses;
        });
    }
}
let reconcileTimer = null;
function scheduleReconcile() {
    if (reconcileTimer)
        clearTimeout(reconcileTimer);
    reconcileTimer = setTimeout(async () => {
        if (lastOpenTime === null)
            return;
        try {
            const delta = await rest.fetchDelta(cfg.symbol, cfg.interval, lastOpenTime);
            if (delta.length > 0) {
                console.log(`[Reconcile] gap fill ${delta.length} candles`);
                for (const c of delta)
                    onClosedCandle(c);
            }
            else {
                console.log(`[Reconcile] no gap`);
            }
        }
        catch (e) {
            console.error("[Reconcile] failed", e);
        }
    }, RECONCILE_DELAY_MS);
}
async function main() {
    console.log(`[AtlasBot] ${cfg.symbol} ${cfg.interval} testnet=${cfg.testnet} hot=${HOT_CAPACITY} warmup=${5000} live=${6000}`);
    await bootstrap();
    const ws = new BinanceWs(cfg.wsBaseUrl, cfg.symbol, cfg.interval, {
        onClose: onClosedCandle,
        onPreview: (price) => {
            // Optional: update UI preview without mutating committed EMA
            // console.debug(`[Preview] ${price}`);
            void price;
        },
        onGap: () => {
            console.warn("[WS] gap detected, hysteresis reset + reconcile scheduled");
            engine.onGap();
            scheduleReconcile();
        },
        onError: (e) => console.error("[WS]", e.message),
    });
    ws.start();
    // Graceful shutdown: snapshot on SIGINT
    process.on("SIGINT", () => {
        console.log("[Shutdown] SIGINT, saving snapshot...");
        if (lastOpenTime !== null) {
            const st = engine.getState();
            const active = pingPong.getActiveBank();
            snapshotStore.save({
                newestOpenTime: String(lastOpenTime),
                count: active.count,
                head: active.head,
                watermarks: st.watermarks,
                indicators: st.indicators,
            });
        }
        wal.close();
        ws.stop();
        process.exit(0);
    });
}
main().catch((e) => {
    console.error("[Fatal]", e);
    process.exit(1);
});
//# sourceMappingURL=index.js.map