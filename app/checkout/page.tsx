import { CheckoutForm } from "@/components/CheckoutForm";
import { MarketingFooter } from "@/components/MarketingFooter";
import { MarketingHeader } from "@/components/MarketingHeader";

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const { plan } = await searchParams;

  return (
    <>
      <MarketingHeader />
      <main className="mx-auto max-w-[980px] px-5 py-8 md:px-7 md:py-12 xl:px-11">
        <section className="mb-7">
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.12em] text-muted">Checkout scaffold</p>
          <h1 className="font-serif text-[42px] font-normal leading-none md:text-[64px]">Order your subscription</h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">This flow collects order details only. Payment processing and fulfillment automation are intentionally left as TODOs.</p>
        </section>
        <CheckoutForm initialPlanId={plan} />
      </main>
      <MarketingFooter />
    </>
  );
}
