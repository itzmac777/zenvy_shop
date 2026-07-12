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
  gmpay_expected_amount: string | null;
  gmpay_submitted_tx_hash: string | null;
  gmpay_submitted_tx_status: "pending" | "verified" | "failed" | null;
  gmpay_submitted_tx_error: string | null;
  gmpay_submitted_at: Date | null;
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
      expectedAmount: row.gmpay_expected_amount || undefined,
      submittedTxHash: row.gmpay_submitted_tx_hash || undefined,
      submittedTxStatus: row.gmpay_submitted_tx_status || undefined,
      submittedTxError: row.gmpay_submitted_tx_error || undefined,
      submittedAt: row.gmpay_submitted_at ? formatOrderTime(row.gmpay_submitted_at) : undefined,
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
        gmpay_network, gmpay_expiration_time, gmpay_tx_hash, gmpay_expected_amount,
        gmpay_submitted_tx_hash, gmpay_submitted_tx_status, gmpay_submitted_tx_error,
        gmpay_submitted_at
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
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
        gmpay_expected_amount = excluded.gmpay_expected_amount,
        gmpay_submitted_tx_hash = excluded.gmpay_submitted_tx_hash,
        gmpay_submitted_tx_status = excluded.gmpay_submitted_tx_status,
        gmpay_submitted_tx_error = excluded.gmpay_submitted_tx_error,
        gmpay_submitted_at = excluded.gmpay_submitted_at,
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
      order.gmpay?.expectedAmount || null,
      order.gmpay?.submittedTxHash || null,
      order.gmpay?.submittedTxStatus || null,
      order.gmpay?.submittedTxError || null,
      order.gmpay?.submittedAt ? new Date(order.gmpay.submittedAt) : null,
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

export async function findOrderByGmPayTxHash(txHash: string) {
  const result = await pool.query<OrderRow>(
    "select * from orders where lower(gmpay_tx_hash) = lower($1) limit 1",
    [txHash],
  );
  if (result.rows[0]) return rowToOrder(result.rows[0]);
  return null;
}

export async function findOrderBySubmittedGmPayTxHash(txHash: string) {
  const result = await pool.query<OrderRow>(
    "select * from orders where lower(gmpay_submitted_tx_hash) = lower($1) limit 1",
    [txHash],
  );
  if (result.rows[0]) return rowToOrder(result.rows[0]);
  return null;
}

export async function findPendingGmPayOrders(limit = 1000, expirationMinutes = 20) {
  const result = await pool.query<OrderRow>(
    `
      select *
      from orders
      where payment_method = 'gmpay'
        and status in ('pending_payment', 'payment_submitted')
        and gmpay_tx_hash is null
        and order_placed_at >= now() - ($2::text || ' minutes')::interval
      order by order_placed_at desc
      limit $1
    `,
    [limit, expirationMinutes],
  );

  return result.rows.map(rowToOrder);
}

export async function hasActiveGmPayAmountCollision(input: {
  expectedAmount?: string;
  receiveAddress?: string;
  token?: string;
  network?: string;
  excludeOrderNumber?: string;
  expirationMinutes: number;
}) {
  if (!input.expectedAmount || Number(input.expectedAmount) <= 0) return false;

  const result = await pool.query<{ exists: boolean }>(
    `
      select exists (
        select 1
        from orders
        where payment_method = 'gmpay'
          and status in ('pending_payment', 'payment_submitted')
          and gmpay_tx_hash is null
          and order_placed_at >= now() - ($6::text || ' minutes')::interval
          and coalesce(gmpay_expected_amount, gmpay_actual_amount, '') = $1
          and lower(coalesce(gmpay_receive_address, '')) = lower($2)
          and coalesce(gmpay_token, '') = $3
          and coalesce(gmpay_network, '') = $4
          and order_number <> $5
      ) as exists
    `,
    [
      input.expectedAmount,
      input.receiveAddress || "",
      input.token || "",
      input.network || "",
      input.excludeOrderNumber || "",
      input.expirationMinutes,
    ],
  );

  return Boolean(result.rows[0]?.exists);
}

export async function findPendingSubmittedGmPayOrders(limit = 1000, expirationMinutes = 20) {
  const result = await pool.query<OrderRow>(
    `
      select *
      from orders
      where payment_method = 'gmpay'
        and status = 'payment_submitted'
        and gmpay_tx_hash is null
        and gmpay_submitted_tx_hash is not null
        and coalesce(gmpay_submitted_tx_status, 'pending') = 'pending'
        and order_placed_at >= now() - ($2::text || ' minutes')::interval
      order by gmpay_submitted_at asc nulls first, order_placed_at asc
      limit $1
    `,
    [limit, expirationMinutes],
  );

  return result.rows.map(rowToOrder);
}

export async function submitGmPayTxHash(input: {
  orderNumber: string;
  txHash: string;
  error?: string;
}) {
  const result = await pool.query<OrderRow>(
    `
      update orders
      set status = 'payment_submitted',
          gmpay_submitted_tx_hash = $2,
          gmpay_submitted_tx_status = 'pending',
          gmpay_submitted_tx_error = $3,
          gmpay_submitted_at = now(),
          updated_at = now()
      where order_number = $1
        and payment_method = 'gmpay'
        and status in ('pending_payment', 'payment_submitted')
      returning *
    `,
    [input.orderNumber, input.txHash, input.error || null],
  );

  if (result.rows[0]) return rowToOrder(result.rows[0]);
  return findOrder({ orderNumber: input.orderNumber });
}

export async function markSubmittedTxFailed(input: { orderNumber: string; error: string }) {
  const result = await pool.query<OrderRow>(
    `
      update orders
      set gmpay_submitted_tx_status = 'failed',
          gmpay_submitted_tx_error = $2,
          updated_at = now()
      where order_number = $1
        and payment_method = 'gmpay'
        and status = 'payment_submitted'
      returning *
    `,
    [input.orderNumber, input.error],
  );

  if (result.rows[0]) return rowToOrder(result.rows[0]);
  return findOrder({ orderNumber: input.orderNumber });
}

export async function getWatcherCursor(input: { network: string; token: string; receiveAddress: string }) {
  const result = await pool.query<{ last_scanned_block: string }>(
    `
      select last_scanned_block
      from payment_watcher_cursors
      where network = $1 and token = $2 and lower(receive_address) = lower($3)
      limit 1
    `,
    [input.network, input.token, input.receiveAddress],
  );

  return result.rows[0]?.last_scanned_block ? Number(result.rows[0].last_scanned_block) : undefined;
}

export async function saveWatcherCursor(input: {
  network: string;
  token: string;
  receiveAddress: string;
  lastScannedBlock: number;
}) {
  await pool.query(
    `
      insert into payment_watcher_cursors (network, token, receive_address, last_scanned_block, updated_at)
      values ($1, $2, lower($3), $4, now())
      on conflict (network, token, receive_address) do update set
        last_scanned_block = greatest(payment_watcher_cursors.last_scanned_block, excluded.last_scanned_block),
        updated_at = now()
    `,
    [input.network, input.token, input.receiveAddress, input.lastScannedBlock],
  );
}

export async function recordPaymentEvent(input: {
  orderNumber?: string;
  eventType: string;
  message?: string;
  metadata?: Record<string, unknown>;
}) {
  await pool.query(
    `
      insert into payment_events (order_number, event_type, message, metadata)
      values ($1, $2, $3, $4::jsonb)
    `,
    [input.orderNumber || null, input.eventType, input.message || null, JSON.stringify(input.metadata || {})],
  );
}

export async function getPaymentHealthSummary() {
  const result = await pool.query<{
    pending_gmpay_orders: string;
    pending_submitted_hashes: string;
    last_scanned_block: string | null;
    watcher_errors_15m: string;
  }>(
    `
      select
        (select count(*) from orders where payment_method = 'gmpay' and status in ('pending_payment', 'payment_submitted') and gmpay_tx_hash is null) as pending_gmpay_orders,
        (select count(*) from orders where payment_method = 'gmpay' and status = 'payment_submitted' and gmpay_submitted_tx_hash is not null and coalesce(gmpay_submitted_tx_status, 'pending') = 'pending') as pending_submitted_hashes,
        (select max(last_scanned_block) from payment_watcher_cursors) as last_scanned_block,
        (select count(*) from payment_events where event_type in ('watcher_scan_failed', 'manual_verify_failed') and created_at >= now() - interval '15 minutes') as watcher_errors_15m
    `,
  );

  const row = result.rows[0];
  return {
    pendingGmPayOrders: Number(row?.pending_gmpay_orders || 0),
    pendingSubmittedHashes: Number(row?.pending_submitted_hashes || 0),
    lastScannedBscBlock: row?.last_scanned_block ? Number(row.last_scanned_block) : null,
    watcherErrors15m: Number(row?.watcher_errors_15m || 0),
  };
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
  const result = await pool.query<OrderRow>(
    `
      update orders
      set status = 'paid',
          payment_time = coalesce(payment_time, now()),
          gmpay_trade_id = coalesce($2, gmpay_trade_id),
          gmpay_actual_amount = coalesce($3, gmpay_actual_amount),
          gmpay_expected_amount = coalesce(gmpay_expected_amount, $3),
          gmpay_receive_address = coalesce($4, gmpay_receive_address),
          gmpay_token = coalesce($5, gmpay_token),
          gmpay_network = coalesce($6, gmpay_network),
          gmpay_tx_hash = coalesce($7, gmpay_tx_hash),
          gmpay_submitted_tx_status = case
            when $7 is not null and lower(coalesce(gmpay_submitted_tx_hash, '')) = lower($7) then 'verified'
            else gmpay_submitted_tx_status
          end,
          updated_at = now()
      where order_number = $1
        and status in ('pending_payment', 'payment_submitted')
      returning *
    `,
    [
      input.orderNumber,
      input.tradeId || null,
      input.actualAmount !== undefined ? String(input.actualAmount) : null,
      input.receiveAddress || null,
      input.token || null,
      input.network || null,
      input.txHash || null,
    ],
  );

  if (result.rows[0]) return rowToOrder(result.rows[0]);
  return findOrder({ orderNumber: input.orderNumber });
}
