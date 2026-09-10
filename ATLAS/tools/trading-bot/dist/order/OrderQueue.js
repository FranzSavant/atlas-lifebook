/**
 * OrderQueue — idempotent clientOrderId + LOT_SIZE validation stub.
 *
 * Idempotency: clientOrderId = hash(symbol + openTime + signal) so replay
 * after crash doesn't duplicate orders. Real Binance call is behind an
 * interface you can swap for paper trading.
 */
import { createHash } from "node:crypto";
import { BinanceWeightBucket } from "../binance/BinanceWeightBucket.js";
// Mock executor — logs and returns fake orderId
export class MockExecutor {
    async placeOrder(req) {
        console.log(`[MockOrder] ${req.side} ${req.quantity} ${req.symbol} cid=${req.clientOrderId}`);
        return { orderId: Math.floor(Math.random() * 1e9), status: "FILLED" };
    }
}
// Real executor stub — wire your signed REST call here
export class BinanceExecutor {
    baseUrl;
    apiKey;
    apiSecret;
    bucket;
    constructor(baseUrl, apiKey, apiSecret, bucket) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.bucket = bucket ?? new BinanceWeightBucket();
    }
    async placeOrder(req) {
        // Weight 1 for order placement; real impl needs HMAC SHA256 signature
        await this.bucket.consume(1);
        // TODO: implement signed POST /api/v3/order
        // For skeleton we delegate to mock
        console.log(`[BinanceOrder-STUB] would sign and POST ${req.clientOrderId}`);
        return { orderId: Date.now(), status: "NEW" };
    }
}
export function clientOrderId(symbol, openTime, signal) {
    const raw = `${symbol}-${String(openTime)}-${signal}`;
    return `atlas-${createHash("sha256").update(raw).digest("hex").slice(0, 16)}`;
}
export class OrderQueue {
    executor;
    seen = new Set();
    constructor(executor) {
        this.executor = executor;
    }
    async submit(req) {
        if (this.seen.has(req.clientOrderId)) {
            // console.debug(`[OrderQueue] deduped ${req.clientOrderId}`);
            return null;
        }
        this.seen.add(req.clientOrderId);
        // TODO: validate LOT_SIZE / PRICE_FILTER via exchangeInfo cache
        return this.executor.placeOrder(req);
    }
    /** Clear dedup set after snapshot restore if needed. */
    clearSeen() {
        this.seen.clear();
    }
}
//# sourceMappingURL=OrderQueue.js.map