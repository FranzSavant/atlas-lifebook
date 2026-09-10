# Atlas Trading Bot — 15k hot + infinite cold, O(1) incremental

Hot rolling window `RingBufferSoA` (5x Float64Array, head/count, zero-copy purge) +
frame-skip (`kline.x==true` only) + `IncrementalState` O(1) + `Watermarks` 5000/6000/15000 +
double-buffer ping-pong + snapshot/WAL/parquet cold infinite. Binance weight-aware.

## Architecture

```
WS kline_5m (frame-skip) -> PingPongBuffer (15k SoA) -> swap -> StrategyEngine O(1) -> OrderQueue
        |                          |                           |-> SnapshotStore (atomic + SHA256) every 500
        |                          |-> WAL (SQLite)  -> ParquetColdStore (monthly JSONL.gz, parquet-ready)
        |-> BinanceWeightBucket (1200w/m, header-driven, 429/418 backoff) -> BinanceRest (delta only)
```

## Rate limits

`GET /api/v3/klines` weight: 1-100=>1, 101-500=>2, 501-1000=>10. Bootstrap 6000 = 6*10=60 weight (5%).
Infinite cold is NEVER re-fetched — only delta 1-500 (weight 1-2) after WAL tip.

## Quick start

```bash
npm install
npm run build
# live (paper by default — MockExecutor)
BINANCE_TESTNET=true SYMBOL=BTCUSDT npm run dev
# backtest (zero API calls, reads parquet)
npm run backtest
```

## Replace indicators

Edit `src/strategy/StrategyEngine.ts` and `src/index.ts`:

```ts
createIndicatorA: () => new YourIndicatorA(period),
createIndicatorB: () => new YourIndicatorB(period),
```

Extend `IncrementalState` — implement `seed/update/getValue/getState/setState`.

## Env

See `ATLAS/tools/trading-bot/.env.example` (copy to `.env`):

```
BINANCE_API_KEY=
BINANCE_API_SECRET=
SYMBOL=BTCUSDT
INTERVAL=5m
BINANCE_TESTNET=true
```

Never commit `.env`.

## Data

- `data/snapshots/` — last 3 snapshots, atomic write + fsync
- `data/wal.db` — SQLite WAL, pruned after parquet flush
- `data/parquet/<SYMBOL>/5m/YYYY-MM.jsonl.gz` — cold infinite, stream for backtest

Backtest and live share the same `StrategyEngine.onClose()` — no drift.
