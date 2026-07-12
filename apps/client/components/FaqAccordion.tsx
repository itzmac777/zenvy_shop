"use client";

import { useState } from "react";

const faqs = [
  {
    question: "How fast will my subscription be delivered?",
    answer: "Most orders are reviewed and queued quickly after payment confirmation. Replace this placeholder with your exact delivery window before launch.",
  },
  {
    question: "What happens if a subscription stops working?",
    answer: "The storefront currently promises a replacement-first support policy. The owner should finalize exact warranty limits and eligibility rules.",
  },
  {
    question: "Which payment methods are accepted?",
    answer: "Payment gateway integration is still a TODO. Add Stripe, SSLCommerz, bKash, bank transfer, or other approved methods before accepting live orders.",
  },
  {
    question: "Can I get a refund?",
    answer: "Refund and replacement terms are placeholder policy text and must be reviewed by the site owner before publication.",
  },
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="grid border border-line bg-white/70 shadow-soft">
      {faqs.map((item, index) => (
        <div key={item.question} className="border-b border-line last:border-b-0">
          <button
            type="button"
            aria-expanded={openIndex === index}
            onClick={() => setOpenIndex((current) => (current === index ? -1 : index))}
            className="flex min-h-16 w-full items-center justify-between gap-4 px-5 text-left text-sm font-bold md:px-6"
          >
            <span>{item.question}</span>
            <span className="font-serif text-2xl font-normal">{openIndex === index ? "-" : "+"}</span>
          </button>
          {openIndex === index ? <p className="px-5 pb-5 text-[14px] leading-relaxed text-muted md:px-6">{item.answer}</p> : null}
        </div>
      ))}
    </div>
  );
}
