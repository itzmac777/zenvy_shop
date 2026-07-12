import cors from "cors";
import express from "express";
import { findPlan, formatOrderAmount, getOrderProductName, getUnitAmount, normalizeQuantity } from "@zenvy/shared/orders";
import { config } from "./config";
import { createGmPayTransaction, type GmPayCallbackPayload, verifyGmPaySignature } from "./gmpay";
import { createOrderNumber, findOrder, markGmPayOrderPaid, saveOrder, type OrderInput } from "./orders-repo";

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

export function createApp() {
  const app = express();

  app.use(cors({ origin: config.corsOrigin, credentials: false }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.post("/api/orders", async (req, res, next) => {
    try {
      const plan = findPlan(field(req.body, "plan"));
      const quantity = normalizeQuantity(field(req.body, "quantity"));
      const contact = field(req.body, "contact");
      const paymentMethod = field(req.body, "method") === "bkash" ? "bkash" : "gmpay";
      const numericAmount = getUnitAmount(plan) * quantity;
      const orderNumber = createOrderNumber();
      const now = new Date();
      const baseOrder: OrderInput = {
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
      };

      if (paymentMethod === "bkash") {
        const order = await saveOrder({ ...baseOrder, status: "manual_review" });
        return sendOrderResponse(req, res, order);
      }

      if (numericAmount <= 0) {
        const order = await saveOrder({
          ...baseOrder,
          status: "manual_review",
          error: "This product needs a finalized price before GM Pay checkout can start.",
        });
        return sendOrderResponse(req, res, order);
      }

      try {
        const returnUrl = new URL(config.gmpay.returnUrl || inquiryUrl(orderNumber, contact));
        returnUrl.searchParams.set("order", orderNumber);
        if (contact) returnUrl.searchParams.set("contact", contact);

        const transaction = await createGmPayTransaction({
          order_id: orderNumber,
          amount: numericAmount,
          name: baseOrder.productName,
          redirect_url: returnUrl.toString(),
        });

        const order = await saveOrder({
          ...baseOrder,
          status: transaction.status === 3 ? "expired" : "pending_payment",
          currency: String(transaction.currency || baseOrder.currency).toLowerCase(),
          amount: `$${transaction.amount ?? numericAmount}`,
          gmpay: {
            tradeId: transaction.trade_id,
            paymentUrl: transaction.payment_url,
            actualAmount: transaction.actual_amount !== undefined ? String(transaction.actual_amount) : undefined,
            receiveAddress: transaction.receive_address,
            token: transaction.token,
            network: transaction.network,
            expirationTime: transaction.expiration_time,
          },
        });

        return sendOrderResponse(req, res, order, transaction.payment_url || inquiryUrl(order.orderNumber, order.contact));
      } catch (error) {
        const order = await saveOrder({
          ...baseOrder,
          status: "failed",
          error: error instanceof Error ? error.message : "GM Pay checkout could not be created.",
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

  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    res.status(500).json({ error: message });
  });

  return app;
}
