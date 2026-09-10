/**
 * Central config — env + constants.
 * All watermarks are in candle count (M5).
 */
// --- Watermarks (agreed design) ---
export const WARMUP_DRAW_CANDLES = 5000; // enough to draw indicators
export const LIVE_CANDLES = 6000; // enable entries
export const HOT_CAPACITY = 15000; // rolling hot window, RingBufferSoA capacity
// --- Checkpoint / housekeeping ---
export const SNAPSHOT_EVERY = 500; // candles between snapshots
export const RECONCILE_DELAY_MS = 2000; // delay before REST reconcile after WS drop
export const DRIFT_CHECK_EVERY = 60; // run brute-force drift guard every N closes (background)
export const SNAPSHOT_KEEP_LAST = 3;
export const SCHEMA_VERSION = 1;
// --- Binance ---
export const BINANCE_WEIGHT_LIMIT_PER_MIN = 1200;
export const BINANCE_WS_URL = "wss://stream.binance.com:9443/ws";
export const BINANCE_WS_TESTNET_URL = "wss://testnet.binance.vision/ws";
export const BINANCE_REST_URL = "https://api.binance.com";
export const BINANCE_REST_TESTNET_URL = "https://testnet.binance.vision";
// Interval is fixed to 5m by design (watermarks assume M5)
export const INTERVAL = "5m";
export const INTERVAL_MS = 5 * 60 * 1000;
/**
 * Load config from env. Throws if required vars missing when live trading.
 * Backtest can run without keys.
 */
export function loadConfig() {
    const apiKey = process.env["BINANCE_API_KEY"] ?? "";
    const apiSecret = process.env["BINANCE_API_SECRET"] ?? "";
    const symbol = process.env["SYMBOL"] ?? "BTCUSDT";
    const interval = (process.env["INTERVAL"] ?? INTERVAL);
    const testnet = (process.env["BINANCE_TESTNET"] ?? "false").toLowerCase() === "true";
    if (interval !== "5m") {
        throw new Error(`Unsupported INTERVAL=${interval}. This skeleton is calibrated for 5m only (watermarks 5000/6000/15000).`);
    }
    return {
        apiKey,
        apiSecret,
        symbol: symbol.toUpperCase(),
        interval,
        testnet,
        restBaseUrl: testnet ? BINANCE_REST_TESTNET_URL : BINANCE_REST_URL,
        wsBaseUrl: testnet ? BINANCE_WS_TESTNET_URL : BINANCE_WS_URL,
    };
}
/** Weight cost table for klines endpoint (Binance docs). */
export function klineWeight(limit) {
    if (limit <= 100)
        return 1;
    if (limit <= 500)
        return 2;
    if (limit <= 1000)
        return 10;
    throw new Error(`klines limit must be 1-1000, got ${limit}`);
}
//# sourceMappingURL=config.js.map