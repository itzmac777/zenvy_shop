import { subscriptionPlans } from "./catalog";
import type { SubscriptionPlan } from "./types";

export type PaymentMethodId = "bkash" | "gmpay";
export type OrderStatus = "pending_payment" | "payment_submitted" | "paid" | "expired" | "manual_review" | "failed";

export type OrderSummary = {
  orderNumber: string;
  contact: string;
  planId: string;
  quantity: number;
  paymentMethod: PaymentMethodId;
  status: OrderStatus;
  amount: string;
  numericAmount: number;
  currency: string;
  productName: string;
  orderPlacedAt: string;
  paymentTime?: string;
  error?: string;
  gmpay?: {
    tradeId?: string;
    paymentUrl?: string;
    actualAmount?: string;
    receiveAddress?: string;
    token?: string;
    network?: string;
    expirationTime?: number;
    txHash?: string;
    expectedAmount?: string;
    submittedTxHash?: string;
    submittedTxStatus?: "pending" | "verified" | "failed";
    submittedTxError?: string;
    submittedAt?: string;
  };
};

export const paymentMethods: Array<{
  id: PaymentMethodId;
  title: string;
  label: string;
  description: string;
  speed: string;
}> = [
  {
    id: "bkash",
    title: "bKash",
    label: "bKash manual verification",
    description: "Send payment manually and wait for owner confirmation before delivery starts.",
    speed: "Manual verification",
  },
  {
    id: "gmpay",
    title: "GM Pay",
    label: "USDT / USDC crypto checkout",
    description: "Pay through the hosted GM Pay cashier for automatic on-chain detection.",
    speed: "Auto verification",
  },
];

export const demoOrderNumber = "631260712035420542";
export const demoOrderPlacedAt = "2026-07-12 03:54:20";

export function findPlan(planId?: string | null) {
  return subscriptionPlans.find((plan) => plan.id === planId) ?? subscriptionPlans[0];
}

export function getPaymentMethod(methodId?: string | null) {
  return paymentMethods.find((method) => method.id === methodId) ?? paymentMethods[1];
}

export function getOrderProductName(plan: SubscriptionPlan) {
  if (plan.id === "chatgpt-plus") return "GPT Plus Official Top Up 1 Month";
  return `${plan.name} Official Top Up 1 Month`;
}

export function getUnitAmount(plan: SubscriptionPlan) {
  const amount = Number(plan.price.replace(/[^0-9.]/g, ""));
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

export function formatOrderAmount(plan: SubscriptionPlan, quantity: number) {
  const amount = getUnitAmount(plan) * quantity;
  return amount > 0 ? `$${amount}` : plan.price;
}

export function normalizeQuantity(value?: string | string[] | null) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const quantity = Number(rawValue || 1);
  return Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 1;
}

export function formatOrderTime(date: Date) {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value || "";
  return `${value("year")}-${value("month")}-${value("day")} ${value("hour")}:${value("minute")}:${value("second")}`;
}
