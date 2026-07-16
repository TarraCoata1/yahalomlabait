## Overview

14 items grouped into: **pricing (client + DB migration)**, **UI/content**, **design polish**, **image protection**, **footer cleanup**. Existing catalog, animations, SEO, schema, routes, Supabase RLS stay untouched.

Note on item #1: the sizes and pre-VAT prices you listed **already match** the current price sheet exactly (`src/lib/products.ts` and `app_private.size_price` in the DB). So #1 is a verification pass — the substantive change is #3 (add 20% VAT to all prices) and #2 (installation must be clearly visible).

Note on VAT: standard Israeli VAT is currently 18%, but you asked for **20% — I'll use 20% as specified**. Please confirm if you actually meant 18%.

---

## 1 — Pricing + VAT (single source of truth)

Rule: **displayed and charged price = round(base × 1.20)**. Applied consistently on client and server so cart, checkout, and the DB `place_order` function all agree — otherwise checkout will reject orders.

### Client (`src/lib/products.ts`)
Update `RECT_SIZES`, `SQUARE_SIZES`, `installationFee`, and `FROM_PRICE` to VAT-inclusive amounts:

```text
Rect:   15×20 300 · 20×30 420 · 30×40 480 · 30×45 480 · 40×60 540 · 40×80 600
        50×70 600 · 50×100 720 · 60×90 720 · 60×120 900 · 70×100 900 · 70×140 1140
        80×120 1020 · 80×160 1800 · 100×150 1560 · 100×200 2400
Square: 30×30 420 · 40×40 420 · 50×50 480 · 60×60 600 · 70×70 720 · 80×80 840
        90×90 960 · 100×100 1080
Install: ≤70×100 → 300  ·  above → 420
FROM_PRICE: 300
Shipping fee (<₪1500 subtotal): 49 → 59 (VAT-inclusive)
Free-shipping threshold: 1500 → 1800 (VAT-inclusive equivalent)
```

### Server (Supabase migration — replaces `app_private.size_price`, `installation_fee_for`, and the shipping branch inside `place_order`)
Same numbers, so any request the client sends round-trips cleanly. This is a schema-level function replacement, so a migration is required.

### Surfaces that read these already (no code change needed after the numbers update):
- `ProductCard`, `/product/$id`, `/custom`, `/shop`, `MiniCart`, `/checkout`, admin views, JSON-LD `Offer` price on product pages, order totals.

I'll grep once at the end for any hard-coded ₪ literal outside `products.ts` and normalize it.

---

## 2 — Installation visibility on ordering

- `/product/$id` and `/custom`: promote the installation toggle out of the small options list into a highlighted card ("התקנה מקצועית בבית" + calculated ₪ badge + tooltip explaining ≤70×100 → ₪300, אחרת ₪420).
- Cart line item: show "התקנה" as a separate sub-line under the product.

---

## 4 — Footer social links
Remove YouTube icon+link entirely. Keep Facebook, Instagram, TikTok, WhatsApp (already in place from earlier turn). No content changes elsewhere.

## 5 — Remove developer credits
Delete `TarraCoataCredit` from footer and any "Powered by" / "Built with Lovable" strings. The Lovable badge is toggled in project settings (not code) — I'll note this in the reply, since it can't be removed from source.

## 6 — About page — enrich the 4 info boxes
Each of the four boxes gets: a stronger one-line headline, a 2-sentence marketing paragraph, and a small stat/bullet triplet (e.g. "אחריות 5 שנים · ייצור בישראל · אקסטרה קליר 6 מ״מ"). Layout, spacing, animations preserved.

## 7 — Home light-mode elegant divider
Add a **very subtle** blush/warm-pink SVG wave separator between hero and USPBar, and a soft radial gradient wash behind the "Story" section. Only visible in light mode (`.dark:hidden`), tone ≈ `oklch(0.97 0.02 25 / 0.4)` — barely there, luxury feel. No layout shift; pure decorative `<svg aria-hidden>`.

## 8 — Product image cropping
Product cards and gallery currently use aggressive `object-cover`. Switch product-page main image to `object-contain` inside a fixed aspect ratio box with a subtle blurred background of the same image (so the whole artwork is visible without letterbox ugliness). Cards on shop/home stay `object-cover` for grid tidiness but with `object-position: center` and a taller aspect (4:5 instead of 4:3) so less is chopped.

## 9 — Casual image-theft protection
Add a reusable `<ProtectedImg>` component applied to product & gallery images:
- `onContextMenu={e=>e.preventDefault()}`
- `draggable={false}` + `-webkit-user-drag:none`
- CSS `pointer-events:none` on an absolutely-positioned transparent overlay div so long-press-save on mobile grabs the overlay, not the img
- `user-select:none`
- Optional faint diagonal watermark "יהלום לבית" repeating pattern at ~5% opacity on the product hero image only.

Not applied to hero/marketing images (those are meant to be shared).

## 10 — Pricing QA
After edits, run a script that:
- Reads `RECT_SIZES` + `SQUARE_SIZES` from `products.ts`
- Reads the SQL CASE from the migration
- Asserts every base × 1.20 matches both, and installation math matches for every size.

## 11–13 — Responsive / SEO / performance
No breaking changes. No route/meta/schema/sitemap edits. Images stay AVIF/WebP with existing preloads.

## 14 — Final QA
Playwright smoke: open /, /shop, /product/<first>, /custom, add-to-cart, /checkout — screenshot each, confirm totals match VAT-inclusive numbers and installation surfaces clearly.

---

## Files touched

- `src/lib/products.ts` — new prices, install fee, FROM_PRICE
- `src/lib/cart.ts` — shipping fee constant + threshold
- `src/components/site/Footer.tsx` — remove YouTube + TarraCoataCredit
- `src/components/site/TarraCoataCredit.tsx` — delete
- `src/routes/about.tsx` — enrich 4 boxes
- `src/routes/index.tsx` — soft divider + subtle light-mode wash
- `src/routes/product.$id.tsx` — installation card, ProtectedImg on hero, image `object-contain`
- `src/routes/custom.tsx` — installation card, ensure all sizes visible
- `src/routes/shop.tsx`, `src/components/site/ProductCard.tsx` — 4:5 aspect, ProtectedImg
- `src/routes/checkout.tsx` — verify totals math (should be automatic via cart)
- `src/components/site/ProtectedImg.tsx` — NEW
- **New migration**: `app_private.size_price`, `installation_fee_for`, shipping branch in `place_order` → VAT-inclusive figures

## Not touched (per your instructions)

Routes, canonical/OG/schema/sitemap/robots, RLS, auth, catalog/CMS wiring, `client.ts`, generated types, animations timing.

---

**Confirm to proceed. Please also confirm: 20% VAT (as written) or 18% (current Israeli statutory rate)?**