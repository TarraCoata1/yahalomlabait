import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useRef } from "react";
import { Upload, Sparkles, Check, Wrench } from "lucide-react";
import { SIZES, installationFee } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { pageSeoQuery, buildSeoHead } from "@/lib/page-seo";

export const Route = createFileRoute("/custom")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageSeoQuery("/custom")),
  head: ({ loaderData }) => buildSeoHead({ routePath: "/custom", seo: loaderData ?? null }),
  component: CustomPage,
});

// Custom-design surcharge (proof + file QA + revisions). VAT-inclusive.
const BASE = 900;

const SCREW_OPTIONS = [
  { id: "silver" as const, label: "כסוף", swatch: "linear-gradient(135deg, #e8e8ea 0%, #b8b8bd 50%, #9a9aa1 100%)" },
  { id: "gold" as const,   label: "זהב",  swatch: "linear-gradient(135deg, #f7e3a8 0%, #d4a85a 50%, #8c6a2d 100%)" },
  { id: "black" as const,  label: "שחור", swatch: "linear-gradient(135deg, #3a3a3c 0%, #1a1a1c 50%, #050505 100%)" },
];

function CustomPage() {
  const [image, setImage] = useState<string | null>(null);
  const [sizeIdx, setSizeIdx] = useState(1);
  const [screwColor, setScrewColor] = useState<"silver" | "gold" | "black">("silver");
  const [withInstall, setWithInstall] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const add = useCart((s) => s.add);
  const size = SIZES[sizeIdx];
  const basePrice = BASE + size.price;
  const installFee = useMemo(() => installationFee(size), [size]);
  const price = basePrice + (withInstall ? installFee : 0);
  const screw = SCREW_OPTIONS.find((s) => s.id === screwColor)!;

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

          {/* Screw color */}
          <div className="mt-5 rounded-2xl glass p-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-serif text-xl">3. צבע ברגי תליה</h3>
              <span className="text-xs text-muted-foreground">{screw.label}</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {SCREW_OPTIONS.map((opt) => (
                <button key={opt.id} onClick={() => setScrewColor(opt.id)} aria-label={`בורג ${opt.label}`} aria-pressed={screwColor === opt.id}
                  className={`flex items-center gap-2 rounded-full border-2 py-2 pl-4 pr-2 text-sm transition ${
                    screwColor === opt.id ? "border-rose-gold bg-rose-gold/10 text-rose-gold" : "border-border hover:border-rose-gold/50"
                  }`}>
                  <span className="h-6 w-6 rounded-full ring-1 ring-border shadow-inner" style={{ background: opt.swatch }} />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">ללא תוספת מחיר — בחירה בהתאמה לעיצוב החלל.</p>
          </div>

          {/* Installation upsell */}
          <label className={`mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 transition ${withInstall ? "border-rose-gold bg-rose-gold/5" : "border-border hover:border-rose-gold/50"}`}>
            <input type="checkbox" checked={withInstall} onChange={(e) => setWithInstall(e.target.checked)} className="mt-1 h-5 w-5 accent-rose-gold" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-rose-gold" />
                <span className="font-medium">הוסף התקנה מקצועית לבית</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                תיאום מועד, מדידה והרכבה על ידי מתקין מוסמך. למידות עד 70×100 ס״מ — ₪300 (כולל מע״מ).
              </p>
              <p className="mt-1 text-xs text-rose-gold/90">
                למידות מעל 70×100 ס״מ — ₪420 (כולל מע״מ).
              </p>
            </div>
            <div className="shrink-0 text-left">
              <div className="text-xs text-muted-foreground">תוספת</div>
              <div className="font-semibold text-rose-gold">+₪{installFee}</div>
            </div>
          </label>

          <div className="mt-5 rounded-2xl glass p-6">
            <h3 className="font-serif text-xl">4. סקירה והזמנה</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2"><Check className="h-4 w-4 text-rose-gold" />בדיקת איכות מקצועית של הקובץ</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-rose-gold" />תצוגת הוכחה (Proof) לפני ייצור</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-rose-gold" />זמן אספקה: עד 14 ימי עסקים</li>
            </ul>
            <div className="mt-5 flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">סה"כ (כולל מע״מ)</div>
                <div className="text-2xl font-semibold text-rose-gold">₪{price}</div>
                {withInstall && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    הדפסה ₪{basePrice} + התקנה ₪{installFee}
                  </div>
                )}
              </div>
              <button
                disabled={!image}
                onClick={() => add({ productId: "custom-print", sku: "CUSTOM", name: "הדפסה בעיצוב אישי", image: image!, sizeId: size.id, sizeLabel: size.label, basePrice, screwColor, screwColorLabel: screw.label, withInstallation: withInstall, installationFee: withInstall ? installFee : 0, unitPrice: price })}
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
