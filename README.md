# Zenvy Subscription Store

This project has been reshaped into a subscription reseller storefront while preserving the existing Next.js, Tailwind, typography, palette, component, and layout conventions.

## Required Environment Variables

Copy `.env.example` to `.env.local` and fill in real values before enabling live integrations.

- `OPENAI_API_KEY`: required only when generating final image assets through the OpenAI Images API.
- `STRIPE_SECRET_KEY`, `SSLCOMMERZ_STORE_ID`, `SSLCOMMERZ_STORE_PASSWORD`, `BKASH_APP_KEY`, `BKASH_APP_SECRET`: placeholders for future payment gateway integration.

Payment capture is intentionally not implemented yet. The checkout form includes a `TODO` comment for integrating Stripe, SSLCommerz, bKash, or another approved gateway.

## Image Generation Notes

Generated storefront assets live in `public/images/subscriptions/` and are wired into the homepage, product cards, plan detail pages, and testimonial cards.

Current asset set:

- `hero-banner.png`: photorealistic lifestyle hero showing premium digital subscriptions made simple.
- `trust-customer.png`: satisfied customer image with subtle verified delivery visuals.
- `secure-support.png`: abstract secure checkout and 24/7 support illustration.
- `avatar-a.png`, `avatar-b.png`, `avatar-c.png`: generic testimonial placeholder avatars that must be replaced with approved real customer imagery before presenting testimonials as real.
- `thumb-ai-chat.png`, `thumb-streaming-standard.png`, `thumb-streaming-premium.png`, `thumb-video-music.png`: brand-neutral product thumbnails.

Use `OPENAI_API_KEY` only when regenerating or adding image assets through the OpenAI Images API. Keep product thumbnails brand-neutral; do not recreate official ChatGPT, Netflix, or YouTube logos or trademarked marks.
