# Nobi — Streetwear Storefront

A modern React storefront for a fictional streetwear house. Built with Vite, React Router, and a browser-persisted cart.

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp`.

## Supabase account setup

The storefront and cart work without Supabase. Login and account creation require a Supabase project.

Add these values to your local `.env` file and to your deployment provider's environment variables:

- `VITE_SUPABASE_URL`: your Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY`: your project's publishable key

For older Supabase projects, `VITE_SUPABASE_ANON_KEY` is also accepted as a fallback.

Never commit your real `.env` file or service-role key. Only use a browser-safe publishable/anon key in this frontend.

## Pages

Home, shop, product details, lookbook, about, bag, login, and checkout.

Checkout is a UI demo only: it does not process payments or submit real orders.


## Cinematic intro

The home intro is a lightweight, stylized camera sequence that reveals Egypt and then Cairo before handing off to the storefront. It is not Google Earth footage. The native Earth Studio camera setup notes, timing, coordinates, and export guidance are in [`docs/nobi-earth-studio-shot-plan.md`](docs/nobi-earth-studio-shot-plan.md).
