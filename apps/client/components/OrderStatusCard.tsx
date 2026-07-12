import Image from "next/image";
import { getOrderProductName } from "@zenvy/shared/orders";
import type { SubscriptionPlan } from "@zenvy/shared/types";

type OrderStatusCardProps = {
  orderNumber: string;
  orderPlacedAt: string;
  paymentMethod: string;
  orderAmount: string;
  plan: SubscriptionPlan;
  quantity: number;
  paymentTime?: string;
  statusTitle?: string;
  txHash?: string;
  paymentUrl?: string;
  actualAmount?: string;
  token?: string;
  network?: string;
  statusNote?: string;
};

export function OrderStatusCard({
  orderNumber,
  orderPlacedAt,
  paymentMethod,
  orderAmount,
  plan,
  quantity,
  paymentTime = "-",
  statusTitle = "Pending payment",
  txHash,
  paymentUrl,
  actualAmount,
  token,
  network,
  statusNote,
}: OrderStatusCardProps) {
  return (
    <section className="border border-line bg-white/78 p-5 shadow-soft md:p-7">
      <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted">Order status</p>
      <h1 className="mt-2 font-serif text-[38px] font-normal leading-none md:text-[54px]">{statusTitle}</h1>
      <div className="mt-5 border-y border-line py-5">
        <p className="text-sm text-muted">#</p>
        <p className="break-all text-[22px] font-extrabold leading-tight md:text-[28px]">{orderNumber}</p>
      </div>

      <dl className="mt-5 grid gap-3 text-sm md:grid-cols-2">
        <div>
          <dt className="text-muted">Order placed</dt>
          <dd className="font-bold">{orderPlacedAt}</dd>
        </div>
        <div>
          <dt className="text-muted">Payment time</dt>
          <dd className="font-bold">{paymentTime}</dd>
        </div>
        <div>
          <dt className="text-muted">Payment method</dt>
          <dd className="font-bold">{paymentMethod}</dd>
        </div>
        <div>
          <dt className="text-muted">Order amount</dt>
          <dd className="font-serif text-2xl font-normal">{orderAmount}</dd>
        </div>
        {txHash ? (
          <div className="md:col-span-2">
            <dt className="text-muted">Transaction hash</dt>
            <dd className="break-all font-bold">{txHash}</dd>
          </div>
        ) : null}
        {actualAmount || token || network ? (
          <div className="md:col-span-2">
            <dt className="text-muted">Crypto payment</dt>
            <dd className="font-bold">
              {[actualAmount, token, network].filter(Boolean).join(" ")}
            </dd>
          </div>
        ) : null}
      </dl>

      {statusNote ? <p className="mt-5 border border-line bg-panel px-3 py-2 text-[12px] font-bold text-muted">{statusNote}</p> : null}

      {paymentUrl ? (
        <a
          href={paymentUrl}
          className="mt-5 inline-flex min-h-11 items-center justify-center border border-transparent bg-olive px-6 text-sm font-bold text-white shadow-[inset_0_-1px_0_rgba(0,0,0,0.16)] transition hover:-translate-y-px hover:bg-olive-dark"
        >
          Continue payment
        </a>
      ) : null}

      <div className="mt-6 grid gap-4 border-t border-line pt-5 md:grid-cols-[126px_minmax(0,1fr)] md:items-center">
        <Image src={plan.thumbnail} alt={plan.thumbnailAlt} width={260} height={260} className="aspect-square w-full max-w-[160px] border border-line bg-[#efe8dd] object-cover" />
        <div>
          <h2 className="font-serif text-[26px] font-normal leading-tight">{getOrderProductName(plan)}</h2>
          <p className="mt-2 text-sm text-muted">
            Quantity: <strong className="text-ink">{quantity}</strong>
          </p>
        </div>
      </div>
    </section>
  );
}
