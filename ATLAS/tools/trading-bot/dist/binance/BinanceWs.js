/**
 * BinanceWs — single kline stream with frame-skip.
 *
 * Subscribes to `<symbol>@kline_5m`. Only `k.x==true` (closed candle) mutates
 * indicator state. Intra-candle ticks optionally call `onPreview` without
 * mutating committed state.
 *
 * Auto-reconnect with exponential backoff; exposes `onGap` for Watermarks.
 */
import WebSocket from "ws";
export class BinanceWs {
    ws = null;
    url;
    symbol;
    interval;
    cbs;
    shouldRun = false;
    reconnectAttempt = 0;
    pingTimer = null;
    constructor(wsBaseUrl, symbol, interval, cbs) {
        this.symbol = symbol.toLowerCase();
        this.interval = interval;
        this.cbs = cbs;
        // Binance combined stream format: wss://stream.binance.com:9443/ws/btcusdt@kline_5m
        const base = wsBaseUrl.replace(/\/$/, "");
        this.url = `${base}/${this.symbol}@kline_${this.interval}`;
    }
    start() {
        this.shouldRun = true;
        this.reconnectAttempt = 0;
        this.connect();
    }
    stop() {
        this.shouldRun = false;
        if (this.pingTimer)
            clearInterval(this.pingTimer);
        this.pingTimer = null;
        if (this.ws) {
            try {
                this.ws.close();
            }
            catch { }
            this.ws = null;
        }
    }
    connect() {
        if (!this.shouldRun)
            return;
        // console.log(`[WS] connecting ${this.url} attempt=${this.reconnectAttempt}`);
        this.ws = new WebSocket(this.url);
        this.ws.on("open", () => {
            this.reconnectAttempt = 0;
            // Binance expects pong; we send ping every 30s
            this.pingTimer = setInterval(() => {
                try {
                    this.ws?.ping();
                }
                catch { }
            }, 30_000);
        });
        this.ws.on("message", (data) => {
            try {
                const msg = JSON.parse(String(data));
                const k = msg.k;
                if (!k)
                    return;
                if (k.x) {
                    const candle = {
                        openTime: BigInt(k.t),
                        open: parseFloat(k.o),
                        high: parseFloat(k.h),
                        low: parseFloat(k.l),
                        close: parseFloat(k.c),
                        volume: parseFloat(k.v),
                    };
                    this.cbs.onClose(candle);
                }
                else {
                    // preview: last price inside open candle, no state mutation
                    if (this.cbs.onPreview) {
                        const price = parseFloat(k.c);
                        if (Number.isFinite(price))
                            this.cbs.onPreview(price);
                    }
                }
            }
            catch (e) {
                this.cbs.onError?.(e);
            }
        });
        this.ws.on("close", () => this.handleDisconnect());
        this.ws.on("error", (e) => {
            this.cbs.onError?.(e);
            // ws will also emit close
        });
    }
    handleDisconnect() {
        if (this.pingTimer) {
            clearInterval(this.pingTimer);
            this.pingTimer = null;
        }
        if (!this.shouldRun)
            return;
        this.cbs.onGap?.();
        const delay = Math.min(30_000, 1000 * Math.pow(2, this.reconnectAttempt) + Math.random() * 500);
        this.reconnectAttempt++;
        // console.warn(`[WS] disconnected, reconnect in ${delay.toFixed(0)}ms`);
        setTimeout(() => this.connect(), delay);
    }
}
//# sourceMappingURL=BinanceWs.js.map