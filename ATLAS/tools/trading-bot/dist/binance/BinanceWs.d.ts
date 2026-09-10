/**
 * BinanceWs — single kline stream with frame-skip.
 *
 * Subscribes to `<symbol>@kline_5m`. Only `k.x==true` (closed candle) mutates
 * indicator state. Intra-candle ticks optionally call `onPreview` without
 * mutating committed state.
 *
 * Auto-reconnect with exponential backoff; exposes `onGap` for Watermarks.
 */
import type { Ohlcv } from "../core/RingBufferSoA.js";
export interface WsCallbacks {
    onClose: (candle: Ohlcv) => void;
    onPreview?: (price: number) => void;
    onGap?: () => void;
    onError?: (e: Error) => void;
}
export declare class BinanceWs {
    private ws;
    private url;
    private symbol;
    private interval;
    private cbs;
    private shouldRun;
    private reconnectAttempt;
    private pingTimer;
    constructor(wsBaseUrl: string, symbol: string, interval: string, cbs: WsCallbacks);
    start(): void;
    stop(): void;
    private connect;
    private handleDisconnect;
}
//# sourceMappingURL=BinanceWs.d.ts.map