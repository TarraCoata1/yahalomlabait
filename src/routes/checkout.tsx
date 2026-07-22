import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Lock, Check, Truck, Store, Loader2 } from "lucide-react";
import { useCart, cartTotal, cartInstallationTotal } from "@/lib/cart";
import { siteSettingsQuery, type PaymentMethodConfig } from "@/lib/site-settings";
import { pageSeoQuery, buildSeoHead } from "@/lib/page-seo";
import type { Json } from "@/integrations/supabase/types";

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageSeoQuery("/checkout")),
  head: ({ loaderData }) => buildSeoHead({ routePath: "/checkout", seo: loaderData ?? null }),
  component: Checkout,
});

type FulfillmentType = "shipping" | "pickup";

function Checkout() {
  const { items, clear } = useCart();
  const { data: settings } = useQuery(siteSettingsQuery);
  const navigate = useNavigate();

  const enabledMethods: PaymentMethodConfig[] = useMemo(
    () => (settings?.payment_methods ?? []).filter((m) => m.enabled && m.id !== "online"),
    [settings],
  );
  const pickupEnabled = !!settings?.pickup_enabled;

  const subtotal = cartTotal(items);
  const installationFee = cartInstallationTotal(items);
  const productSubtotal = subtotal - installationFee;

  const [fulfillment, setFulfillment] = useState<FulfillmentType>("shipping");
  const shippingFee = fulfillment === "pickup" ? 0 : productSubtotal > 1800 ? 0 : 59;
  const total = subtotal + shippingFee;

  const [method, setMethod] = useState<string>("");
  const selected = enabledMethods.find((m) => m.id === method) ?? null;

  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    street: "", city: "", zip: "", notes: "",
  });
  const setField = <K extends keyof typeof form>(k: K, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<null | { method: PaymentMethodConfig | null; orderNumber: number | null }>(null);

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full btn-rose"><Check className="h-8 w-8" aria-hidden /></div>
        <h1 className="mt-6 font-serif text-3xl">תודה על ההזמנה!</h1>
        {done.orderNumber != null && (
          <p className="mt-2 text-sm text-muted-foreground">מספר הזמנה: <span className="font-mono text-foreground" dir="ltr">#{done.orderNumber}</span></p>
        )}
        <p className="mt-3 text-muted-foreground">קיבלנו את הפרטים. נציג יצור איתך קשר בהקדם לאישור ולהמשך תהליך הייצור.</p>
        {done.method?.instructions && (
          <div className="mt-6 rounded-2xl glass p-5 text-right">
            <div className="text-xs uppercase tracking-widest text-rose-gold">אמצעי התשלום שבחרת</div>
            <div className="mt-1 font-medium">{done.method.label}</div>
            <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line">{done.method.instructions}</p>
          </div>
        )}
        <Link to="/" className="mt-8 inline-block rounded-full btn-rose px-6 py-3 font-semibold">חזרה לבית</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-serif text-3xl">העגלה ריקה</h1>
        <Link to="/shop" className="mt-6 inline-block rounded-full btn-rose px-6 py-3 font-semibold">לחנות</Link>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) { toast.error("בחר אמצעי תשלום"); return; }
    if (fulfillment === "shipping" && (!form.street.trim() || !form.city.trim())) {
      toast.error("יש למלא כתובת למשלוח"); return;
    }
    setSubmitting(true);
    try {
      const address = fulfillment === "shipping"
        ? { street: form.street.trim(), city: form.city.trim(), zip: form.zip.trim() }
        : null;

      const itemsPayload = items.map((it) => ({
        product_id: it.productId,
        size_id: it.sizeId,
        size_label: it.sizeLabel,
        screw_color: it.screwColor,
        with_installation: it.withInstallation,
        quantity: it.qty,
        customization: {
          screw_color_label: it.screwColorLabel,
          attachments: it.attachments ?? [],
        },
      }));

      const rpcRes = await (supabase.rpc as unknown as (
        fn: string,
        args: Record<string, unknown>,
      ) => Promise<{ data: Array<{ order_id: string; order_number: number }> | null; error: { message: string } | null }>)("place_order", {
        _items: itemsPayload as unknown as Json,
        _customer: {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
        } as unknown as Json,
        _payment_method: selected.id,
        _payment_meta: { method_label: selected.label } as unknown as Json,
        _fulfillment: fulfillment,
        _shipping_address: (address ?? {}) as unknown as Json,
        _notes: form.notes.trim() || "",
      });


      if (rpcRes.error) throw rpcRes.error;
      const row = Array.isArray(rpcRes.data) ? rpcRes.data[0] : rpcRes.data;
      const orderNumber: number | null = (row?.order_number as number | undefined) ?? null;

      clear();
      setDone({ method: selected, orderNumber });
      setTimeout(() => navigate({ to: "/" }), 10000);

    } catch (err) {
      toast.error("שגיאה בשליחת ההזמנה: " + (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
      <h1 className="font-serif text-3xl md:text-4xl">השלמת הזמנה</h1>
      <p className="mt-2 text-sm text-muted-foreground"><Lock className="inline h-3 w-3" aria-hidden /> החיבור מאובטח ב־SSL</p>

      <form onSubmit={submit} className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <section aria-labelledby="contact-h" className="rounded-2xl glass p-6">
            <h2 id="contact-h" className="font-serif text-xl">פרטי קשר</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="שם מלא" required value={form.name} onChange={(v) => setField("name", v)} autoComplete="name" />
              <Field label="טלפון" type="tel" required value={form.phone} onChange={(v) => setField("phone", v)} autoComplete="tel" />
              <Field label="אימייל" type="email" required className="sm:col-span-2" value={form.email} onChange={(v) => setField("email", v)} autoComplete="email" />
            </div>
          </section>

          <section aria-labelledby="fulfill-h" className="rounded-2xl glass p-6">
            <h2 id="fulfill-h" className="font-serif text-xl">שיטת אספקה</h2>
            <div className={`mt-4 grid gap-2 ${pickupEnabled ? "sm:grid-cols-2" : ""}`} role="radiogroup" aria-labelledby="fulfill-h">
              <FulfillmentOption
                selected={fulfillment === "shipping"}
                onClick={() => setFulfillment("shipping")}
                icon={Truck}
                title="משלוח מבוטח"
                subtitle={productSubtotal > 1800 ? "משלוח חינם להזמנה זו" : "₪59 · חינם מעל ₪1,800"}
              />
              {pickupEnabled && (
                <FulfillmentOption
                  selected={fulfillment === "pickup"}
                  onClick={() => setFulfillment("pickup")}
                  icon={Store}
                  title="איסוף עצמי"
                  subtitle={settings?.pickup_address || "ללא עלות"}
                />
              )}
            </div>
            {fulfillment === "shipping" && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="רחוב ומספר" required className="sm:col-span-2" value={form.street} onChange={(v) => setField("street", v)} autoComplete="street-address" />
                <Field label="עיר" required value={form.city} onChange={(v) => setField("city", v)} autoComplete="address-level2" />
                <Field label="מיקוד" value={form.zip} onChange={(v) => setField("zip", v)} autoComplete="postal-code" />
                <Field label="הערות למשלוח" className="sm:col-span-2" value={form.notes} onChange={(v) => setField("notes", v)} />
              </div>
            )}
            {fulfillment === "pickup" && settings?.pickup_instructions && (
              <p className="mt-4 whitespace-pre-line text-sm text-muted-foreground">{settings.pickup_instructions}</p>
            )}
          </section>

          <section aria-labelledby="pay-h" className="rounded-2xl glass p-6">
            <h2 id="pay-h" className="font-serif text-xl">אמצעי תשלום</h2>
            {enabledMethods.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">אין כרגע אמצעי תשלום פעילים. יש לפנות אלינו לביצוע ההזמנה.</p>
            ) : (
              <div className="mt-4 grid gap-2 sm:grid-cols-3" role="radiogroup" aria-labelledby="pay-h">
                {enabledMethods.map((m) => (
                  <button key={m.id} type="button" role="radio" aria-checked={method === m.id} onClick={() => setMethod(m.id)}
                    className={`flex flex-col items-start gap-1 rounded-xl border-2 p-4 text-right text-sm transition ${method === m.id ? "border-rose-gold bg-rose-gold/10" : "border-border hover:border-rose-gold/50"}`}>
                    <span className="font-medium">{m.label}</span>
                    {m.instructions && <span className="text-xs text-muted-foreground line-clamp-2">{m.instructions}</span>}
                  </button>
                ))}
              </div>
            )}
            {selected?.instructions && (
              <div className="mt-4 rounded-xl bg-card/60 border border-border p-4 text-sm text-muted-foreground whitespace-pre-line">
                {selected.instructions}
              </div>
            )}
            <p className="mt-4 text-[11px] text-muted-foreground">
              ההזמנה תישמר במערכת בסטטוס "ממתין לתשלום". נציג יצור איתך קשר לאישור התשלום ולתחילת הייצור.
            </p>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl glass p-6">
            <h2 className="font-serif text-xl">סיכום ההזמנה</h2>
            <ul className="mt-4 space-y-3 max-h-80 overflow-y-auto">
              {items.map((it) => (
                <li key={it.key} className="flex gap-3">
                  <img src={it.image} alt="" className="h-14 w-14 shrink-0 rounded-md object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm">{it.name}</div>
                    <div className="text-xs text-muted-foreground">{it.sizeLabel} · ברגי {it.screwColorLabel} · ×{it.qty}</div>
                    {it.withInstallation && <div className="text-xs text-rose-gold/90">כולל התקנה מקצועית</div>}
                    {it.attachments && it.attachments.length > 0 && (
                      <div className="text-xs text-rose-gold/90">{it.attachments.length} קבצים מצורפים</div>
                    )}
                    {it.sku && <div className="text-[10px] font-mono text-muted-foreground/70" dir="ltr">SKU: {it.sku}</div>}
                  </div>
                  <div className="text-sm font-medium">₪{it.unitPrice * it.qty}</div>
                </li>
              ))}
            </ul>
            <div className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
              <Row label="מוצרים" value={`₪${productSubtotal}`} />
              {installationFee > 0 && <Row label="התקנה מקצועית" value={`₪${installationFee}`} />}
              <Row label={fulfillment === "pickup" ? "איסוף עצמי" : "משלוח"} value={shippingFee === 0 ? "חינם" : `₪${shippingFee}`} />
              <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
                <span className="font-medium">סה"כ לתשלום</span>
                <span className="text-2xl font-semibold text-rose-gold">₪{total}</span>
              </div>
            </div>
            <button type="submit" disabled={submitting || !selected}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full btn-rose py-4 font-semibold hover:btn-rose-hover disabled:opacity-60">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              {submitting ? "שולח…" : `שלח הזמנה · ₪${total}`}
            </button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              בשליחת ההזמנה אתם מאשרים את <Link to="/terms" className="text-rose-gold hover:underline">תנאי הרכישה</Link>.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}

function FulfillmentOption({
  selected, onClick, icon: Icon, title, subtitle,
}: {
  selected: boolean; onClick: () => void;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string; subtitle: string;
}) {
  return (
    <button type="button" role="radio" aria-checked={selected} onClick={onClick}
      className={`flex items-start gap-3 rounded-xl border-2 p-4 text-right transition ${selected ? "border-rose-gold bg-rose-gold/10" : "border-border hover:border-rose-gold/50"}`}>
      <Icon className="mt-0.5 h-5 w-5 text-rose-gold" aria-hidden />
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">{subtitle}</div>
      </div>
    </button>
  );
}

function Field({
  label, className = "", value, onChange, ...rest
}: {
  label: string; className?: string; value?: string; onChange?: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs text-muted-foreground">{label}{rest.required && <span className="text-rose-gold"> *</span>}</span>
      <input {...rest} value={value} onChange={(e) => onChange?.(e.target.value)}
        className="w-full rounded-lg border border-border bg-input/50 px-3 py-2.5 outline-none focus:border-rose-gold" />
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between text-muted-foreground"><span>{label}</span><span className="text-foreground">{value}</span></div>;
}
