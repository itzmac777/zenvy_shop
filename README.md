# Zenvy Subscription Store

Zenvy is now split into a Docker Compose app:

- `apps/client`: Next.js, TypeScript, and Tailwind storefront.
- `apps/server`: Node.js, Express, TypeScript API for orders, GM Pay callbacks, and Postgres persistence.
- `packages/shared`: shared catalog, product/order types, and order helpers.
- `infra/`: Docker Compose and Dockerfiles.

## Local Development

Install dependencies:

```bash
pnpm install
```

Build shared types first, then run the client and server in separate terminals:

```bash
pnpm --filter @zenvy/shared build
pnpm --filter @zenvy/server dev
pnpm --filter @zenvy/client dev
```

For local server development without Docker, set `DATABASE_URL` to a reachable Postgres database. In Docker Compose, Postgres is provided automatically.

## Docker Compose

Copy `.env.example` to `.env`, update secrets/domains, then run:

```bash
docker compose -f infra/docker-compose.yml up --build
```

On the current VPS, Mailu already owns public ports `80` and `443`, so Zenvy does not run its own Caddy service. The Compose stack publishes only localhost ports:

- Client: `127.0.0.1:3100 -> 3000`
- Server: `127.0.0.1:4100 -> 4000`

Route `shop.zenvy.com.bd` through the existing VPS proxy:

- `/api/*` -> `http://127.0.0.1:4100`
- everything else -> `http://127.0.0.1:3100`

Do not bind Zenvy to `80`, `443`, `4000`, or `8443` on this VPS.

## Cloudflare Without Tunnel

If Cloudflare Tunnel asks for billing details, use the optional Cloudflare origin-port setup instead. It keeps Mailu on public `80/443`, keeps the portal on `8443/4000`, and exposes only Zenvy's edge proxy on Cloudflare-supported HTTPS port `2053`.

This overlay uses Caddy with the Cloudflare DNS module. Caddy gets and renews public TLS certificates automatically through DNS-01, so it does not need to bind `80` or `443`.

In Cloudflare:

1. Keep `shop.zenvy.com.bd` as a proxied `A` record pointing to the VPS IP.
2. Create an Origin Rule for hostname `shop.zenvy.com.bd`.
3. Set Destination Port to `2053`.
4. Create a scoped Cloudflare API token with `Zone:Read` and `DNS:Edit` for the `zenvy.com.bd` zone.

On the VPS:

```bash
cd /root/zenvy_shop
cp .env.example .env
nano .env
docker compose -f infra/docker-compose.yml -f infra/docker-compose.cloudflare.yml up -d --build
```

Set these values in `.env` before starting the overlay:

```env
APP_DOMAIN=shop.zenvy.com.bd
ACME_EMAIL=admin@zenvy.com.bd
CLOUDFLARE_API_TOKEN=your_scoped_cloudflare_token
```

Verify:

```bash
sudo ss -tulpn | grep -E ':80|:443|:8443|:4000|:2053|:3100|:4100'
curl -k https://127.0.0.1:2053/api/health -H 'Host: shop.zenvy.com.bd'
curl https://shop.zenvy.com.bd/api/health
```

Expected port ownership:

- Mailu still owns public `80/443`.
- Existing portal still owns `8443/4000`.
- Zenvy edge owns public `2053`.
- Zenvy app containers stay on localhost `3100/4100`.

## Required Environment Variables

- `CLIENT_PUBLIC_URL`: public storefront origin, for example `https://shop.zenvy.com.bd`.
- `SERVER_INTERNAL_URL`: internal server URL for the Next.js server runtime, usually `http://server:4000` in Compose.
- `CORS_ORIGIN`: allowed browser origin for the Express API.
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `DATABASE_URL`: Postgres settings.
- `GMPAY_BASE_URL`: hosted GM Pay/Epusdt domain, for example `https://pay.zenvy.store`.
- `GMPAY_PID`: merchant PID from GM Pay admin API key records.
- `GMPAY_SECRET_KEY`: merchant signing key from GM Pay admin API key records.
- `GMPAY_CURRENCY`: fiat currency sent to GM Pay. Use `cny` for 4-decimal USDT cashier amounts like `1.0323 USDT`; use `bdt` only after configuring a BDT rate in GM Pay.
- `GMPAY_USD_TO_FIAT_RATE`: storefront USD-to-GM-Pay-fiat conversion rate, for example `6.99` when `GMPAY_CURRENCY=cny`.
- `GMPAY_FIAT_DUST_CENTS`: small fiat-cent uniqueness range added before GM Pay converts to USDT, for example `50`.
- `GMPAY_TOKEN`: optional GM Pay token lock for new crypto orders, for example `USDT`.
- `GMPAY_NETWORK`: optional GM Pay network lock for new crypto orders, for example `binance` for BSC.
- `GMPAY_RECEIVE_ADDRESS`: BSC USDT receiving address used by the fallback tx-hash verifier.
- `GMPAY_BSC_RPC_URLS`: comma-separated HTTP BSC RPC endpoints used by the fallback verifier and watcher. The server tries the next endpoint after a timeout or RPC error. The legacy singular `GMPAY_BSC_RPC_URL` remains supported.
- `GMPAY_BSC_RPC_TIMEOUT_MS`: timeout for each BSC RPC attempt, usually `10000`.
- `GMPAY_BSC_USDT_CONTRACT`: USDT BEP-20 contract used by the fallback verifier.
- `GMPAY_BSC_WATCHER_ENABLED`: set to `true` to let Zenvy auto-detect BSC USDT payments that GM Pay misses.
- `GMPAY_BSC_WATCHER_INTERVAL_MS`: watcher polling interval, usually `15000`.
- `GMPAY_BSC_WATCHER_CONFIRMATIONS`: BSC confirmations before Zenvy marks an order paid, usually `3`.
- `GMPAY_BSC_WATCHER_LOOKBACK_BLOCKS`: how far back each watcher scan checks, usually `1200`.
- `GMPAY_BSC_WATCHER_BLOCK_BATCH_SIZE`: maximum blocks requested per `eth_getLogs` call. Use `10` for compatibility with free public BlastAPI limits.
- `GMPAY_NOTIFY_URL`: GM Pay callback URL, usually `https://shop.zenvy.com.bd/api/gmpay/notify`.
- `GMPAY_RETURN_URL`: customer return URL, usually `https://shop.zenvy.com.bd/order-inquiry`.
- `OPENAI_API_KEY`: only needed when regenerating image assets.

bKash payment capture is still manual. Crypto payments use GM Pay as an external hosted cashier: the Express server creates a pending order, redirects customers to GM Pay, and marks the order paid after a signed callback. For crypto orders, Zenvy can keep storefront pricing in USD while sending GM Pay a fiat invoice such as CNY; GM Pay then returns the real 4-decimal `actual_amount` in USDT, which Zenvy stores for watcher and tx-hash verification. Zenvy also has an optional BSC USDT watcher that scans confirmed token transfers to the configured receiving wallet and marks exact-amount pending orders paid if GM Pay misses auto-detection.

## GM Pay Setup Notes

GM Pay/Epusdt remains a separate service, usually at `pay.zenvy.store`. A typical setup needs:

- A Linux VPS.
- A payment subdomain pointed at that VPS.
- Docker and Docker Compose on the VPS.
- GM Pay deployed from the official Docker image and configured through its first-run wizard.
- Merchant API credentials from GM Pay admin: `pid` and `secret_key`.
- Receiver wallets configured inside GM Pay admin.
- Chain/RPC settings configured inside GM Pay admin. TRON commonly uses TronGrid; Solana uses an HTTP/HTTPS RPC; EVM chains such as Ethereum, BSC, and Polygon should use WSS endpoints per GM Pay's monitoring requirements.

For a no-account BSC setup, `wss://bsc-rpc.publicnode.com` can be used as GM Pay's general WebSocket listener and `https://bsc-mainnet.public.blastapi.io` as its manual-verification HTTP node. Zenvy's fallback watcher can use BlastAPI first and PublicNode second through `GMPAY_BSC_RPC_URLS`. These public services have no uptime guarantee, so the independent watcher and transaction-hash fallback should remain enabled.

Useful references:

- Epusdt overview: https://epusdt.com/
- Docker setup: https://epusdt.com/guide/installation/docker.html
- GMPay integration: https://epusdt.com/guide/integration/gmpay.html
- Payment API and callback format: https://epusdt.com/api/payment.html
- FAQ and chain setup notes: https://epusdt.com/guide/faq.html

## Image Generation Notes

Generated storefront assets live in `apps/client/public/images/subscriptions/` and product-card art lives in `apps/client/product-art/`.

Use `OPENAI_API_KEY` only when regenerating or adding image assets through the OpenAI Images API.
