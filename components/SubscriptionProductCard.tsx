import Image from "next/image";
import Link from "next/link";
import type { SubscriptionPlan } from "@/lib/types";

export function SubscriptionProductCard({ plan }: { plan: SubscriptionPlan }) {
  const ratingStars = "★".repeat(Math.round(plan.rating));

  return (
    <article className="group min-w-0">
      <Link href={`/plans/${plan.id}`} className="block overflow-hidden bg-[#efe8dd]">
        <Image
          src={plan.thumbnail}
          alt={plan.thumbnailAlt}
          width={1600}
          height={1600}
          className="aspect-square w-full object-cover transition duration-300 group-hover:brightness-[0.97]"
        />
      </Link>

      <div className="pt-3">
        <div className="flex items-start justify-between gap-3">
          <p className="truncate text-[9px] font-extrabold uppercase tracking-[0.13em] text-muted">{plan.provider}</p>
          <span className="inline-flex min-h-5 shrink-0 items-center whitespace-nowrap rounded-full bg-[#eee8dd] px-2 text-[9px] font-bold text-muted">
            {plan.badge}
          </span>
        </div>

        <Link href={`/plans/${plan.id}`} className="mt-1 block">
          <h3 className="font-serif text-[18px] font-normal leading-tight md:text-[20px]">{plan.name}</h3>
        </Link>

        <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-muted">{plan.shortDescription}</p>

        <div className="mt-2 flex items-center gap-1.5 text-[11px]" aria-label={`${plan.rating} out of 5 stars from ${plan.ratingCount} reviews`}>
          <span className="tracking-[0.08em] text-ink">{ratingStars}</span>
          <span className="text-muted">{plan.ratingCount}</span>
        </div>

        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <strong className="text-[18px] font-extrabold leading-none md:text-[20px]">{plan.price}</strong>
            <span className="ml-1 text-xs text-muted">/{plan.billingPeriod}</span>
          </div>
          <Link
            href={`/checkout?plan=${plan.id}`}
            className="inline-flex min-h-8 items-center justify-center border border-olive bg-olive px-4 text-[11px] font-bold text-white transition hover:-translate-y-px hover:bg-olive-dark"
          >
            Order
          </Link>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-bold text-muted">
          <span>Sold {plan.soldQuantity}</span>
          <span className="ml-auto inline-flex min-h-5 items-center rounded-full bg-[#eee8dd] px-2">Stock {plan.stockQuantity}</span>
        </div>
      </div>
    </article>
  );
}
