import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Upload, Sparkles, Check } from "lucide-react";
import { SIZES } from "@/lib/products";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/custom")({
  head: () => ({
    meta: [
      { title: "הדפסה בעיצוב אישי | Yahalom La Bait" },
      { name: "description", content: "העלו את התמונה שלכם, בחרו מידה, וראו תצוגה מקדימה דינמית של היצירה האישית שלכם על זכוכית פרימיום." },
      { property: "og:title", content: "הדפסה בעיצוב אישי | Yahalom La Bait" },
      { property: "og:description", content: "התמונה שלכם, ברמת גימור גלריה." },
    ],
  }),
  component: CustomPage,
});

const BASE = 750;

function CustomPage() {
  const [image, setImage] = useState<string | null>(null);
  const [sizeIdx, setSizeIdx] = useState(1);
  const fileRef = useRef<HTMLInputElement>(null);
  const add = useCart((s) => s.add);
  const size = SIZES[sizeIdx];
  const price = BASE + size.price;

  const onFile = (f?: File) => {
    if (!f) return;
    const url = URL.createObjectURL(f);
    setImage(url);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 md:px-8">
      <header className="text-center">
        <span className="text-xs uppercase tracking-[0.3em] text-rose-gold">הדפס בעיצוב אישי</span>
        <h1 className="mt-3 font-serif text-4xl md:text-6xl">היצירה שלכם, על זכוכית פרימיום</h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">העלו תמונה, בחרו מידה וקבלו תצוגה מקדימה. הצוות שלנו יבדוק את האיכות לפני ההדפסה ויחזור אליכם לאישור.</p>
      </header>

      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        {/* Preview */}
        <div className="relative">
          <div className="overflow-hidden rounded-2xl glass">
            <div className="relative aspect-[4/3] bg-card">
              {/* mock living room frame */}
              <div className="absolute inset-0 bg-gradient-to-b from-secondary to-card" />
              <div className="absolute inset-x-12 bottom-6 top-10 grid place-items-center">
                <div className="relative h-full w-full max-w-md rounded-md bg-card shadow-2xl ring-1 ring-rose-gold/40">
                  {image ? (
                    <img src={image} alt="תצוגה מקדימה" className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-center text-muted-foreground">
                      <div>
                        <Upload className="mx-auto h-10 w-10 text-rose-gold/60" />
                        <p className="mt-2 text-sm">העלו תמונה כדי לראות תצוגה מקדימה</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute -inset-px rounded-md ring-1 ring-white/10 pointer-events-none" />
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-background/60 to-transparent" />
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">המוצר הסופי — הדפסה דיגיטלית על זכוכית מחוסמת בעובי 6 מ"מ</p>
        </div>

        {/* Form */}
        <div>
          <div className="rounded-2xl glass p-6">
            <h3 className="font-serif text-xl">1. העלו את התמונה</h3>
            <p className="mt-1 text-sm text-muted-foreground">JPG / PNG · רזולוציה גבוהה (מומלץ 300 dpi)</p>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
            <button onClick={() => fileRef.current?.click()}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-rose-gold/40 bg-rose-gold/5 py-8 hover:border-rose-gold">
              <Upload className="h-5 w-5 text-rose-gold" />
              <span>{image ? "החלף תמונה" : "בחרו קובץ או גררו לכאן"}</span>
            </button>
          </div>

          <div className="mt-5 rounded-2xl glass p-6">
            <h3 className="font-serif text-xl">2. בחרו מידה</h3>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {SIZES.map((s, i) => (
                <button key={s.id} onClick={() => setSizeIdx(i)}
                  className={`rounded-xl border-2 px-3 py-3 text-sm transition ${sizeIdx === i ? "border-rose-gold bg-rose-gold/10 text-rose-gold" : "border-border hover:border-rose-gold/50"}`}>
                  <div className="font-medium">{s.label}</div>
                  <div className="text-xs text-muted-foreground">₪{BASE + s.price}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-2xl glass p-6">
            <h3 className="font-serif text-xl">3. סקירה והזמנה</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2"><Check className="h-4 w-4 text-rose-gold" />בדיקת איכות מקצועית של הקובץ</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-rose-gold" />תצוגת הוכחה (Proof) לפני ייצור</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-rose-gold" />זמן ייצור: 10–14 ימי עסקים</li>
            </ul>
            <div className="mt-5 flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">סה"כ</div>
                <div className="text-2xl font-semibold text-rose-gold">₪{price}</div>
              </div>
              <button
                disabled={!image}
                onClick={() => add({ productId: "custom-print", name: "הדפסה בעיצוב אישי", image: image!, sizeLabel: size.label, unitPrice: price })}
                className="rounded-full btn-rose px-6 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50 hover:btn-rose-hover">
                <span className="inline-flex items-center gap-2"><Sparkles className="h-4 w-4" /> הוסף לעגלה</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
