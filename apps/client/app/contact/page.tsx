import { Button } from "@/components/Button";
import { MarketingFooter } from "@/components/MarketingFooter";
import { MarketingHeader } from "@/components/MarketingHeader";

export default function ContactPage() {
  return (
    <>
      <MarketingHeader />
      <main className="mx-auto max-w-[980px] px-5 py-8 md:px-7 md:py-12 xl:px-11">
        <section className="mb-7">
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.12em] text-muted">Support</p>
          <h1 className="font-serif text-[42px] font-normal leading-none md:text-[64px]">Contact & order help</h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">Use this placeholder page for live support channels, response windows, and replacement request instructions.</p>
        </section>
        <form className="grid gap-5 border border-line bg-white/75 p-5 shadow-soft md:p-7">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold">
              Name
              <input required name="name" className="min-h-11 border border-line bg-paper px-3 font-normal" />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Email
              <input required type="email" name="email" className="min-h-11 border border-line bg-paper px-3 font-normal" />
            </label>
          </div>
          <label className="grid gap-2 text-sm font-bold">
            Topic
            <select name="topic" className="min-h-11 border border-line bg-paper px-3 font-normal">
              <option>Order question</option>
              <option>Replacement request</option>
              <option>Payment support</option>
              <option>General question</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Message
            <textarea required name="message" rows={5} className="border border-line bg-paper px-3 py-3 font-normal" />
          </label>
          <div className="grid gap-4 border-t border-line pt-5 md:grid-cols-[1fr_auto] md:items-center">
            <p className="text-[13px] leading-relaxed text-muted">Form submission backend is not connected yet. Add email, CRM, or ticketing integration before launch.</p>
            <button type="button" className="inline-flex min-h-11 items-center justify-center border border-transparent bg-olive px-6 text-sm font-bold text-white shadow-[inset_0_-1px_0_rgba(0,0,0,0.16)]">
              Send message
            </button>
          </div>
        </form>
        <Button href="/#plans" className="mt-8">
          Start an order
        </Button>
      </main>
      <MarketingFooter />
    </>
  );
}
