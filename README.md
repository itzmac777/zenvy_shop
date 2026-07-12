# Zenvy Subscription Store

Zenvy is now split into a Docker Compose app:

- `apps/client`: Next.js, TypeScript, and Tailwind storefront.
- `apps/server`: Node.js, Express, TypeScript API for orders, GM Pay callbacks, and Postgres persistence.
- `packages/shared`: shared catalog, product/order types, and order helpers.
- `infra/`: Docker Compose, Caddy, and Dockerfiles.

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

Caddy is the public entrypoint from `infra/Caddyfile`:

- `/api/*` routes to the Express server on `server:4000`.
- Everything else routes to the Next.js client on `client:3000`.
- Caddy manages SSL automatically for `APP_DOMAIN` when DNS points to the host.

## Required Environment Variables

- `APP_DOMAIN`: public storefront domain, for example `zenvy.store`.
- `CADDY_EMAIL`: email for Caddy ACME/SSL notifications.
- `CLIENT_PUBLIC_URL`: public storefront origin, for example `https://zenvy.store`.
- `SERVER_INTERNAL_URL`: internal server URL for the Next.js server runtime, usually `http://server:4000` in Compose.
- `CORS_ORIGIN`: allowed browser origin for the Express API.
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `DATABASE_URL`: Postgres settings.
- `GMPAY_BASE_URL`: hosted GM Pay/Epusdt domain, for example `https://pay.zenvy.store`.
- `GMPAY_PID`: merchant PID from GM Pay admin API key records.
- `GMPAY_SECRET_KEY`: merchant signing key from GM Pay admin API key records.
- `GMPAY_CURRENCY`: fiat currency sent to GM Pay, usually `usd`.
- `GMPAY_NOTIFY_URL`: GM Pay callback URL, usually `https://zenvy.store/api/gmpay/notify`.
- `GMPAY_RETURN_URL`: customer return URL, usually `https://zenvy.store/order-inquiry`.
- `OPENAI_API_KEY`: only needed when regenerating image assets.

bKash payment capture is still manual. Crypto payments use GM Pay as an external hosted cashier: the Express server creates a pending order, redirects customers to GM Pay, and marks the order paid after a signed callback.

## GM Pay Setup Notes

GM Pay/Epusdt remains a separate service, usually at `pay.zenvy.store`. A typical setup needs:

- A Linux VPS.
- A payment subdomain pointed at that VPS.
- Docker and Docker Compose on the VPS.
- GM Pay deployed from the official Docker image and configured through its first-run wizard.
- Merchant API credentials from GM Pay admin: `pid` and `secret_key`.
- Receiver wallets configured inside GM Pay admin.
- Chain/RPC settings configured inside GM Pay admin. TRON commonly uses TronGrid; Solana uses an HTTP/HTTPS RPC; EVM chains such as Ethereum, BSC, and Polygon should use WSS endpoints per GM Pay's monitoring requirements.

Useful references:

- Epusdt overview: https://epusdt.com/
- Docker setup: https://epusdt.com/guide/installation/docker.html
- GMPay integration: https://epusdt.com/guide/integration/gmpay.html
- Payment API and callback format: https://epusdt.com/api/payment.html
- FAQ and chain setup notes: https://epusdt.com/guide/faq.html

## Image Generation Notes

Generated storefront assets live in `apps/client/public/images/subscriptions/` and product-card art lives in `apps/client/product-art/`.

Use `OPENAI_API_KEY` only when regenerating or adding image assets through the OpenAI Images API.
