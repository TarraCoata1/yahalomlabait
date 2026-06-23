/**
 * Pricing rate sheet and installation logic for Yahalom La Bait.
 * Catalog data (categories + products) lives in the database — see `src/lib/catalog.ts`.
 */

export type Size = { id: string; label: string; price: number; w: number; h: number };

/** Rectangular sizes — absolute price in NIS */
export const RECT_SIZES: Size[] = [
  { id: "15x20",  label: "15×20 ס\"מ",   price: 250,  w: 15,  h: 20 },
  { id: "20x30",  label: "20×30 ס\"מ",   price: 350,  w: 20,  h: 30 },
  { id: "30x40",  label: "30×40 ס\"מ",   price: 400,  w: 30,  h: 40 },
  { id: "30x45",  label: "30×45 ס\"מ",   price: 400,  w: 30,  h: 45 },
  { id: "40x60",  label: "40×60 ס\"מ",   price: 450,  w: 40,  h: 60 },
  { id: "40x80",  label: "40×80 ס\"מ",   price: 500,  w: 40,  h: 80 },
  { id: "50x70",  label: "50×70 ס\"מ",   price: 500,  w: 50,  h: 70 },
  { id: "50x100", label: "50×100 ס\"מ",  price: 600,  w: 50,  h: 100 },
  { id: "60x90",  label: "60×90 ס\"מ",   price: 600,  w: 60,  h: 90 },
  { id: "60x120", label: "60×120 ס\"מ",  price: 750,  w: 60,  h: 120 },
  { id: "70x100", label: "70×100 ס\"מ",  price: 750,  w: 70,  h: 100 },
  { id: "80x120", label: "80×120 ס\"מ",  price: 850,  w: 80,  h: 120 },
  { id: "70x140", label: "70×140 ס\"מ",  price: 950,  w: 70,  h: 140 },
  { id: "100x150",label: "100×150 ס\"מ", price: 1300, w: 100, h: 150 },
  { id: "80x160", label: "80×160 ס\"מ",  price: 1500, w: 80,  h: 160 },
  { id: "100x200",label: "100×200 ס\"מ", price: 2000, w: 100, h: 200 },
];

/** Square sizes — absolute price in NIS */
export const SQUARE_SIZES: Size[] = [
  { id: "30x30",  label: "30×30 ס\"מ",   price: 350, w: 30,  h: 30 },
  { id: "40x40",  label: "40×40 ס\"מ",   price: 350, w: 40,  h: 40 },
  { id: "50x50",  label: "50×50 ס\"מ",   price: 400, w: 50,  h: 50 },
  { id: "60x60",  label: "60×60 ס\"מ",   price: 500, w: 60,  h: 60 },
  { id: "70x70",  label: "70×70 ס\"מ",   price: 600, w: 70,  h: 70 },
  { id: "80x80",  label: "80×80 ס\"מ",   price: 700, w: 80,  h: 80 },
  { id: "90x90",  label: "90×90 ס\"מ",   price: 800, w: 90,  h: 90 },
  { id: "100x100",label: "100×100 ס\"מ", price: 900, w: 100, h: 100 },
];

export const SIZES: Size[] = RECT_SIZES;
export const FROM_PRICE = 250;

export const installationFee = (size: Size): number => {
  const maxDim = Math.max(size.w, size.h);
  const minDim = Math.min(size.w, size.h);
  if (minDim <= 70 && maxDim <= 100) return 250;
  return 350;
};

// Re-export DB types for components that need a Product shape.
export type { Product, Category } from "@/lib/catalog";
