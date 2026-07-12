import Link from "next/link";
import { MarketingFooter } from "@/components/MarketingFooter";
import { MarketingHeader } from "@/components/MarketingHeader";
import { OrderStatusCard } from "@/components/OrderStatusCard";
import type { OrderSummary } from "@zenvy/shared/orders";
import { demoOrderNumber, demoOrderPlacedAt, findPlan, formatOrderAmount, getPaymentMethod, normalizeQuantity } from "@zenvy/shared/orders";

type InquirySearchParams = {
  order?: string;
  contact?: string;
  plan?: string;
  quantity?: string;
  method?: string;
  payment?: string;
  reason?: string;
  tx?: string;
  paymentTime?: string;
  orderPlacedAt?: string;
};

export const dynamic = "force-dynamic";

async function lookupOrder(params: InquirySearchParams) {
  if (!params.order && !params.contact) return null;
  const apiBase = process.env.SERVER_INTERNAL_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
  const url = new URL("/api/orders/lookup", apiBase);
  if (params.order) url.searchParams.set("order", params.order);
  if (params.contact) url.searchParams.set("contact", params.contact);

  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return null;
    const payload = (await response.json()) as { order: OrderSummary | null };
    return payload.order;
  } catch {
    return null;
  }
}

function titleForStatus(status?: string) {
  if (status === "paid") return "Payment verified";
  if (status === "payment_submitted") return "Payment submitted";
  if (status === "expired") return "Expired";
  if (status === "manual_review") return "Manual review";
  if (status === "failed") return "Payment setup failed";
  return "Pending payment";
}

export default async function OrderInquiryPage({ searchParams }: { searchParams: Promise<InquirySearchParams> }) {
  const params = await searchParams;
  const hasLookup = Boolean(params.order || params.contact);
  const storedOrder = await lookupOrder(params);
  const plan = findPlan(storedOrder?.planId || params.plan);
  const quantity = storedOrder?.quantity || normalizeQuantity(params.quantity);
  const paymentMethod = storedOrder ? getPaymentMethod(storedOrder.paymentMethod === "gmpay" ? "gmpay" : "bkash") : getPaymentMethod(params.method);
  const paymentState = params.payment === "verified" ? "verified" : params.payment === "failed" ? "failed" : "pending";
  const orderNumber = storedOrder?.orderNumber || params.order || demoOrderNumber;
  const orderPlacedAt = storedOrder?.orderPlacedAt || params.orderPlacedAt || demoOrderPlacedAt;
  const statusTitle = storedOrder ? titleForStatus(storedOrder.status) : paymentState === "verified" ? "Payment verified" : "Pending payment";
  const orderAmount = storedOrder?.amount || formatOrderAmount(plan, quantity);
  const paymentTime = storedOrder?.paymentTime || (paymentState === "verified" ? params.paymentTime || "-" : "-");

  return (
    <>
      <MarketingHeader />
      <main className="mx-auto grid max-w-[1080px] gap-8 px-5 py-8 md:grid-cols-[0.72fr_1.28fr] md:px-7 md:py-12 xl:px-11">
        <section className="content-start border border-line bg-white/75 p-5 shadow-soft md:p-7">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted">Order inquiry</p>
          <h1 className="mt-2 font-serif text-[40px] font-normal leading-none md:text-[56px]">Find your order</h1>
          <p className="mt-4 text-sm leading-relaxed text-muted">Enter your order number or the contact information used at checkout.</p>

          <form action="/order-inquiry" method="get" className="mt-6 grid gap-4">
            <label className="grid gap-1.5 text-sm font-bold">
              Order number
              <input name="order" placeholder={demoOrderNumber} className="min-h-11 border border-line bg-paper px-3 font-normal outline-none focus:border-olive" />
            </label>
            <label className="grid gap-1.5 text-sm font-bold">
              Contact information
              <input name="contact" placeholder="Email or messaging app handle" className="min-h-11 border border-line bg-paper px-3 font-normal outline-none focus:border-olive" />
            </label>
            <button type="submit" className="inline-flex min-h-11 items-center justify-center border border-transparent bg-olive px-6 text-sm font-bold text-white shadow-[inset_0_-1px_0_rgba(0,0,0,0.16)] transition hover:-translate-y-px hover:bg-olive-dark">
              Check order
            </button>
          </form>

          <Link href="/#plans" className="mt-5 inline-flex text-[12px] font-extrabold tracking-[0.01em]">
            Browse plans -&gt;
          </Link>
        </section>

        {hasLookup && storedOrder ? (
          <div>
            <OrderStatusCard
              orderNumber={orderNumber}
              contact={storedOrder.contact}
              orderPlacedAt={orderPlacedAt}
              paymentMethod={paymentMethod.label}
              orderAmount={orderAmount}
              plan={plan}
              quantity={quantity}
              paymentTime={paymentTime}
              statusTitle={statusTitle}
              txHash={storedOrder?.gmpay?.txHash || params.tx}
              submittedTxHash={storedOrder?.gmpay?.submittedTxHash}
              submittedTxStatus={storedOrder?.gmpay?.submittedTxStatus}
              paymentUrl={storedOrder?.status === "pending_payment" || storedOrder?.status === "payment_submitted" ? storedOrder.gmpay?.paymentUrl : undefined}
              actualAmount={storedOrder?.gmpay?.actualAmount}
              expectedAmount={storedOrder?.gmpay?.expectedAmount}
              token={storedOrder?.gmpay?.token}
              network={storedOrder?.gmpay?.network}
              statusNote={storedOrder?.gmpay?.submittedTxError || storedOrder?.error}
            />
          </div>
        ) : hasLookup ? (
          <section className="border border-line bg-white/60 p-5 shadow-soft md:p-7">
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted">No order found</p>
            <h2 className="mt-2 font-serif text-[34px] font-normal leading-none">Check the details and try again.</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted">We could not find a matching order number or contact entry yet. If this was just placed, wait a moment and refresh the inquiry.</p>
          </section>
        ) : (
          <section className="border border-line bg-white/60 p-5 shadow-soft md:p-7">
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted">No lookup yet</p>
            <h2 className="mt-2 font-serif text-[34px] font-normal leading-none">Order status appears here.</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted">After payment selection, or after searching by order number/contact information, customers see the pending-payment summary here.</p>
          </section>
        )}
      </main>
      <MarketingFooter />
    </>
  );
}
