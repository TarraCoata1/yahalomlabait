import { Link } from "@tanstack/react-router";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart, cartTotal } from "@/lib/cart";

export function MiniCart() {
  const { items, open, setOpen, remove, setQty } = useCart();
  const total = cartTotal(items);

  return (
    <>
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-50 bg-background/70 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-full max-w-md flex-col glass-strong transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}
        aria-hidden={!open}
      >
        <header className="flex items-center justify-between border-b border-border/50 px-6 py-5">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-rose-gold" />
            <h2 className="font-serif text-xl">העגלה שלך</h2>
          </div>
          <button onClick={() => setOpen(false)} aria-label="סגור" className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
              <ShoppingBag className="mb-3 h-10 w-10 text-rose-gold/60" />
              <p>העגלה שלך ריקה</p>
              <Link to="/shop" onClick={() => setOpen(false)} className="mt-4 text-sm text-primary hover:underline">
                המשך לקנייה
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((it) => (
                <li key={it.key} className="flex gap-3 rounded-xl bg-card/50 p-3">
                  <img src={it.image} alt="" className="h-20 w-20 shrink-0 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate font-medium">{it.name}</h3>
                        <p className="text-xs text-muted-foreground">{it.sizeLabel}</p>
                        <p className="text-xs text-muted-foreground">
                          ברגי תליה: <span className="text-foreground/80">{it.screwColorLabel}</span>
                        </p>
                        {it.withInstallation && (
                          <p className="text-xs text-rose-gold/90">כולל התקנה מקצועית (+₪{it.installationFee})</p>
                        )}
                        {it.sku && <p className="text-[10px] font-mono text-muted-foreground/70" dir="ltr">SKU: {it.sku}</p>}
                      </div>
                      <button onClick={() => remove(it.key)} aria-label={`הסר ${it.name}`} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-1 rounded-full border border-border/60">
                        <button onClick={() => setQty(it.key, it.qty - 1)} aria-label="הפחת כמות" className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary"><Minus className="h-3 w-3" /></button>
                        <span aria-live="polite" className="w-6 text-center text-sm">{it.qty}</span>
                        <button onClick={() => setQty(it.key, it.qty + 1)} aria-label="הוסף כמות" className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary"><Plus className="h-3 w-3" /></button>
                      </div>
                      <div className="font-semibold text-rose-gold">₪{it.unitPrice * it.qty}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

          )}
        </div>

        {items.length > 0 && (
          <footer className="border-t border-border/50 px-6 py-5 space-y-3">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>סה"כ ביניים</span>
              <span className="font-semibold text-foreground">₪{total}</span>
            </div>
            <Link to="/checkout" onClick={() => setOpen(false)}
              className="block w-full rounded-full btn-rose py-3 text-center font-semibold hover:btn-rose-hover">
              למעבר לתשלום
            </Link>
            <button onClick={() => setOpen(false)} className="block w-full text-center text-sm text-muted-foreground hover:text-foreground">
              המשך בקנייה
            </button>
          </footer>
        )}
      </aside>
    </>
  );
}
