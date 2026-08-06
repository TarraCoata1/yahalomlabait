/**
 * Pricing rate sheet and installation logic for יהלום לבית.
 * ALL prices below are VAT-INCLUSIVE (20% VAT already baked in).
 * These figures MUST match app_private.size_price / installation_fee_for
 * in the Supabase migration; otherwise place_order will reject checkouts.
 * Catalog data (categories + products) lives in the database — see `src/lib/catalog.ts`.
 */

import type { Orientation } from "@/lib/catalog";

export type Size = { id: string; label: string; price: number; w: number; h: number };

/** Rectangular sizes — absolute price in NIS, VAT included */
export const RECT_SIZES: Size[] = [
  { id: "15x20",  label: "15×20 ס\"מ",   price: 300,  w: 15,  h: 20 },
  { id: "20x30",  label: "20×30 ס\"מ",   price: 420,  w: 20,  h: 30 },
  { id: "30x40",  label: "30×40 ס\"מ",   price: 480,  w: 30,  h: 40 },
  { id: "30x45",  label: "30×45 ס\"מ",   price: 480,  w: 30,  h: 45 },
  { id: "40x60",  label: "40×60 ס\"מ",   price: 540,  w: 40,  h: 60 },
  { id: "40x80",  label: "40×80 ס\"מ",   price: 600,  w: 40,  h: 80 },
  { id: "50x70",  label: "50×70 ס\"מ",   price: 600,  w: 50,  h: 70 },
  { id: "50x100", label: "50×100 ס\"מ",  price: 720,  w: 50,  h: 100 },
  { id: "60x90",  label: "60×90 ס\"מ",   price: 720,  w: 60,  h: 90 },
  { id: "60x120", label: "60×120 ס\"מ",  price: 900,  w: 60,  h: 120 },
  { id: "70x100", label: "70×100 ס\"מ",  price: 900,  w: 70,  h: 100 },
  { id: "80x120", label: "80×120 ס\"מ",  price: 1020, w: 80,  h: 120 },
  { id: "70x140", label: "70×140 ס\"מ",  price: 1140, w: 70,  h: 140 },
  { id: "100x150",label: "100×150 ס\"מ", price: 1560, w: 100, h: 150 },
  { id: "80x160", label: "80×160 ס\"מ",  price: 1800, w: 80,  h: 160 },
  { id: "100x200",label: "100×200 ס\"מ", price: 2400, w: 100, h: 200 },
];

/** Square sizes — absolute price in NIS, VAT included */
export const SQUARE_SIZES: Size[] = [
  { id: "30x30",  label: "30×30 ס\"מ",   price: 420,  w: 30,  h: 30 },
  { id: "40x40",  label: "40×40 ס\"מ",   price: 420,  w: 40,  h: 40 },
  { id: "50x50",  label: "50×50 ס\"מ",   price: 480,  w: 50,  h: 50 },
  { id: "60x60",  label: "60×60 ס\"מ",   price: 600,  w: 60,  h: 60 },
  { id: "70x70",  label: "70×70 ס\"מ",   price: 720,  w: 70,  h: 70 },
  { id: "80x80",  label: "80×80 ס\"מ",   price: 840,  w: 80,  h: 80 },
  { id: "90x90",  label: "90×90 ס\"מ",   price: 960,  w: 90,  h: 90 },
  { id: "100x100",label: "100×100 ס\"מ", price: 1080, w: 100, h: 100 },
];

/** Every size the workshop produces — rectangular first, then square. */
export const ALL_SIZES: Size[] = [...RECT_SIZES, ...SQUARE_SIZES];

export const FROM_PRICE = 300;

/** Orientation is the source of truth for which sizes an artwork can be ordered in. */
export const sizesFor = (orientation: Orientation): Size[] =>
  orientation === "square" ? SQUARE_SIZES : RECT_SIZES;

/** Lowest price available for an orientation ("starting from"). */
export const fromPriceFor = (orientation: Orientation): number => sizesFor(orientation)[0].price;

/** Derive the orientation a size belongs to (mirrors app_private.size_orientation). */
export const sizeOrientation = (sizeId: string): Orientation => {
  const [w, h] = sizeId.split("x");
  return w && h && w === h ? "square" : "rectangle";
};

/** Look up a size within its orientation; never returns a mismatched size. */
export const findSize = (orientation: Orientation, sizeId: string): Size | undefined =>
  sizesFor(orientation).find((s) => s.id === sizeId);

/** Installation fee — VAT included */
export const installationFee = (size: Size): number => {
  const maxDim = Math.max(size.w, size.h);
  const minDim = Math.min(size.w, size.h);
  if (minDim <= 70 && maxDim <= 100) return 300;
  return 420;
};

// Re-export DB types for components that need a Product shape.
export type { Product, Category, Orientation } from "@/lib/catalog";

