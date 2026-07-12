import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/Icon";
import { MarketingFooter } from "@/components/MarketingFooter";
import { MarketingHeader } from "@/components/MarketingHeader";
import { PlanOrderPanel } from "@/components/PlanOrderPanel";
import { SubscriptionProductCard } from "@/components/SubscriptionProductCard";
import { subscriptionPlans } from "@zenvy/shared/catalog";

export function generateStaticParams() {
  return subscriptionPlans.map((plan) => ({ id: plan.id }));
}

export default async function PlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plan = subscriptionPlans.find((item) => item.id === id);
  if (!plan) notFound();

  const relatedPlans = subscriptionPlans.filter((item) => item.id !== plan.id).slice(0, 3);

  return (
    <>
      <MarketingHeader />
      <main className="mx-auto max-w-[1180px] px-5 py-8 md:px-7 md:py-12 xl:px-11">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.56fr)_minmax(360px,0.44fr)]">
          <section>
            <Image src={plan.thumbnail} alt={plan.thumbnailAlt} width={1600} height={1200} priority className="aspect-[4/3] w-full border border-line bg-[#efe8dd] object-cover" />
          </section>

          <PlanOrderPanel plan={plan} />
        </div>

        <section className="mt-8 border border-line bg-white/72 shadow-soft">
          <div className="border-b border-line px-5 py-4 md:px-7">
            <h2 className="flex items-center gap-2 text-base font-bold">
              <Icon name="package" className="h-4 w-4" />
              Product Details
            </h2>
          </div>
          <div className="grid gap-7 p-5 md:grid-cols-[minmax(0,0.9fr)_minmax(280px,0.6fr)] md:p-7">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted">Overview</p>
              <h3 className="mt-2 font-serif text-[32px] font-normal leading-none">{plan.name}</h3>
              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">{plan.whatYouGet}</p>
              <dl className="mt-6 grid gap-4 text-sm md:grid-cols-2">
                <div className="border border-line bg-panel/60 p-4">
                  <dt className="text-muted">Delivery method</dt>
                  <dd className="mt-1 font-bold">{plan.deliveryNote}</dd>
                </div>
                <div className="border border-line bg-panel/60 p-4">
                  <dt className="text-muted">Replacement summary</dt>
                  <dd className="mt-1 font-bold">{plan.refundSummary}</dd>
                </div>
              </dl>
            </div>

            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted">Included</p>
              <ul className="mt-3 grid gap-2 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 border border-line bg-panel/60 px-3 py-2">
                    <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-olive" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-14 border-t border-line pt-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-serif text-[34px] font-normal leading-none md:text-[38px]">Related plans</h2>
            <Link href="/#plans" className="text-[12px] font-extrabold tracking-[0.01em]">
              Browse all plans -&gt;
            </Link>
          </div>
          <div className="mt-7 grid gap-5 md:grid-cols-3">
            {relatedPlans.map((related) => (
              <SubscriptionProductCard key={related.id} plan={related} />
            ))}
          </div>
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}
