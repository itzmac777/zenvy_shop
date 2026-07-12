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
      numeric_amount numeric(12, 2) not null,
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
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
  `);

  await pool.query("create index if not exists orders_contact_idx on orders (lower(contact), created_at desc);");
}
