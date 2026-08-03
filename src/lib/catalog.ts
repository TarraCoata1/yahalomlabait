import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p4 from "@/assets/p4.jpg";
import p5 from "@/assets/p5.jpg";
import p6 from "@/assets/p6.jpg";
import p7 from "@/assets/p7.jpg";
import p8 from "@/assets/p8.jpg";
import catModern from "@/assets/cat-modern.jpg";
import catLandscape from "@/assets/cat-landscape.jpg";
import catAbstract from "@/assets/cat-abstract.jpg";
import catKodesh from "@/assets/cat-kodesh.jpg";
import catCustom from "@/assets/cat-custom.jpg";

/** Map of asset keys (stored in DB) → bundled asset URLs */
const ASSET_MAP: Record<string, string> = {
  p1, p2, p3, p4, p5, p6, p7, p8,
  catModern, catLandscape, catAbstract, catKodesh, catCustom,
};

export const ASSET_KEYS = Object.keys(ASSET_MAP);

export function resolveImage(key: string | null | undefined): string {
  if (!key) return "";
  if (key.startsWith("http") || key.startsWith("/") || key.startsWith("data:")) return key;
  return ASSET_MAP[key] ?? "";
}

/** Aspect-ratio presentation mode for a product image. */
export type DisplayMode = "square" | "landscape" | "portrait";

export const DISPLAY_MODES: { id: DisplayMode; label: string; ratio: string }[] = [
  { id: "portrait", label: "פורטרט (4:5)", ratio: "4 / 5" },
  { id: "square", label: "מרובע (1:1)", ratio: "1 / 1" },
  { id: "landscape", label: "לרוחב (4:3)", ratio: "4 / 3" },
];

export const DEFAULT_DISPLAY_MODE: DisplayMode = "portrait";

export function normalizeDisplayMode(v: string | null | undefined): DisplayMode {
  return v === "square" || v === "landscape" || v === "portrait" ? v : DEFAULT_DISPLAY_MODE;
}

/** Tailwind aspect utility for a display mode (used by every product image frame). */
export function aspectClass(mode: DisplayMode | string | null | undefined): string {
  switch (normalizeDisplayMode(mode as string)) {
    case "square":
      return "aspect-square";
    case "landscape":
      return "aspect-[4/3]";
    default:
      return "aspect-[4/5]";
  }
}

/** Intrinsic width/height hints matching the mode — prevents CLS. */
export function aspectDims(mode: DisplayMode | string | null | undefined): { width: number; height: number } {
  switch (normalizeDisplayMode(mode as string)) {
    case "square":
      return { width: 600, height: 600 };
    case "landscape":
      return { width: 640, height: 480 };
    default:
      return { width: 480, height: 600 };
  }
}

export type Category = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  image_key: string;
  image: string;
  is_active: boolean;
  sort_order: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  categoryId: string | null;
  categorySlug: string | null;
  style: string;
  colors: string[];
  image_key: string;
  image: string;
  bestSeller: boolean;
  isHidden: boolean;
  sort_order: number;
  sku: string;
  displayMode: DisplayMode;
};



type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  image_key: string;
  is_active: boolean;
  sort_order: number;
};

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category_id: string | null;
  style: string;
  colors: string[];
  image_key: string;
  best_seller: boolean;
  is_hidden: boolean;
  sort_order: number;
  sku: string | null;
  display_mode?: string | null;
  category?: { slug: string } | null;

};


function toCategory(r: CategoryRow): Category {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    tagline: r.tagline ?? "",
    image_key: r.image_key ?? "",
    image: resolveImage(r.image_key),
    is_active: r.is_active,
    sort_order: r.sort_order,
  };
}

function toProduct(r: ProductRow): Product {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description ?? "",
    categoryId: r.category_id,
    categorySlug: r.category?.slug ?? null,
    style: r.style ?? "",
    colors: r.colors ?? [],
    image_key: r.image_key ?? "",
    image: resolveImage(r.image_key),
    bestSeller: r.best_seller,
    isHidden: r.is_hidden,
    sort_order: r.sort_order,
    sku: r.sku ?? "",
    displayMode: normalizeDisplayMode(r.display_mode),

  };

}

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []).map((r) => toCategory(r as CategoryRow));
  },
});

export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from("products")
      .select("*, category:categories(slug)")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []).map((r) => toProduct(r as unknown as ProductRow));
  },
});

export const productQuery = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: async (): Promise<Product | null> => {
      const { data, error } = await supabase
        .from("products")
        .select("*, category:categories(slug)")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data ? toProduct(data as unknown as ProductRow) : null;
    },
  });
