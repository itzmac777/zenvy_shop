import Image from "next/image";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { MarketingHeader } from "@/components/MarketingHeader";
import { categories, landingProducts } from "@/data/catalog";

const benefits = [
  { icon: "card" as const, title: "Flexible payment terms", copy: "Choose net 60 terms or pay on your schedule, built for your business." },
  { icon: "tag" as const, title: "Curated products for every store", copy: "Handpicked goods from independent brands your customers will love." },
  { icon: "box" as const, title: "Easy returns and fast reorders", copy: "Hassle-free first orders and a seamless reorder experience." },
];

export default function HomePage() {
  return (
    <>
      <MarketingHeader />
      <main className="mx-auto max-w-[1400px] px-5 pb-12 md:px-7 xl:px-11">
        <section className="-mx-5 grid min-h-[604px] items-end border-b border-line bg-[linear-gradient(0deg,rgba(252,250,246,0.98)_0%,rgba(252,250,246,0.9)_47%,rgba(252,250,246,0.16)_100%),url('https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1100&q=86')] bg-cover bg-center-top px-5 py-10 md:-mx-7 md:min-h-[560px] md:items-center md:bg-[linear-gradient(90deg,rgba(252,250,246,0.98)_0%,rgba(252,250,246,0.95)_31%,rgba(252,250,246,0.47)_51%,rgba(252,250,246,0.04)_100%),url('https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=2200&q=88')] md:bg-center md:px-7 md:py-16 xl:-mx-11 xl:px-11">
          <div className="max-w-[520px]">
            <h1 className="font-serif text-[clamp(42px,12vw,56px)] font-normal leading-[0.98] md:text-[clamp(48px,5.15vw,76px)]">
              Wholesale made effortless for modern retailers.
            </h1>
            <p className="mt-6 max-w-[455px] text-[15px] leading-relaxed text-[#37332c] md:text-[17px]">
              Discover independent brands, enjoy flexible ordering with net terms, and restock your bestsellers with ease.
            </p>
            <div className="mt-8 grid gap-3 md:flex md:gap-5">
              <Button href="#join">Shop wholesale</Button>
              <Button href="/dashboard" variant="secondary">
                Sell on Zenvy
              </Button>
            </div>
          </div>
        </section>

        <section className="border-b border-line py-7 md:py-9">
          <div className="-mx-5 overflow-hidden md:hidden">
            <div className="benefit-marquee flex w-max">
              {[0, 1].map((set) => (
                <div key={set} className="flex gap-3 px-5" aria-hidden={set === 1}>
                  {benefits.map((item) => (
                    <article key={`${set}-${item.title}`} className="grid w-[315px] flex-none grid-cols-[50px_minmax(0,1fr)] gap-4 border border-line bg-white/72 p-4 shadow-soft">
                      <span className="grid h-[48px] w-[48px] place-items-center rounded-full bg-[#f0ebe4] text-olive">
                        <Icon name={item.icon} />
                      </span>
                      <div>
                        <h2 className="mt-1 text-[15px] font-bold leading-snug">{item.title}</h2>
                        <p className="mt-2 text-[13px] leading-relaxed text-muted">{item.copy}</p>
                      </div>
                    </article>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="hidden md:grid md:grid-cols-3">
            {benefits.map((item) => (
              <article key={item.title} className="grid grid-cols-[64px_minmax(0,1fr)] gap-4 border-r border-line px-8 last:border-r-0">
                <span className="grid h-[58px] w-[58px] place-items-center rounded-full bg-[#f0ebe4] text-olive">
                  <Icon name={item.icon} />
                </span>
                <div>
                  <h2 className="mt-1 text-base font-bold leading-snug">{item.title}</h2>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted">{item.copy}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="categories" className="mx-auto max-w-[1080px] py-14 md:py-20">
          <h2 className="font-serif text-[30px] font-normal leading-none md:text-[34px]">Explore top categories</h2>
          <div className="scrollbar-none -mx-5 mt-6 overflow-x-auto px-5 md:mx-0 md:px-0">
            <div className="flex w-max gap-3 md:grid md:w-full md:grid-cols-5 md:gap-4">
              {categories.map((category, index) => (
                <a
                  key={category.label}
                  href={category.href}
                  className={`inline-flex min-h-[46px] min-w-[136px] items-center justify-center gap-2.5 border px-4 text-[11px] font-extrabold tracking-[0.01em] transition hover:-translate-y-px md:min-w-0 ${
                    index === 0 ? "border-olive bg-olive text-white" : "border-line bg-white/70 text-ink hover:border-[#b7ad9f] hover:bg-white"
                  }`}
                >
                  <Icon name={category.icon} className="h-4 w-4" />
                  {category.label}
                </a>
              ))}
            </div>
          </div>
        </section>

        <section id="bestsellers" className="mx-auto max-w-[1080px] pb-16 md:pb-20">
          <div className="mb-6 flex items-end justify-between gap-6 md:mb-8">
            <h2 className="font-serif text-[34px] font-normal leading-none md:text-[38px]">Bestsellers</h2>
            <a href="#all" className="inline-flex items-center gap-2 text-[12px] font-extrabold tracking-[0.01em]">
              View all <span aria-hidden="true">-&gt;</span>
            </a>
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 md:gap-x-8 md:gap-y-11 xl:grid-cols-4">
            {landingProducts.map((product) => (
              <article key={product.id} className="group min-w-0">
                <Image src={product.image} alt={product.alt} width={700} height={700} className="aspect-square w-full bg-[#efe8dd] object-cover transition duration-300 group-hover:brightness-[0.97]" />
                <div className="pt-3">
                  <p className="truncate text-[9px] font-extrabold uppercase tracking-[0.13em] text-muted">{product.brand}</p>
                  <h3 className="mt-1 font-serif text-[16px] font-normal leading-tight md:text-[18px]">{product.name}</h3>
                  <div className="mt-2 flex items-center gap-2 text-[11px] tracking-[0.08em]">
                    <span aria-label="5 star rating">★★★★★</span>
                    <span className="text-[11px] tracking-normal text-muted">{product.ratingCount}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2 text-[13px] md:text-sm">
                    <strong className="text-[17px] leading-none md:text-[18px]">{product.price}</strong>
                    <span className="inline-flex min-h-5 items-center whitespace-nowrap rounded-full bg-[#eee8dd] px-2 text-[9px] font-bold text-muted">
                      {product.terms}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-8 grid overflow-hidden border border-line/70 bg-gradient-to-br from-[#fbf8f2] to-[#f5f0e8] shadow-soft md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <blockquote className="border-b border-line p-7 font-serif text-xl leading-relaxed md:border-b-0 md:p-10">
            “Zenvy is an essential partner for our shop. The brands are incredible, the terms are fair, and reordering is so simple.”
            <cite className="mt-5 block font-sans text-xs not-italic text-muted">Julia Park, Owner: Haven & Fold</cite>
          </blockquote>
          {[
            { icon: "tag" as const, value: "20,000+", label: "Independent brands" },
            { icon: "users" as const, value: "500k+", label: "Retailers worldwide" },
            { icon: "calendar" as const, value: "Net 60", label: "Flexible payment terms" },
          ].map((metric) => (
            <div key={metric.label} className="grid min-h-40 place-items-center gap-2 border-t border-line p-6 text-center md:border-l md:border-t-0">
              <Icon name={metric.icon} className="text-olive" />
              <strong className="font-serif text-[34px] font-normal leading-none">{metric.value}</strong>
              <span className="text-xs text-muted">{metric.label}</span>
            </div>
          ))}
        </section>

        <section id="join" className="grid gap-7 bg-[linear-gradient(90deg,rgba(55,62,43,0.96),rgba(55,62,43,0.88)),url('https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1600&q=84')] bg-cover bg-center p-7 text-white md:grid-cols-[1fr_auto] md:items-center md:p-10 xl:px-20">
          <div>
            <h2 className="max-w-md font-serif text-[34px] font-normal leading-tight md:text-[38px]">Ready to grow your shelf with Zenvy?</h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/80">Join thousands of retailers finding the best independent brands in one place.</p>
          </div>
          <div className="grid gap-3 md:flex md:gap-5">
            <Button href="#start" variant="light">
              Get started
            </Button>
            <Button href="#brands" variant="outline">
              Browse brands
            </Button>
          </div>
        </section>
      </main>
    </>
  );
}
