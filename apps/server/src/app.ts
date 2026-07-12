import cors from "cors";
import express from "express";
import { findPlan, formatOrderAmount, getOrderProductName, getUnitAmount, normalizeQuantity } from "@zenvy/shared/orders";
import { getBscRpcStatus } from "./bsc-verifier";
import { config } from "./config";
import { createGmPayTransaction, type GmPayCallbackPayload, verifyGmPaySignature } from "./gmpay";
import {
  createOrderNumber,
  findOrder,
  findOrderByGmPayTxHash,
  findOrderBySubmittedGmPayTxHash,
  getPaymentHealthSummary,
  hasActiveGmPayAmountCollision,
  markGmPayOrderPaid,
  recordPaymentEvent,
  saveOrder,
  submitGmPayTxHash,
  type OrderInput,
} from "./orders-repo";

function field(body: Record<string, unknown>, name: string) {
  const value = body[name];
  return typeof value === "string" ? value.trim() : "";
}

function inquiryUrl(orderNumber: string, contact: string) {
  const url = new URL("/order-inquiry", config.clientPublicUrl);
  url.searchParams.set("order", orderNumber);
  if (contact) url.searchParams.set("contact", contact);
  return url.toString();
}

function wantsJson(req: express.Request) {
  return req.accepts(["html", "json"]) === "json" || req.headers["content-type"]?.includes("application/json");
}

function sendOrderResponse(req: express.Request, res: express.Response, order: Awaited<ReturnType<typeof saveOrder>>, redirectTo?: string) {
  if (wantsJson(req)) return res.status(201).json({ order, redirectTo });
  return res.redirect(303, redirectTo || inquiryUrl(order.orderNumber, order.contact));
}

function getGmPayFiatAmount(usdAmount: number, orderNumber: string, attempt: number, precision: 2 | 4) {
  const suffix = Number(orderNumber.slice(-4));
  const dustCents = Math.max(0, Math.min(99, config.gmpay.fiatDustCents));
  const dustUnits = precision === 4 ? dustCents * 100 : dustCents;
  const offset = dustUnits > 0 ? (((Number.isFinite(suffix) ? suffix : 0) + attempt * 997) % dustUnits) + 1 : 0;
  const divisor = precision === 4 ? 10000 : 100;
  return Number((usdAmount * config.gmpay.usdToFiatRate + offset / divisor).toFixed(precision));
}

function getExpectedCryptoAmount(transaction: { actual_amount?: number }) {
  return transaction.actual_amount !== undefined && Number(transaction.actual_amount) > 0 ? String(transaction.actual_amount) : undefined;
}

export function createApp() {
  const app = express();

  app.use(cors({ origin: config.corsOrigin, credentials: false }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.get("/api/payments/health", async (_req, res, next) => {
    try {
      const summary = await getPaymentHealthSummary();
      res.json({
        ok: true,
        ...summary,
        bscRpc: getBscRpcStatus(),
        watcher: {
          enabled: config.gmpay.bscWatcherEnabled,
          intervalMs: config.gmpay.bscWatcherIntervalMs,
          confirmations: config.gmpay.bscWatcherConfirmations,
          reorgBlocks: config.gmpay.bscWatcherReorgBlocks,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/orders", async (req, res, next) => {
    try {
      const plan = findPlan(field(req.body, "plan"));
      const quantity = normalizeQuantity(field(req.body, "quantity"));
      const contact = field(req.body, "contact");
      const paymentMethod = field(req.body, "method") === "bkash" ? "bkash" : "gmpay";
      const numericAmount = getUnitAmount(plan) * quantity;
      const now = new Date();
      const baseOrder = (orderNumber: string): OrderInput => ({
        orderNumber,
        contact,
        planId: plan.id,
        quantity,
        paymentMethod,
        status: "pending_payment",
        amount: formatOrderAmount(plan, quantity),
        numericAmount,
        currency: config.gmpay.currency,
        productName: getOrderProductName(plan),
        orderPlacedAt: now,
      });

      if (paymentMethod === "bkash") {
        const order = await saveOrder({ ...baseOrder(createOrderNumber()), status: "manual_review" });
        return sendOrderResponse(req, res, order);
      }

      if (numericAmount <= 0) {
        const order = await saveOrder({
          ...baseOrder(createOrderNumber()),
          status: "manual_review",
          error: "This product needs a finalized price before GM Pay checkout can start.",
        });
        return sendOrderResponse(req, res, order);
      }

      const maxCreateAttempts = 8;

      try {
        for (let attempt = 0; attempt < maxCreateAttempts; attempt += 1) {
          const orderNumber = createOrderNumber();
          const orderDraft = baseOrder(orderNumber);
          const returnUrl = new URL(config.gmpay.returnUrl || inquiryUrl(orderNumber, contact));
          returnUrl.searchParams.set("order", orderNumber);
          if (contact) returnUrl.searchParams.set("contact", contact);

          let transaction;
          try {
            transaction = await createGmPayTransaction({
              order_id: orderNumber,
              amount: getGmPayFiatAmount(numericAmount, orderNumber, attempt, 4),
              name: orderDraft.productName,
              redirect_url: returnUrl.toString(),
              token: config.gmpay.token || undefined,
              network: config.gmpay.network || undefined,
            });
          } catch (error) {
            transaction = await createGmPayTransaction({
              order_id: orderNumber,
              amount: getGmPayFiatAmount(numericAmount, orderNumber, attempt, 2),
              name: orderDraft.productName,
              redirect_url: returnUrl.toString(),
              token: config.gmpay.token || undefined,
              network: config.gmpay.network || undefined,
            });
          }

          const expectedAmount = getExpectedCryptoAmount(transaction);
          const receiveAddress = transaction.receive_address || config.gmpay.receiveAddress;
          const token = transaction.token || config.gmpay.token || "USDT";
          const network = transaction.network || config.gmpay.network || "binance";
          const hasCollision = await hasActiveGmPayAmountCollision({
            expectedAmount,
            receiveAddress,
            token,
            network,
            excludeOrderNumber: orderNumber,
            expirationMinutes: config.gmpay.orderExpirationMinutes,
          });

          if (hasCollision) {
            await recordPaymentEvent({
              orderNumber,
              eventType: "gmpay_amount_collision",
              message: "GM Pay returned an already-active payable amount; retrying with a new order.",
              metadata: { expectedAmount, receiveAddress, token, network, tradeId: transaction.trade_id },
            });
            continue;
          }

          const order = await saveOrder({
            ...orderDraft,
            status: transaction.status === 3 ? "expired" : "pending_payment",
            currency: String(transaction.currency || orderDraft.currency).toLowerCase(),
            amount: orderDraft.amount,
            numericAmount,
            gmpay: {
              tradeId: transaction.trade_id,
              paymentUrl: transaction.payment_url,
              actualAmount: expectedAmount,
              expectedAmount,
              receiveAddress: transaction.receive_address,
              token: transaction.token,
              network: transaction.network,
              expirationTime: transaction.expiration_time,
            },
          });

          await recordPaymentEvent({
            orderNumber: order.orderNumber,
            eventType: "gmpay_order_created",
            metadata: { expectedAmount, receiveAddress, token, network, tradeId: transaction.trade_id },
          });

          return sendOrderResponse(req, res, order, transaction.payment_url || inquiryUrl(order.orderNumber, order.contact));
        }

        throw new Error("Could not reserve a unique GM Pay payment amount. Please try again in a moment.");
      } catch (error) {
        const orderNumber = createOrderNumber();
        const order = await saveOrder({
          ...baseOrder(orderNumber),
          status: "failed",
          error: error instanceof Error ? error.message : "GM Pay checkout could not be created.",
        });
        await recordPaymentEvent({
          orderNumber,
          eventType: "gmpay_create_failed",
          message: error instanceof Error ? error.message : "GM Pay checkout could not be created.",
        });
        return sendOrderResponse(req, res, order);
      }
    } catch (error) {
      return next(error);
    }
  });

  app.get("/api/orders/lookup", async (req, res, next) => {
    try {
      const orderNumber = typeof req.query.order === "string" ? req.query.order.trim() : "";
      const contact = typeof req.query.contact === "string" ? req.query.contact.trim() : "";
      const order = await findOrder({ orderNumber, contact });
      if (!order) return res.status(404).json({ order: null });
      return res.json({ order });
    } catch (error) {
      return next(error);
    }
  });

  app.post("/api/gmpay/notify", async (req, res) => {
    const payload = req.body as GmPayCallbackPayload;
    if (!verifyGmPaySignature(payload)) return res.status(401).type("text/plain").send("fail");

    await recordPaymentEvent({
      orderNumber: payload.order_id,
      eventType: "gmpay_callback_received",
      metadata: { status: payload.status, tradeId: payload.trade_id, txHash: payload.block_transaction_id },
    });

    if (payload.status === 2 && payload.order_id) {
      await markGmPayOrderPaid({
        orderNumber: payload.order_id,
        tradeId: payload.trade_id,
        actualAmount: payload.actual_amount,
        receiveAddress: payload.receive_address,
        token: payload.token,
        network: payload.network,
        txHash: payload.block_transaction_id,
      });
    }

    return res.status(200).type("text/plain").send("ok");
  });

  app.post("/api/orders/verify-bsc-tx", async (req, res, next) => {
    try {
      const orderNumber = field(req.body, "order");
      const contact = field(req.body, "contact");
      const txHash = field(req.body, "txHash");
      const order = await findOrder({ orderNumber });

      if (!order) return res.status(404).json({ error: "Order not found." });
      if (!/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
        return res.status(400).json({ error: "Enter the full BSC transaction hash." });
      }
      if (order.contact && contact && order.contact.toLowerCase() !== contact.toLowerCase()) {
        return res.status(403).json({ error: "Contact information does not match this order." });
      }
      if (order.paymentMethod !== "gmpay") return res.status(400).json({ error: "This order is not a GM Pay order." });
      if (order.status === "paid") return res.json({ order });

      const existingTxOrder = await findOrderByGmPayTxHash(txHash);
      if (existingTxOrder && existingTxOrder.orderNumber !== order.orderNumber) {
        return res.status(409).json({ error: "This transaction hash has already been used for another order." });
      }
      const existingSubmittedTxOrder = await findOrderBySubmittedGmPayTxHash(txHash);
      if (existingSubmittedTxOrder && existingSubmittedTxOrder.orderNumber !== order.orderNumber) {
        return res.status(409).json({ error: "This transaction hash has already been submitted for another order." });
      }

      const receiveAddress = order.gmpay?.receiveAddress || config.gmpay.receiveAddress;
      if (!receiveAddress) {
        return res.status(500).json({ error: "BSC receiving address is not configured." });
      }

      const submittedOrder = await submitGmPayTxHash({
        orderNumber: order.orderNumber,
        txHash,
      });

      await recordPaymentEvent({
        orderNumber: order.orderNumber,
        eventType: "manual_tx_submitted",
        metadata: { txHash },
      });

      if (!wantsJson(req)) {
        return res.redirect(303, inquiryUrl(order.orderNumber, order.contact));
      }
      return res.json({ order: submittedOrder });
    } catch (error) {
      return next(error);
    }
  });

  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    res.status(500).json({ error: message });
  });

  return app;
}
