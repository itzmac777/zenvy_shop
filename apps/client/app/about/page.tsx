import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { MarketingFooter } from "@/components/MarketingFooter";
import { MarketingHeader } from "@/components/MarketingHeader";
import { trustBadges } from "@zenvy/shared/catalog";

export default function AboutPage() {
  return (
    <>
      <MarketingHeader />
      <main className="mx-auto max-w-[1080px] px-5 py-8 md:px-7 md:py-12 xl:px-11">
        <section className="grid gap-7 border-b border-line pb-12 md:grid-cols-[0.9fr_1.1fr] md:items-end">
          <div>
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.12em] text-muted">Why Zenvy</p>
            <h1 className="font-serif text-[42px] font-normal leading-none md:text-[64px]">Premium plans with calmer handoff.</h1>
          </div>
          <p className="text-[15px] leading-relaxed text-muted">Zenvy is positioned as a friendly reseller storefront for digital subscriptions, emphasizing transparent ordering, quick delivery, and support paths customers can understand before they buy.</p>
        </section>
        <section className="mt-10 grid gap-3 border border-line bg-white/75 p-6 shadow-soft md:grid-cols-3 md:p-8">
          {trustBadges.map((badge) => (
            <div key={badge.label} className="flex min-h-12 items-center gap-3 border border-line bg-panel/60 px-3 text-sm font-bold">
              <Icon name={badge.icon} className="h-4 w-4 text-olive" />
              {badge.label}
            </div>
          ))}
        </section>
        <Button href="/#plans" className="mt-8">
          Browse plans
        </Button>
      </main>
      <MarketingFooter />
    </>
  );
}
