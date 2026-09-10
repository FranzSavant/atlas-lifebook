/**
 * Central config — env + constants.
 * All watermarks are in candle count (M5).
 */
export declare const WARMUP_DRAW_CANDLES = 5000;
export declare const LIVE_CANDLES = 6000;
export declare const HOT_CAPACITY = 15000;
export declare const SNAPSHOT_EVERY = 500;
export declare const RECONCILE_DELAY_MS = 2000;
export declare const DRIFT_CHECK_EVERY = 60;
export declare const SNAPSHOT_KEEP_LAST = 3;
export declare const SCHEMA_VERSION = 1;
export declare const BINANCE_WEIGHT_LIMIT_PER_MIN = 1200;
export declare const BINANCE_WS_URL = "wss://stream.binance.com:9443/ws";
export declare const BINANCE_WS_TESTNET_URL = "wss://testnet.binance.vision/ws";
export declare const BINANCE_REST_URL = "https://api.binance.com";
export declare const BINANCE_REST_TESTNET_URL = "https://testnet.binance.vision";
export declare const INTERVAL: "5m";
export declare const INTERVAL_MS: number;
export interface AppConfig {
    apiKey: string;
    apiSecret: string;
    symbol: string;
    interval: typeof INTERVAL;
    testnet: boolean;
    restBaseUrl: string;
    wsBaseUrl: string;
}
/**
 * Load config from env. Throws if required vars missing when live trading.
 * Backtest can run without keys.
 */
export declare function loadConfig(): AppConfig;
/** Weight cost table for klines endpoint (Binance docs). */
export declare function klineWeight(limit: number): number;
//# sourceMappingURL=config.d.ts.map