import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Orientation } from "@/lib/catalog";

export type CartAttachment = {
  path: string;
  name: string;
  size: number;
  type: string;
};

export type CartItem = {
  key: string;
  productId: string;
  sku: string;
  name: string;
  image: string;
  /** Canonical artwork format — carried end-to-end into the order. */
  orientation: Orientation;
  sizeId: string;
  sizeLabel: string;
  basePrice: number;
  screwColor: "silver" | "gold" | "black";
  screwColorLabel: string;
  withInstallation: boolean;
  installationFee: number;
  unitPrice: number;
  qty: number;
  attachments?: CartAttachment[];
};

type CartState = {
  items: CartItem[];
  open: boolean;
  add: (item: Omit<CartItem, "key" | "qty"> & { qty?: number }) => void;
  remove: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      open: false,
      add: (item) =>
        set((s) => {
          const key = `${item.productId}-${item.orientation}-${item.sizeId}-${item.screwColor}-${item.withInstallation ? "inst" : "noinst"}`;
          const existing = s.items.find((i) => i.key === key);
          const qty = item.qty ?? 1;
          const items = existing
            ? s.items.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i))
            : [...s.items, { ...item, key, qty }];
          return { items, open: true };
        }),
      remove: (key) => set((s) => ({ items: s.items.filter((i) => i.key !== key) })),
      setQty: (key, qty) =>
        set((s) => ({
          items: s.items.map((i) => (i.key === key ? { ...i, qty: Math.max(1, qty) } : i)),
        })),
      clear: () => set({ items: [] }),
      setOpen: (open) => set({ open }),
    }),
    {
      name: "ylb-cart",
      version: 3,
      migrate: () => ({ items: [], open: false } as unknown as CartState),
    },
  ),
);

export const cartTotal = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0);
export const cartCount = (items: CartItem[]) => items.reduce((s, i) => s + i.qty, 0);
export const cartInstallationTotal = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + (i.withInstallation ? i.installationFee * i.qty : 0), 0);
