"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { paymentMethods, type PaymentMethodId } from "@zenvy/shared/orders";
import type { SubscriptionPlan } from "@zenvy/shared/types";

function PaymentLogo({ method }: { method: PaymentMethodId }) {
  if (method === "bkash") {
    return (
      <span className="grid h-9 w-[58px] shrink-0 place-items-center rounded-[6px] bg-[#e2136e] text-[12px] font-extrabold text-white">
        bKash
      </span>
    );
  }

  return (
    <span className="grid h-9 w-[58px] shrink-0 grid-cols-[22px_1fr] items-center rounded-[6px] bg-[#111111] px-2 text-white">
      <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-[12px] font-extrabold text-[#111111]">G</span>
      <span className="text-[11px] font-extrabold">Pay</span>
    </span>
  );
}

export function PlanOrderPanel({ plan }: { plan: SubscriptionPlan }) {
  const [quantity, setQuantity] = useState(1);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const [captchaCode, setCaptchaCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>("gmpay");
  const ratingStars = "★".repeat(Math.round(plan.rating));

  const refreshCaptcha = () => {
    setCaptchaCode(String(Math.floor(1000 + Math.random() * 9000)));
    setCaptchaAnswer("");
    setCaptchaError("");
  };

  useEffect(() => {
    refreshCaptcha();
  }, []);

  const updateQuantity = (nextQuantity: number) => {
    setQuantity(Math.max(1, Math.min(plan.stockQuantity, nextQuantity)));
  };

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="border border-line bg-white/78 p-5 shadow-soft md:p-6">
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
          <span className="inline-flex min-h-6 items-center gap-1 border border-line bg-panel px-2">
            <Icon name="refresh" className="h-3.5 w-3.5" />
            Automatic delivery
          </span>
          <span className="inline-flex min-h-6 items-center rounded-full bg-[#eee8dd] px-2">{plan.soldQuantity} sold</span>
          <span className="inline-flex min-h-6 items-center rounded-full bg-white px-2 text-muted">Stock {plan.stockQuantity}</span>
          <span className="inline-flex min-h-6 items-center rounded-full border border-line px-2 text-muted">{plan.badge}</span>
        </div>

        <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.12em] text-muted">{plan.provider}</p>
        <h1 className="mt-2 font-serif text-[42px] font-normal leading-none md:text-[54px]">{plan.name}</h1>
        <p className="mt-4 text-[14px] leading-relaxed text-muted">{plan.description}</p>

        <div className="mt-4 flex items-center gap-2 text-[12px]" aria-label={`${plan.rating} out of 5 stars from ${plan.ratingCount} reviews`}>
          <span className="tracking-[0.08em]">{ratingStars}</span>
          <span className="text-muted">{plan.ratingCount} reviews</span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 border-y border-line py-5 text-sm">
          <div>
            <span className="block text-muted">Price</span>
            <strong className="font-serif text-3xl font-normal">{plan.price}</strong>
            <span className="ml-1 text-xs text-muted">/{plan.billingPeriod}</span>
          </div>
          <div>
            <span className="block text-muted">Availability</span>
            <strong>{plan.stockQuantity > 0 ? "In stock" : "Sold out"}</strong>
          </div>
        </div>

        <form
          action="/api/orders"
          method="post"
          className="mt-5 grid gap-4"
          onSubmit={(event) => {
            if (!captchaCode || captchaAnswer.trim() !== captchaCode) {
              event.preventDefault();
              setCaptchaError("Enter the image verification code to continue.");
            }
          }}
        >
          <input type="hidden" name="plan" value={plan.id} />

          <label className="grid gap-1.5 text-sm font-bold">
            Contact information
            <input required name="contact" type="text" placeholder="Email or messaging app handle" className="min-h-10 border border-line bg-paper px-3 font-normal outline-none focus:border-olive" />
          </label>

          <label className="grid gap-1.5 text-sm font-bold">
            Order lookup password
            <input name="orderPassword" type="password" placeholder="Set a password for order inquiry" className="min-h-10 border border-line bg-paper px-3 font-normal outline-none focus:border-olive" />
          </label>

          <div className="grid gap-2">
            <p className="text-sm font-bold">Payment method</p>
            <div className="grid gap-2">
              {paymentMethods.map((method) => (
                <label
                  key={method.id}
                  className={`grid cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border p-3 transition ${
                    paymentMethod === method.id ? "border-olive bg-white" : "border-line bg-panel/60"
                  }`}
                >
                  <PaymentLogo method={method.id} />
                  <span className="min-w-0">
                    <span className="block text-sm font-bold">{method.title}</span>
                    <span className="block text-[12px] leading-relaxed text-muted">{method.label}</span>
                  </span>
                  <input
                    type="radio"
                    name="method"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={() => setPaymentMethod(method.id)}
                    className="h-4 w-4 accent-olive"
                  />
                </label>
              ))}
            </div>
          </div>

          <label className="grid gap-1.5 text-sm font-bold">
            Human-machine verification
            <span className="grid grid-cols-[minmax(0,1fr)_88px_40px]">
              <input
                required
                name="captcha"
                type="text"
                inputMode="numeric"
                value={captchaAnswer}
                onChange={(event) => {
                  setCaptchaAnswer(event.target.value);
                  setCaptchaError("");
                }}
                placeholder="Image verification code"
                className="min-h-10 border border-r-0 border-line bg-paper px-3 font-normal outline-none focus:border-olive"
              />
              <span className="grid min-h-10 select-none place-items-center border border-[#ff8bd0] bg-[#fff2fa] text-[22px] font-extrabold tracking-[0.08em] text-[#ff69c7] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.8)] [font-style:italic]">
                {captchaCode || "----"}
              </span>
              <button type="button" onClick={refreshCaptcha} className="grid min-h-10 place-items-center border border-l-0 border-line bg-panel text-sm font-bold" aria-label="Refresh captcha">
                ↻
              </button>
            </span>
            {captchaError ? <span className="text-[12px] font-bold text-[#8a3f34]">{captchaError}</span> : null}
          </label>

          <div className="grid gap-2">
            <span className="text-sm font-bold">Purchase quantity</span>
            <div className="inline-grid w-[138px] grid-cols-[36px_1fr_36px] border border-line bg-panel">
              <button type="button" onClick={() => updateQuantity(quantity - 1)} className="min-h-9 border-r border-line text-sm font-bold" aria-label="Decrease quantity">
                -
              </button>
              <input
                name="quantity"
                type="number"
                min="1"
                max={plan.stockQuantity}
                value={quantity}
                onChange={(event) => updateQuantity(Number(event.target.value) || 1)}
                className="min-h-9 bg-transparent px-2 text-center text-sm font-bold outline-none"
              />
              <button type="button" onClick={() => updateQuantity(quantity + 1)} className="min-h-9 border-l border-line text-sm font-bold" aria-label="Increase quantity">
                +
              </button>
            </div>
          </div>

          <div className="grid gap-2">
            <p className="text-sm font-bold">Quantity pricing</p>
            <div className="grid grid-cols-2 border border-line text-sm">
              <div className="border-b border-r border-line bg-panel px-3 py-2 text-xs font-extrabold uppercase tracking-[0.08em] text-muted">Quantity</div>
              <div className="border-b border-line bg-panel px-3 py-2 text-xs font-extrabold uppercase tracking-[0.08em] text-muted">Unit price</div>
              {[1, 3, 6, 12].map((quantityOption) => (
                <div key={quantityOption} className="contents">
                  <div className="border-r border-line px-3 py-2">{quantityOption}</div>
                  <div className="px-3 py-2 font-bold">{plan.price}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <button type="submit" className="inline-flex min-h-11 items-center justify-center border border-transparent bg-olive px-6 text-sm font-bold text-white shadow-[inset_0_-1px_0_rgba(0,0,0,0.16)] transition hover:-translate-y-px hover:bg-olive-dark">
              Start Order
            </button>
            <Link href="/contact" className="inline-flex min-h-11 items-center justify-center border border-[#9f988c] bg-white/70 px-6 text-sm font-bold text-ink transition hover:-translate-y-px hover:bg-white">
              Ask support
            </Link>
          </div>
        </form>
      </div>
    </aside>
  );
}
