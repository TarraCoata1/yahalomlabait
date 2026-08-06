/**
 * Lightweight dataLayer/gtag event helper.
 * Every product-scoped event carries `orientation` — the canonical artwork
 * format — so reports can segment square vs. rectangle without guessing
 * from image display settings.
 */
import type { Orientation } from "@/lib/catalog";

type Payload = Record<string, unknown>;

export function trackEvent(event: string, payload: Payload = {}) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { dataLayer?: Payload[] };
  w.dataLayer = w.dataLayer ?? [];
  w.dataLayer.push({ event, ...payload });
}

export function trackAddToCart(item: {
  sku?: string;
  name: string;
  orientation: Orientation;
  sizeId: string;
  unitPrice: number;
  withInstallation?: boolean;
}) {
  trackEvent("add_to_cart", {
    item_sku: item.sku ?? "",
    item_name: item.name,
    orientation: item.orientation,
    size_id: item.sizeId,
    value: item.unitPrice,
    with_installation: Boolean(item.withInstallation),
    currency: "ILS",
  });
}

export function trackCollectionView(orientation: Orientation, count: number) {
  trackEvent("view_item_list", { item_list_id: `shop_${orientation}`, orientation, item_count: count });
}
