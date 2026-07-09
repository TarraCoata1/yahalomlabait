import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const ORDER_STATUSES = [
  "pending_payment",
  "under_review",
  "customer_contact",
  "in_production",
  "completed",
  "cancelled",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = ["pending", "paid", "refunded", "failed"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_METHODS = ["bank_transfer", "bit", "cash", "online"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: "ממתין לתשלום",
  under_review: "בבדיקה",
  customer_contact: "יצירת קשר",
  in_production: "בייצור",
  completed: "הושלם",
  cancelled: "בוטל",
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  pending: "ממתין",
  paid: "שולם",
  refunded: "הוחזר",
  failed: "נכשל",
};

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  bank_transfer: "העברה בנקאית",
  bit: "ביט",
  cash: "מזומן",
  online: "אונליין",
};

export type OrderRow = {
  id: string;
  order_number: number;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  currency: string;
  subtotal: number;
  shipping_fee: number;
  installation_fee: number;
  discount: number;
  total: number;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  fulfillment_type: string | null;
  notes: string | null;
  admin_notes: string | null;
  created_at: string;
};

export const adminOrdersQuery = queryOptions({
  queryKey: ["admin_orders"],
  queryFn: async (): Promise<OrderRow[]> => {
    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, order_number, status, payment_method, payment_status, currency, subtotal, shipping_fee, installation_fee, discount, total, customer_name, customer_email, customer_phone, fulfillment_type, notes, admin_notes, created_at",
      )
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as OrderRow[];
  },
  staleTime: 15_000,
});
