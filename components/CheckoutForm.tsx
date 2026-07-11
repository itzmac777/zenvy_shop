"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { subscriptionPlans } from "@/data/catalog";

type CheckoutFormProps = {
  initialPlanId?: string;
};

export function CheckoutForm({ initialPlanId }: CheckoutFormProps) {
  const [planId, setPlanId] = useState(initialPlanId || subscriptionPlans[0]?.id || "");
  const [confirmed, setConfirmed] = useState(false);
  const selectedPlan = useMemo(() => subscriptionPlans.find((plan) => plan.id === planId) ?? subscriptionPlans[0], [planId]);

  if (confirmed) {
    return (
      <section className="border border-line bg-white/75 p-7 text-center shadow-soft md:p-10">
        <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted">Order received</p>
        <h1 className="mt-3 font-serif text-[42px] font-normal leading-none md:text-[58px]">We saved your order request.</h1>
        <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-muted">
          This is a confirmation state only. Payment capture and fulfillment will begin after the owner integrates a payment gateway and order backend.
        </p>
        <Button href="/" className="mt-7">
          Back to plans
        </Button>
      </section>
    );
  }

  return (
    <form
      className="grid gap-6 border border-line bg-white/75 p-5 shadow-soft md:p-7"
      onSubmit={(event) => {
        event.preventDefault();
        // TODO: integrate payment gateway (Stripe/SSLCommerz/bKash/etc.) and persist the order server-side.
        setConfirmed(true);
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold">
          Product
          <select value={planId} onChange={(event) => setPlanId(event.target.value)} className="min-h-11 border border-line bg-paper px-3 font-normal">
            {subscriptionPlans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name} - {plan.price}/{plan.billingPeriod}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Quantity / duration
          <select name="duration" className="min-h-11 border border-line bg-paper px-3 font-normal">
            <option>1 month x 1 account</option>
            <option>3 months x 1 account</option>
            <option>6 months x 1 account</option>
            <option>Custom quantity</option>
          </select>
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold">
          Delivery email
          <input required type="email" name="email" placeholder="you@example.com" className="min-h-11 border border-line bg-paper px-3 font-normal" />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Messaging app handle
          <input name="handle" placeholder="WhatsApp / Telegram / Messenger" className="min-h-11 border border-line bg-paper px-3 font-normal" />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-bold">
        Payment method
        <select name="payment" className="min-h-11 border border-line bg-paper px-3 font-normal">
          <option>Manual confirmation placeholder</option>
          <option>Stripe TODO</option>
          <option>SSLCommerz TODO</option>
          <option>bKash TODO</option>
        </select>
      </label>
      <label className="grid gap-2 text-sm font-bold">
        Order notes
        <textarea name="notes" rows={4} placeholder="Tell us anything we should know before delivery." className="border border-line bg-paper px-3 py-3 font-normal" />
      </label>
      <div className="grid gap-4 border-t border-line pt-5 md:grid-cols-[1fr_auto] md:items-center">
        <p className="text-[13px] leading-relaxed text-muted">
          Selected: <strong className="text-ink">{selectedPlan?.name}</strong>. Payment is not processed yet; gateway integration remains a TODO.
        </p>
        <button type="submit" className="inline-flex min-h-11 items-center justify-center border border-transparent bg-olive px-6 text-sm font-bold text-white shadow-[inset_0_-1px_0_rgba(0,0,0,0.16)] transition hover:-translate-y-px hover:bg-olive-dark">
          Place order request
        </button>
      </div>
    </form>
  );
}
