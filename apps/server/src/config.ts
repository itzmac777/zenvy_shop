import "dotenv/config";

export const config = {
  port: Number(process.env.PORT || 4000),
  databaseUrl: process.env.DATABASE_URL || "postgres://zenvy:zenvy_password@localhost:5432/zenvy",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  clientPublicUrl: (process.env.CLIENT_PUBLIC_URL || "http://localhost:3000").replace(/\/+$/, ""),
  gmpay: {
    baseUrl: (process.env.GMPAY_BASE_URL || "").replace(/\/+$/, ""),
    pid: process.env.GMPAY_PID || "",
    secretKey: process.env.GMPAY_SECRET_KEY || "",
    currency: (process.env.GMPAY_CURRENCY || "usd").toLowerCase(),
    notifyUrl: process.env.GMPAY_NOTIFY_URL || "",
    returnUrl: process.env.GMPAY_RETURN_URL || "",
    token: process.env.GMPAY_TOKEN || "",
    network: process.env.GMPAY_NETWORK || "",
  },
};

export function hasGmPayConfig() {
  return Boolean(config.gmpay.baseUrl && config.gmpay.pid && config.gmpay.secretKey && config.gmpay.notifyUrl);
}
