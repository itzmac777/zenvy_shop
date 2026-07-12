import pg from "pg";
import { config } from "./config";

export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
});

export async function migrate() {
  await pool.query(`
    create table if not exists orders (
      order_number text primary key,
      contact text not null,
      plan_id text not null,
      quantity integer not null,
      payment_method text not null,
      status text not null,
      amount text not null,
      numeric_amount numeric(12, 4) not null,
      currency text not null,
      product_name text not null,
      order_placed_at timestamptz not null,
      payment_time timestamptz,
      error text,
      gmpay_trade_id text,
      gmpay_payment_url text,
      gmpay_actual_amount text,
      gmpay_receive_address text,
      gmpay_token text,
      gmpay_network text,
      gmpay_expiration_time bigint,
      gmpay_tx_hash text,
      gmpay_expected_amount text,
      gmpay_submitted_tx_hash text,
      gmpay_submitted_tx_status text,
      gmpay_submitted_tx_error text,
      gmpay_submitted_at timestamptz,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
  `);

  await pool.query("alter table orders alter column numeric_amount type numeric(12, 4);");
  await pool.query("alter table orders add column if not exists gmpay_expected_amount text;");
  await pool.query("alter table orders add column if not exists gmpay_submitted_tx_hash text;");
  await pool.query("alter table orders add column if not exists gmpay_submitted_tx_status text;");
  await pool.query("alter table orders add column if not exists gmpay_submitted_tx_error text;");
  await pool.query("alter table orders add column if not exists gmpay_submitted_at timestamptz;");
  await pool.query("create index if not exists orders_contact_idx on orders (lower(contact), created_at desc);");
  await pool.query("create index if not exists orders_gmpay_pending_idx on orders (payment_method, status, order_placed_at desc);");
  await pool.query("create index if not exists orders_gmpay_trade_idx on orders (gmpay_trade_id);");
  await pool.query("create index if not exists orders_gmpay_expected_idx on orders (status, gmpay_network, gmpay_token, lower(gmpay_receive_address), gmpay_expected_amount);");
  await pool.query("create index if not exists orders_gmpay_submitted_tx_hash_idx on orders (lower(gmpay_submitted_tx_hash));");
  await pool.query("create unique index if not exists orders_gmpay_tx_hash_unique_idx on orders (lower(gmpay_tx_hash)) where gmpay_tx_hash is not null;");

  await pool.query(`
    create table if not exists payment_watcher_cursors (
      network text not null,
      token text not null,
      receive_address text not null,
      last_scanned_block bigint not null default 0,
      updated_at timestamptz not null default now(),
      primary key (network, token, receive_address)
    );
  `);

  await pool.query(`
    create table if not exists payment_events (
      id bigserial primary key,
      order_number text,
      event_type text not null,
      message text,
      metadata jsonb not null default '{}'::jsonb,
      created_at timestamptz not null default now()
    );
  `);

  await pool.query("create index if not exists payment_events_order_idx on payment_events (order_number, created_at desc);");
}
