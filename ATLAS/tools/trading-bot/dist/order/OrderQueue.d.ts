/**
 * OrderQueue — idempotent clientOrderId + LOT_SIZE validation stub.
 *
 * Idempotency: clientOrderId = hash(symbol + openTime + signal) so replay
 * after crash doesn't duplicate orders. Real Binance call is behind an
 * interface you can swap for paper trading.
 */
import { BinanceWeightBucket } from "../binance/BinanceWeightBucket.js";
export type OrderSide = "BUY" | "SELL";
export interface OrderRequest {
    symbol: string;
    side: OrderSide;
    type: "MARKET" | "LIMIT";
    quantity: number;
    price?: number;
    clientOrderId: string;
}
export interface OrderExecutor {
    placeOrder(req: OrderRequest): Promise<{
        orderId: number;
        status: string;
    }>;
}
export declare class MockExecutor implements OrderExecutor {
    placeOrder(req: OrderRequest): Promise<{
        orderId: number;
        status: string;
    }>;
}
export declare class BinanceExecutor implements OrderExecutor {
    private baseUrl;
    private apiKey;
    private apiSecret;
    private bucket;
    constructor(baseUrl: string, apiKey: string, apiSecret: string, bucket?: BinanceWeightBucket);
    placeOrder(req: OrderRequest): Promise<{
        orderId: number;
        status: string;
    }>;
}
export declare function clientOrderId(symbol: string, openTime: bigint, signal: string): string;
export declare class OrderQueue {
    private executor;
    private seen;
    constructor(executor: OrderExecutor);
    submit(req: OrderRequest): Promise<{
        orderId: number;
        status: string;
    } | null>;
    /** Clear dedup set after snapshot restore if needed. */
    clearSeen(): void;
}
//# sourceMappingURL=OrderQueue.d.ts.map