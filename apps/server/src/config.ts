import "dotenv/config";

const gmPayCurrency = (process.env.GMPAY_CURRENCY || "usd").toLowerCase();
const defaultBscRpcUrls = [
  "https://bsc-mainnet.public.blastapi.io",
  "https://bsc-rpc.publicnode.com",
  "https://bsc-dataseed.bnbchain.org",
  "https://bsc-dataseed-public.bnbchain.org",
];
const bscRpcUrls = (process.env.GMPAY_BSC_RPC_URLS || process.env.GMPAY_BSC_RPC_URL || defaultBscRpcUrls.join(","))
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

export const config = {
  port: Number(process.env.PORT || 4000),
  databaseUrl: process.env.DATABASE_URL || "postgres://zenvy:zenvy_password@localhost:5432/zenvy",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  clientPublicUrl: (process.env.CLIENT_PUBLIC_URL || "http://localhost:3000").replace(/\/+$/, ""),
  gmpay: {
    baseUrl: (process.env.GMPAY_BASE_URL || "").replace(/\/+$/, ""),
    pid: process.env.GMPAY_PID || "",
    secretKey: process.env.GMPAY_SECRET_KEY || "",
    currency: gmPayCurrency,
    usdToFiatRate: Number(process.env.GMPAY_USD_TO_FIAT_RATE || (gmPayCurrency === "cny" ? 6.99 : 1)),
    fiatDustCents: Number(process.env.GMPAY_FIAT_DUST_CENTS || 50),
    notifyUrl: process.env.GMPAY_NOTIFY_URL || "",
    returnUrl: process.env.GMPAY_RETURN_URL || "",
    token: process.env.GMPAY_TOKEN || "",
    network: process.env.GMPAY_NETWORK || "",
    receiveAddress: process.env.GMPAY_RECEIVE_ADDRESS || "",
    bscRpcUrls,
    bscRpcTimeoutMs: Number(process.env.GMPAY_BSC_RPC_TIMEOUT_MS || 10000),
    bscUsdtContract: process.env.GMPAY_BSC_USDT_CONTRACT || "0x55d398326f99059fF775485246999027B3197955",
    bscWatcherEnabled: process.env.GMPAY_BSC_WATCHER_ENABLED !== "false",
    bscWatcherIntervalMs: Number(process.env.GMPAY_BSC_WATCHER_INTERVAL_MS || 10000),
    bscWatcherConfirmations: Number(process.env.GMPAY_BSC_WATCHER_CONFIRMATIONS || 3),
    bscWatcherLookbackBlocks: Number(process.env.GMPAY_BSC_WATCHER_LOOKBACK_BLOCKS || 1200),
    bscWatcherBlockBatchSize: Number(process.env.GMPAY_BSC_WATCHER_BLOCK_BATCH_SIZE || 10),
    bscWatcherReorgBlocks: Number(process.env.GMPAY_BSC_WATCHER_REORG_BLOCKS || 30),
    orderExpirationMinutes: Number(process.env.GMPAY_ORDER_EXPIRATION_MINUTES || 20),
    submittedTxPollIntervalMs: Number(process.env.GMPAY_SUBMITTED_TX_POLL_INTERVAL_MS || 15000),
  },
};

export function hasGmPayConfig() {
  return Boolean(config.gmpay.baseUrl && config.gmpay.pid && config.gmpay.secretKey && config.gmpay.notifyUrl);
}
