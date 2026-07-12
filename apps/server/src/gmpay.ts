import crypto from "crypto";
import { config, hasGmPayConfig } from "./config";

export type GmPayCreatePayload = {
  pid: string;
  order_id: string;
  currency: string;
  amount: number;
  notify_url: string;
  redirect_url?: string;
  name?: string;
  token?: string;
  network?: string;
  signature?: string;
};

export type GmPayCreateData = {
  trade_id: string;
  order_id: string;
  amount: number;
  currency: string;
  actual_amount?: number;
  receive_address?: string;
  token?: string;
  network?: string;
  status: number;
  expiration_time?: number;
  payment_url?: string;
};

export type GmPayCallbackPayload = {
  pid?: string;
  trade_id?: string;
  order_id?: string;
  amount?: number;
  actual_amount?: number;
  receive_address?: string;
  token?: string;
  network?: string;
  block_transaction_id?: string;
  signature?: string;
  status?: number;
};

type GmPayCreateResponse = {
  status_code: number;
  message: string;
  data?: GmPayCreateData;
};

export function signGmPayPayload(payload: Record<string, unknown>, secretKey: string) {
  const pairs = Object.entries(payload)
    .filter(([key, value]) => key !== "signature" && value !== "" && value !== null && value !== undefined)
    .sort(([keyA], [keyB]) => (keyA < keyB ? -1 : keyA > keyB ? 1 : 0))
    .map(([key, value]) => `${key}=${String(value)}`);

  return crypto.createHash("md5").update(`${pairs.join("&")}${secretKey}`).digest("hex").toLowerCase();
}

export function verifyGmPaySignature(payload: GmPayCallbackPayload) {
  if (!payload.signature || payload.pid !== config.gmpay.pid) return false;
  const expected = signGmPayPayload(payload as Record<string, unknown>, config.gmpay.secretKey);
  const actual = payload.signature.toLowerCase();
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(actual);
  return expectedBuffer.length === actualBuffer.length && crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}

export async function createGmPayTransaction(input: Omit<GmPayCreatePayload, "pid" | "currency" | "notify_url" | "signature">) {
  if (!hasGmPayConfig()) {
    throw new Error("GM Pay is not configured yet. Add GMPAY_BASE_URL, GMPAY_PID, GMPAY_SECRET_KEY, and GMPAY_NOTIFY_URL.");
  }

  const payload: GmPayCreatePayload = {
    pid: config.gmpay.pid,
    currency: config.gmpay.currency,
    notify_url: config.gmpay.notifyUrl,
    ...input,
  };
  payload.signature = signGmPayPayload(payload, config.gmpay.secretKey);

  const response = await fetch(`${config.gmpay.baseUrl}/payments/gmpay/v1/order/create-transaction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const body = (await response.json().catch(() => null)) as GmPayCreateResponse | null;
  if (!response.ok || !body || body.status_code !== 200 || !body.data) {
    throw new Error(body?.message || `GM Pay request failed with ${response.status}`);
  }

  return body.data;
}
