import { config } from "./config";
import { decimalToUnits, getCurrentBscBlockNumber, normalizeAddress, scanBscUsdtTransfersTo } from "./bsc-verifier";
import { findOrderByGmPayTxHash, findPendingGmPayOrders, markGmPayOrderPaid } from "./orders-repo";

let isRunning = false;

function groupByReceiveAddress(orders: Awaited<ReturnType<typeof findPendingGmPayOrders>>) {
  const groups = new Map<string, typeof orders>();

  for (const order of orders) {
    const receiveAddress = order.gmpay?.receiveAddress || config.gmpay.receiveAddress;
    if (!receiveAddress) continue;

    const key = normalizeAddress(receiveAddress);
    groups.set(key, [...(groups.get(key) || []), order]);
  }

  return groups;
}

async function runBscPaymentScan() {
  if (isRunning) return;
  isRunning = true;

  try {
    const pendingOrders = await findPendingGmPayOrders();
    if (pendingOrders.length === 0) return;

    const currentBlock = await getCurrentBscBlockNumber();
    const safeToBlock = currentBlock - config.gmpay.bscWatcherConfirmations;
    if (safeToBlock <= 0) return;

    const fromBlock = Math.max(0, safeToBlock - config.gmpay.bscWatcherLookbackBlocks);

    for (const [receiveAddress, addressOrders] of groupByReceiveAddress(pendingOrders)) {
      const transfers = await scanBscUsdtTransfersTo({
        receiveAddress,
        fromBlock,
        toBlock: safeToBlock,
      });

      if (transfers.length === 0) continue;

      const ordersByAmount = new Map<string, typeof addressOrders>();
      for (const order of addressOrders) {
        const expectedAmount = decimalToUnits(order.numericAmount).toString();
        ordersByAmount.set(expectedAmount, [...(ordersByAmount.get(expectedAmount) || []), order]);
      }

      for (const transfer of transfers) {
        const matchingOrders = ordersByAmount.get(transfer.amountUnits.toString()) || [];
        if (matchingOrders.length === 0) continue;

        if (matchingOrders.length > 1) {
          console.warn(
            `[bsc-watcher] ambiguous ${transfer.amount} USDT transfer ${transfer.txHash}; ${matchingOrders.length} pending orders match ${receiveAddress}`,
          );
          continue;
        }

        const [order] = matchingOrders;
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
