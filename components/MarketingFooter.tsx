import Link from "next/link";
import { Icon } from "@/components/Icon";
import { trustBadges } from "@/data/catalog";

const footerLinks = [
  { label: "Plans", href: "/#plans" },
  { label: "Why Us", href: "/about" },
  { label: "Support", href: "/contact" },
  { label: "Terms & Refund", href: "/terms-refund" },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto grid max-w-[1400px] gap-8 px-5 py-9 md:grid-cols-[1fr_auto] md:px-7 xl:px-11">
        <div>
          <Link href="/" className="font-serif text-[34px] leading-none">
            Zenvy
          </Link>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">Affordable premium subscriptions with fast delivery, clear support, and replacement-first service terms.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {trustBadges.map((badge) => (
              <span key={badge.label} className="inline-flex min-h-8 items-center gap-2 border border-line bg-white/70 px-3 text-[12px] font-bold">
                <Icon name={badge.icon} className="h-4 w-4 text-olive" />
                {badge.label}
              </span>
            ))}
          </div>
        </div>
        <nav className="grid content-start gap-3 text-sm md:min-w-48">
          {footerLinks.map((link) => (
            <Link key={link.label} href={link.href} className="font-semibold">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
