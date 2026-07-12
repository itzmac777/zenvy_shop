import Image from "next/image";
import { Button } from "@/components/Button";
import { FaqAccordion } from "@/components/FaqAccordion";
import { Icon } from "@/components/Icon";
import { MarketingFooter } from "@/components/MarketingFooter";
import { MarketingHeader } from "@/components/MarketingHeader";
import { SubscriptionProductCard } from "@/components/SubscriptionProductCard";
import { subscriptionPlans, testimonials, trustBadges } from "@zenvy/shared/catalog";

const steps = [
  { icon: "card" as const, title: "Order", copy: "Choose a plan and send your delivery contact details." },
  { icon: "shield" as const, title: "Verify", copy: "We confirm availability, payment, and account handoff notes." },
  { icon: "refresh" as const, title: "Instant delivery", copy: "Your subscription details arrive with support and replacement guidance." },
];

export default function HomePage() {
  return (
    <>
      <MarketingHeader />
      <main className="mx-auto max-w-[1400px] px-5 pb-12 md:px-7 xl:px-11">
        <section id="plans" className="mx-auto max-w-[1080px] py-10 md:py-14">
          <div className="mb-6 flex items-end justify-between gap-6 md:mb-8">
            <div>
              <h2 className="font-serif text-[34px] font-normal leading-none md:text-[38px]">Subscription plans</h2>
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">Each product is data-driven, so more plans can be added later without rewriting the layout.</p>
            </div>
            <a href="#plans" className="hidden items-center gap-2 text-[12px] font-extrabold tracking-[0.01em] md:inline-flex">
              Start order <span aria-hidden="true">-&gt;</span>
            </a>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6 xl:grid-cols-4">
            {subscriptionPlans.map((plan) => (
              <SubscriptionProductCard key={plan.id} plan={plan} />
            ))}
          </div>
        </section>

        <section id="how-it-works" className="mx-auto grid max-w-[1080px] gap-7 border-y border-line py-14 md:grid-cols-[0.8fr_1.2fr] md:py-16">
          <div>
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.12em] text-muted">Reliable delivery</p>
            <h2 className="font-serif text-[34px] font-normal leading-none md:text-[42px]">How it works</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">A simple order flow for premium digital subscriptions, with support notes visible before checkout.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {steps.map((step, index) => (
              <article key={step.title} className="border border-line bg-white/70 p-5 shadow-soft">
                <span className="grid h-[50px] w-[50px] place-items-center rounded-full bg-[#f0ebe4] text-olive">
                  <Icon name={step.icon} />
                </span>
                <p className="mt-5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-muted">Step {index + 1}</p>
                <h3 className="mt-2 font-serif text-2xl font-normal leading-none">{step.title}</h3>
                <p className="mt-3 text-[13px] leading-relaxed text-muted">{step.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-[1080px] gap-6 py-14 md:grid-cols-[0.95fr_1.05fr] md:items-center md:py-16">
          <Image
            src="/images/subscriptions/trust-customer.png"
            alt="Satisfied customer using a laptop with subtle verified delivery visuals"
            width={1100}
            height={820}
            className="aspect-[4/3] w-full border border-line bg-[#efe8dd] object-cover"
          />
          <div className="border border-line bg-white/75 p-6 shadow-soft md:p-8">
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted">Trust & support</p>
            <h2 className="mt-3 font-serif text-[34px] font-normal leading-none md:text-[42px]">Clear delivery, clear backup.</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">Use this section to replace placeholder trust claims with verified operating metrics, payment coverage, and support guarantees.</p>
            <div className="mt-6 grid gap-2">
              {trustBadges.map((badge) => (
                <div key={badge.label} className="flex min-h-11 items-center gap-3 border border-line bg-panel/60 px-3 text-sm font-bold">
                  <Icon name={badge.icon} className="h-4 w-4 text-olive" />
                  {badge.label}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="reviews" className="mx-auto max-w-[1080px] pb-14 md:pb-16">
          <h2 className="font-serif text-[34px] font-normal leading-none md:text-[38px]">Social proof</h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">Placeholder testimonial cards are clearly labeled for replacement with real customer approvals.</p>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <article key={testimonial.id} className="border border-line bg-white/75 p-5 shadow-soft">
                <div className="flex items-center gap-3">
                  <Image src={testimonial.avatar} alt={testimonial.avatarAlt} width={48} height={48} className="h-12 w-12 rounded-full bg-[#eee8dd] object-cover" />
                  <div>
                    <h3 className="font-bold leading-tight">{testimonial.name}</h3>
                    <p className="text-xs text-muted">{testimonial.role}</p>
                  </div>
                </div>
                <p className="mt-4 text-[13px] leading-relaxed text-muted">&ldquo;{testimonial.quote}&rdquo;</p>
                <p className="mt-4 text-[12px] tracking-[0.08em]" aria-label={`${testimonial.rating} star rating`}>
                  {"★".repeat(testimonial.rating)}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section id="faq" className="mx-auto grid max-w-[1080px] gap-7 border-t border-line py-14 md:grid-cols-[0.8fr_1.2fr] md:py-16">
          <div>
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.12em] text-muted">FAQ</p>
            <h2 className="font-serif text-[34px] font-normal leading-none md:text-[42px]">Questions before ordering</h2>
          </div>
          <FaqAccordion />
        </section>

        <section id="join" className="relative grid gap-7 overflow-hidden bg-olive p-7 text-white md:grid-cols-[1fr_auto] md:items-center md:p-10 xl:px-20">
          <Image
            src="/images/subscriptions/secure-support.png"
            alt="Abstract secure checkout and round-the-clock support illustration"
            fill
            sizes="100vw"
            className="z-0 object-cover opacity-28"
          />
          <div className="absolute inset-0 z-10 bg-[linear-gradient(90deg,rgba(17,17,17,0.96),rgba(17,17,17,0.88))]" />
          <div className="relative z-20">
            <h2 className="max-w-md font-serif text-[34px] font-normal leading-tight md:text-[38px]">Ready to order your next premium plan?</h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/80">Choose a subscription, share your delivery contact, and keep the replacement policy close at hand.</p>
          </div>
          <div className="relative z-20 grid gap-3 md:flex md:gap-5">
            <Button href="#plans" variant="light">
              Get started
            </Button>
            <Button href="#plans" variant="outline">
              Browse plans
            </Button>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}
