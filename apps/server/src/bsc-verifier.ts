import { config } from "./config";

const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const BSC_USDT_DECIMALS = 18;

type RpcLog = {
  address?: string;
  topics?: string[];
  data?: string;
  transactionHash?: string;
  blockNumber?: string;
};

type RpcReceipt = {
  status?: string;
  logs?: RpcLog[];
};

type RpcResponse = {
  result?: unknown;
  error?: { message?: string };
};

export type BscUsdtTransfer = {
  amount: string;
  amountUnits: bigint;
  blockNumber: number;
  receiveAddress: string;
  txHash: string;
};

export function normalizeAddress(address: string) {
  return address.trim().toLowerCase();
}

export function addressTopic(address: string) {
  return `0x${normalizeAddress(address).replace(/^0x/, "").padStart(64, "0")}`;
}

export function decimalToUnits(value: string | number, decimals: number = BSC_USDT_DECIMALS) {
  const raw = String(value).trim();
  const [whole = "0", fraction = ""] = raw.split(".");
  const normalizedFraction = fraction.padEnd(decimals, "0").slice(0, decimals);
  return BigInt(`${whole || "0"}${normalizedFraction}`.replace(/^0+(?=\d)/, "") || "0");
}

export function unitsToDecimal(value: bigint, decimals: number = BSC_USDT_DECIMALS) {
  const padded = value.toString().padStart(decimals + 1, "0");
  const whole = padded.slice(0, -decimals);
  const fraction = padded.slice(-decimals).replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : whole;
}

function hexBlock(block: number) {
  return `0x${Math.max(0, block).toString(16)}`;
}

async function bscRpc<T>(method: string, params: unknown[]) {
  const response = await fetch(config.gmpay.bscRpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", method, params, id: 1 }),
  });

  const payload = (await response.json().catch(() => null)) as RpcResponse | null;
  if (!response.ok || !payload || payload.error) {
    throw new Error(payload?.error?.message || "BSC RPC verification failed.");
  }

  return payload.result as T;
}

export async function getCurrentBscBlockNumber() {
  const block = await bscRpc<string>("eth_blockNumber", []);
  return Number.parseInt(block, 16);
}

export async function scanBscUsdtTransfersTo(input: {
  receiveAddress: string;
  fromBlock: number;
  toBlock: number;
}) {
  const logs = await bscRpc<RpcLog[]>("eth_getLogs", [
    {
      address: config.gmpay.bscUsdtContract,
      fromBlock: hexBlock(input.fromBlock),
      toBlock: hexBlock(input.toBlock),
      topics: [TRANSFER_TOPIC, null, addressTopic(input.receiveAddress)],
    },
  ]);

  return logs
    .filter((log) => log.transactionHash && log.data && log.blockNumber)
    .map((log): BscUsdtTransfer => {
      const amountUnits = BigInt(log.data || "0x0");
      return {
        amount: unitsToDecimal(amountUnits),
        amountUnits,
        blockNumber: Number.parseInt(log.blockNumber || "0x0", 16),
        receiveAddress: input.receiveAddress,
        txHash: log.transactionHash || "",
      };
    });
}

export async function verifyBscUsdtTransfer(input: {
  txHash: string;
  receiveAddress: string;
  minimumAmount: number;
}) {
  const txHash = input.txHash.trim();
  if (!/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
    throw new Error("Enter the full BSC transaction hash.");
  }

  const receipt = await bscRpc<RpcReceipt | null>("eth_getTransactionReceipt", [txHash]);
  if (!receipt) throw new Error("Transaction was not found on BSC yet.");
  if (receipt.status !== "0x1") throw new Error("Transaction is not successful.");

  const expectedContract = normalizeAddress(config.gmpay.bscUsdtContract);
  const expectedToTopic = addressTopic(input.receiveAddress);
  const minimumUnits = decimalToUnits(input.minimumAmount, BSC_USDT_DECIMALS);

  for (const log of receipt.logs || []) {
    const topics = log.topics || [];
    if (normalizeAddress(log.address || "") !== expectedContract) continue;
    if (topics[0]?.toLowerCase() !== TRANSFER_TOPIC) continue;
    if (topics[2]?.toLowerCase() !== expectedToTopic) continue;

    const transferred = BigInt(log.data || "0x0");
    if (transferred >= minimumUnits) {
      return {
        amount: unitsToDecimal(transferred, BSC_USDT_DECIMALS),
        receiveAddress: input.receiveAddress,
        txHash,
      };
    }
  }

  throw new Error("No matching USDT transfer to the payment address was found for this order amount.");
}
