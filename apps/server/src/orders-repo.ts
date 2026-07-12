import type { OrderStatus, OrderSummary, PaymentMethodId } from "@zenvy/shared/orders";
import { formatOrderTime } from "@zenvy/shared/orders";
import { pool } from "./db";

type OrderRow = {
  order_number: string;
  contact: string;
  plan_id: string;
  quantity: number;
  payment_method: PaymentMethodId;
  status: OrderStatus;
  amount: string;
  numeric_amount: string;
  currency: string;
  product_name: string;
  order_placed_at: Date;
  payment_time: Date | null;
  error: string | null;
  gmpay_trade_id: string | null;
  gmpay_payment_url: string | null;
  gmpay_actual_amount: string | null;
  gmpay_receive_address: string | null;
  gmpay_token: string | null;
  gmpay_network: string | null;
  gmpay_expiration_time: string | null;
  gmpay_tx_hash: string | null;
};

export type OrderInput = Omit<OrderSummary, "orderPlacedAt" | "paymentTime"> & {
  orderPlacedAt: Date;
  paymentTime?: Date;
};

function rowToOrder(row: OrderRow): OrderSummary {
  return {
    orderNumber: row.order_number,
    contact: row.contact,
    planId: row.plan_id,
    quantity: row.quantity,
    paymentMethod: row.payment_method,
    status: row.status,
    amount: row.amount,
    numericAmount: Number(row.numeric_amount),
    currency: row.currency,
    productName: row.product_name,
    orderPlacedAt: formatOrderTime(row.order_placed_at),
    paymentTime: row.payment_time ? formatOrderTime(row.payment_time) : undefined,
    error: row.error || undefined,
    gmpay: {
      tradeId: row.gmpay_trade_id || undefined,
      paymentUrl: row.gmpay_payment_url || undefined,
      actualAmount: row.gmpay_actual_amount || undefined,
      receiveAddress: row.gmpay_receive_address || undefined,
      token: row.gmpay_token || undefined,
      network: row.gmpay_network || undefined,
      expirationTime: row.gmpay_expiration_time ? Number(row.gmpay_expiration_time) : undefined,
      txHash: row.gmpay_tx_hash || undefined,
    },
  };
}

export function createOrderNumber() {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${Date.now()}${random}`.slice(0, 32);
}

export async function saveOrder(order: OrderInput) {
  const result = await pool.query<OrderRow>(
    `
      insert into orders (
        order_number, contact, plan_id, quantity, payment_method, status, amount, numeric_amount,
        currency, product_name, order_placed_at, payment_time, error, gmpay_trade_id,
        gmpay_payment_url, gmpay_actual_amount, gmpay_receive_address, gmpay_token,
        gmpay_network, gmpay_expiration_time, gmpay_tx_hash
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      on conflict (order_number) do update set
        contact = excluded.contact,
        plan_id = excluded.plan_id,
        quantity = excluded.quantity,
        payment_method = excluded.payment_method,
        status = excluded.status,
        amount = excluded.amount,
        numeric_amount = excluded.numeric_amount,
        currency = excluded.currency,
        product_name = excluded.product_name,
        order_placed_at = excluded.order_placed_at,
        payment_time = excluded.payment_time,
        error = excluded.error,
        gmpay_trade_id = excluded.gmpay_trade_id,
        gmpay_payment_url = excluded.gmpay_payment_url,
        gmpay_actual_amount = excluded.gmpay_actual_amount,
        gmpay_receive_address = excluded.gmpay_receive_address,
        gmpay_token = excluded.gmpay_token,
        gmpay_network = excluded.gmpay_network,
        gmpay_expiration_time = excluded.gmpay_expiration_time,
        gmpay_tx_hash = excluded.gmpay_tx_hash,
        updated_at = now()
      returning *
    `,
    [
      order.orderNumber,
      order.contact,
      order.planId,
      order.quantity,
      order.paymentMethod,
      order.status,
      order.amount,
      order.numericAmount,
      order.currency,
      order.productName,
      order.orderPlacedAt,
      order.paymentTime || null,
      order.error || null,
      order.gmpay?.tradeId || null,
      order.gmpay?.paymentUrl || null,
      order.gmpay?.actualAmount || null,
      order.gmpay?.receiveAddress || null,
      order.gmpay?.token || null,
      order.gmpay?.network || null,
      order.gmpay?.expirationTime || null,
      order.gmpay?.txHash || null,
    ],
  );

  return rowToOrder(result.rows[0]);
}

export async function findOrder({ orderNumber, contact }: { orderNumber?: string; contact?: string }) {
  if (orderNumber) {
    const result = await pool.query<OrderRow>("select * from orders where order_number = $1 limit 1", [orderNumber]);
    if (result.rows[0]) return rowToOrder(result.rows[0]);
  }

  if (contact) {
    const result = await pool.query<OrderRow>("select * from orders where lower(contact) = lower($1) order by created_at desc limit 1", [contact]);
    if (result.rows[0]) return rowToOrder(result.rows[0]);
  }

  return null;
}

export async function markGmPayOrderPaid(input: {
  orderNumber: string;
  tradeId?: string;
  actualAmount?: number;
  receiveAddress?: string;
  token?: string;
  network?: string;
  txHash?: string;
}) {
  const existing = await findOrder({ orderNumber: input.orderNumber });
  if (!existing) return null;

  return saveOrder({
    ...existing,
    orderPlacedAt: new Date(existing.orderPlacedAt),
    paymentTime: new Date(),
    status: "paid",
    gmpay: {
      ...existing.gmpay,
      tradeId: input.tradeId || existing.gmpay?.tradeId,
      actualAmount: input.actualAmount !== undefined ? String(input.actualAmount) : existing.gmpay?.actualAmount,
      receiveAddress: input.receiveAddress || existing.gmpay?.receiveAddress,
      token: input.token || existing.gmpay?.token,
      network: input.network || existing.gmpay?.network,
      txHash: input.txHash || existing.gmpay?.txHash,
    },
  });
}
