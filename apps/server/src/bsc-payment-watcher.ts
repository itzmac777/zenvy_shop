import { config } from "./config";
import { decimalToUnits, getCurrentBscBlockNumber, scanBscUsdtTransfersTo } from "./bsc-verifier";
import { findOrderByGmPayTxHash, findPendingGmPayOrders, markGmPayOrderPaid } from "./orders-repo";

let isRunning = false;

async function runBscPaymentScan() {
  if (isRunning) return;
  isRunning = true;

  try {
    const receiveAddress = config.gmpay.receiveAddress;
    if (!receiveAddress) return;

    const pendingOrders = await findPendingGmPayOrders();
    if (pendingOrders.length === 0) return;

    const currentBlock = await getCurrentBscBlockNumber();
    const safeToBlock = currentBlock - config.gmpay.bscWatcherConfirmations;
    if (safeToBlock <= 0) return;

    const fromBlock = Math.max(0, safeToBlock - config.gmpay.bscWatcherLookbackBlocks);
    const transfers = await scanBscUsdtTransfersTo({
      receiveAddress,
      fromBlock,
      toBlock: safeToBlock,
    });

    if (transfers.length === 0) return;

    const transfersByAmount = new Map<string, typeof transfers>();
    for (const transfer of transfers) {
      const key = transfer.amountUnits.toString();
      transfersByAmount.set(key, [...(transfersByAmount.get(key) || []), transfer]);
    }

    for (const order of pendingOrders) {
      const expectedAmount = decimalToUnits(order.numericAmount).toString();
      const matchingTransfers = transfersByAmount.get(expectedAmount) || [];

      for (const transfer of matchingTransfers) {
        const existingTxOrder = await findOrderByGmPayTxHash(transfer.txHash);
        if (existingTxOrder && existingTxOrder.orderNumber !== order.orderNumber) continue;

        await markGmPayOrderPaid({
          orderNumber: order.orderNumber,
          tradeId: order.gmpay?.tradeId,
          actualAmount: Number(transfer.amount),
          receiveAddress: transfer.receiveAddress,
          token: "USDT",
          network: "binance",
          txHash: transfer.txHash,
        });

        console.log(
          `[bsc-watcher] marked order ${order.orderNumber} paid from ${transfer.txHash} at block ${transfer.blockNumber}`,
        );
        break;
      }
    }
  } catch (error) {
    console.error("[bsc-watcher] scan failed", error);
  } finally {
    isRunning = false;
  }
}

export function startBscPaymentWatcher() {
  if (!config.gmpay.bscWatcherEnabled) {
    console.log("[bsc-watcher] disabled");
    return;
  }

  if (!config.gmpay.receiveAddress) {
    console.log("[bsc-watcher] disabled because GMPAY_RECEIVE_ADDRESS is missing");
    return;
  }

  const intervalMs = Math.max(5000, config.gmpay.bscWatcherIntervalMs);
  console.log(`[bsc-watcher] enabled, scanning every ${intervalMs}ms`);
  void runBscPaymentScan();
  setInterval(() => void runBscPaymentScan(), intervalMs);
}
