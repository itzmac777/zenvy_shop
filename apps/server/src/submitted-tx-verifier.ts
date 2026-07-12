import { verifyBscUsdtTransfer } from "./bsc-verifier";
import { config } from "./config";
import {
  findOrderByGmPayTxHash,
  findPendingSubmittedGmPayOrders,
  markGmPayOrderPaid,
  markSubmittedTxFailed,
  recordPaymentEvent,
} from "./orders-repo";

let isRunning = false;

function expectedAmountForOrder(order: Awaited<ReturnType<typeof findPendingSubmittedGmPayOrders>>[number]) {
  const expectedAmount = order.gmpay?.expectedAmount || order.gmpay?.actualAmount;
  return expectedAmount && Number(expectedAmount) > 0 ? expectedAmount : undefined;
}

function isWaitableVerificationError(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  return message.includes("was not found on BSC yet") || message.includes("BSC RPC request failed");
}

async function runSubmittedTxVerification() {
  if (isRunning) return;
  isRunning = true;

  try {
    const orders = await findPendingSubmittedGmPayOrders(1000, config.gmpay.orderExpirationMinutes);

    for (const order of orders) {
      const txHash = order.gmpay?.submittedTxHash;
      if (!txHash) continue;

      const existingTxOrder = await findOrderByGmPayTxHash(txHash);
      if (existingTxOrder && existingTxOrder.orderNumber !== order.orderNumber) {
        await markSubmittedTxFailed({ orderNumber: order.orderNumber, error: "This transaction hash has already paid another order." });
        await recordPaymentEvent({
          orderNumber: order.orderNumber,
          eventType: "manual_verify_failed",
          message: "Submitted tx hash already belongs to another order.",
          metadata: { txHash },
        });
        continue;
      }

      try {
        const receiveAddress = order.gmpay?.receiveAddress || config.gmpay.receiveAddress;
        if (!receiveAddress) throw new Error("BSC receiving address is not configured.");
        const expectedAmount = expectedAmountForOrder(order);
        const verified = await verifyBscUsdtTransfer({
          txHash,
          receiveAddress,
          exactAmount: expectedAmount,
          minimumAmount: expectedAmount ? undefined : order.numericAmount,
        });

        await markGmPayOrderPaid({
          orderNumber: order.orderNumber,
          tradeId: order.gmpay?.tradeId,
          actualAmount: Number(verified.amount),
          receiveAddress: verified.receiveAddress,
          token: "USDT",
          network: "binance",
          txHash: verified.txHash,
        });

        await recordPaymentEvent({
          orderNumber: order.orderNumber,
          eventType: "manual_tx_verified",
          metadata: { txHash, amount: verified.amount },
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Manual verification failed.";
        if (isWaitableVerificationError(error)) {
          await recordPaymentEvent({
            orderNumber: order.orderNumber,
            eventType: "manual_verify_pending",
            message,
            metadata: { txHash },
          });
          continue;
        }

        await markSubmittedTxFailed({ orderNumber: order.orderNumber, error: message });
        await recordPaymentEvent({
          orderNumber: order.orderNumber,
          eventType: "manual_verify_failed",
          message,
          metadata: { txHash },
        });
      }
    }
  } catch (error) {
    await recordPaymentEvent({
      eventType: "manual_verify_scan_failed",
      message: error instanceof Error ? error.message : "Submitted tx verification scan failed.",
    });
    console.error("[submitted-tx-verifier] scan failed", error);
  } finally {
    isRunning = false;
  }
}

export function startSubmittedTxVerifier() {
  const intervalMs = Math.max(5000, config.gmpay.submittedTxPollIntervalMs);
  console.log(`[submitted-tx-verifier] enabled, scanning every ${intervalMs}ms`);
  void runSubmittedTxVerification();
  setInterval(() => void runSubmittedTxVerification(), intervalMs);
}
