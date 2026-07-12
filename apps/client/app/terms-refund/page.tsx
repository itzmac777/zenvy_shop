import { MarketingFooter } from "@/components/MarketingFooter";
import { MarketingHeader } from "@/components/MarketingHeader";

const sections = [
  {
    title: "Terms of service template",
    copy: "This placeholder describes customer responsibilities, reseller limitations, service availability, delivery timing, and acceptable use. Replace it with owner-approved legal language before publication.",
  },
  {
    title: "Refund policy template",
    copy: "This placeholder says refunds may be limited after delivery, while replacement support may be offered if a subscription stops working during the covered period. Final eligibility, timing, and exclusions require owner and legal review.",
  },
  {
    title: "Privacy policy template",
    copy: "This placeholder states that customer contact details are collected for order delivery and support. Add the final data retention, processor, analytics, and payment-provider disclosures before launch.",
  },
];

export default function TermsRefundPage() {
  return (
    <>
      <MarketingHeader />
      <main className="mx-auto max-w-[980px] px-5 py-8 md:px-7 md:py-12 xl:px-11">
        <section className="mb-8">
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.12em] text-muted">Owner review required</p>
          <h1 className="font-serif text-[42px] font-normal leading-none md:text-[64px]">Terms & refund policy</h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">This page is a clearly marked policy template and must be finalized by the site owner before accepting real payments.</p>
        </section>
        <div className="grid gap-4">
          {/* Placeholder legal/policy copy requiring legal review. */}
          {sections.map((section) => (
            <article key={section.title} className="border border-line bg-white/75 p-6 shadow-soft md:p-7">
              <h2 className="font-serif text-[28px] font-normal leading-none">{section.title}</h2>
              <p className="mt-4 text-[15px] leading-relaxed text-muted">{section.copy}</p>
            </article>
          ))}
        </div>
      </main>
      <MarketingFooter />
    </>
  );
}
