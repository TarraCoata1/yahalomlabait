import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CreditCard, Lock, Apple, Check } from "lucide-react";
import { useCart, cartTotal } from "@/lib/cart";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "תשלום | Yahalom La Bait" },
      { name: "description", content: "השלמת ההזמנה — תשלום מאובטח באשראי, Apple Pay ו־Google Pay." },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const { items, clear } = useCart();
  const total = cartTotal(items);
  const shipping = total > 1500 ? 0 : 49;
  const grand = total + shipping;
  const [done, setDone] = useState(false);
  const [method, setMethod] = useState<"card" | "apple" | "google">("card");
  const navigate = useNavigate();

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full btn-rose"><Check className="h-8 w-8" /></div>
        <h1 className="mt-6 font-serif text-3xl">תודה על ההזמנה!</h1>
        <p className="mt-3 text-muted-foreground">קיבלנו את הפרטים. נציג ייצור קשר תוך 24 שעות לאישור ופירוט תהליך הייצור.</p>
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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    clear();
    setDone(true);
    setTimeout(() => navigate({ to: "/" }), 6000);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
      <h1 className="font-serif text-3xl md:text-4xl">תשלום</h1>
      <p className="mt-2 text-sm text-muted-foreground"><Lock className="inline h-3 w-3" /> תשלום מאובטח ב־SSL</p>

      <form onSubmit={submit} className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <section className="rounded-2xl glass p-6">
            <h2 className="font-serif text-xl">פרטי קשר</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="שם מלא" required />
              <Field label="טלפון" type="tel" required />
              <Field label="אימייל" type="email" required className="sm:col-span-2" />
            </div>
          </section>

          <section className="rounded-2xl glass p-6">
            <h2 className="font-serif text-xl">כתובת למשלוח</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="רחוב ומספר" required className="sm:col-span-2" />
              <Field label="עיר" required />
              <Field label="מיקוד" />
              <Field label="הערות למשלוח" className="sm:col-span-2" />
            </div>
          </section>

          <section className="rounded-2xl glass p-6">
            <h2 className="font-serif text-xl">אמצעי תשלום</h2>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { id: "card", label: "אשראי", icon: CreditCard },
                { id: "apple", label: "Apple Pay", icon: Apple },
                { id: "google", label: "Google Pay", icon: CreditCard },
              ].map((m) => (
                <button key={m.id} type="button" onClick={() => setMethod(m.id as typeof method)}
                  className={`flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm transition ${method === m.id ? "border-rose-gold bg-rose-gold/10 text-rose-gold" : "border-border hover:border-rose-gold/50"}`}>
                  <m.icon className="h-4 w-4" /> {m.label}
                </button>
              ))}
            </div>
            {method === "card" && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="מספר כרטיס" placeholder="1234 5678 9012 3456" required className="sm:col-span-2" />
                <Field label="תוקף" placeholder="MM/YY" required />
                <Field label="CVV" placeholder="123" required />
              </div>
            )}
            {method !== "card" && (
              <p className="mt-4 text-sm text-muted-foreground">לחיצה על "השלם תשלום" תפתח את {method === "apple" ? "Apple Pay" : "Google Pay"}.</p>
            )}
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl glass p-6">
            <h2 className="font-serif text-xl">סיכום ההזמנה</h2>
            <ul className="mt-4 space-y-3 max-h-72 overflow-y-auto">
              {items.map((it) => (
                <li key={it.key} className="flex gap-3">
                  <img src={it.image} alt="" className="h-14 w-14 shrink-0 rounded-md object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm">{it.name}</div>
                    <div className="text-xs text-muted-foreground">{it.sizeLabel} · ×{it.qty}</div>
                  </div>
                  <div className="text-sm font-medium">₪{it.unitPrice * it.qty}</div>
                </li>
              ))}
            </ul>
            <div className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
              <Row label="סכום ביניים" value={`₪${total}`} />
              <Row label="משלוח" value={shipping === 0 ? "חינם" : `₪${shipping}`} />
              <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
                <span className="font-medium">סה"כ לתשלום</span>
                <span className="text-2xl font-semibold text-rose-gold">₪{grand}</span>
              </div>
            </div>
            <button type="submit" className="mt-5 w-full rounded-full btn-rose py-4 font-semibold hover:btn-rose-hover">
              השלם תשלום · ₪{grand}
            </button>
            <p className="mt-3 text-center text-xs text-muted-foreground">בלחיצה אתם מאשרים את <a href="#" className="text-rose-gold hover:underline">תנאי הרכישה</a></p>
          </div>
        </aside>
      </form>
    </div>
  );
}

function Field({ label, className = "", ...rest }: { label: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs text-muted-foreground">{label}</span>
      <input {...rest} className="w-full rounded-lg border border-border bg-input/50 px-3 py-2.5 outline-none focus:border-rose-gold" />
    </label>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between text-muted-foreground"><span>{label}</span><span className="text-foreground">{value}</span></div>;
}
