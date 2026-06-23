import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, ShieldCheck, Truck, Sparkles, Wrench } from "lucide-react";
import hero from "@/assets/hero-living-room.jpg";
import { getProduct, RECT_SIZES, SQUARE_SIZES, installationFee, products } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { ProductCard } from "@/components/site/ProductCard";

export const Route = createFileRoute("/product/$id")({
  loader: ({ params }) => {
    const product = getProduct(params.id);
    if (!product) throw notFound();
    return product;
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [
      { title: `${loaderData.name} | Yahalom La Bait` },
      { name: "description", content: loaderData.description },
      { property: "og:title", content: `${loaderData.name} | Yahalom La Bait` },
      { property: "og:description", content: loaderData.description },
      { property: "og:image", content: loaderData.image },
    ] : [],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="font-serif text-3xl">המוצר לא נמצא</h1>
      <Link to="/shop" className="mt-6 inline-block text-rose-gold hover:underline">חזרה לחנות</Link>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const product = Route.useLoaderData();
  const [shape, setShape] = useState<"rect" | "square">("rect");
  const [sizeIdx, setSizeIdx] = useState(0);
  const [screwColor, setScrewColor] = useState<"silver" | "gold" | "black">("silver");
  const [withInstall, setWithInstall] = useState(false);
  const [tab, setTab] = useState<"specs" | "shipping">("specs");
  const [activeMedia, setActiveMedia] = useState(0);
  const add = useCart((s) => s.add);

  const SCREW_OPTIONS = [
    { id: "silver" as const, label: "כסוף", swatch: "linear-gradient(135deg, #e8e8ea 0%, #b8b8bd 50%, #9a9aa1 100%)" },
    { id: "gold" as const, label: "זהב", swatch: "linear-gradient(135deg, #f7e3a8 0%, #d4a85a 50%, #8c6a2d 100%)" },
    { id: "black" as const, label: "שחור", swatch: "linear-gradient(135deg, #3a3a3c 0%, #1a1a1c 50%, #050505 100%)" },
  ];
  const screw = SCREW_OPTIONS.find((s) => s.id === screwColor)!;

  const sizeList = shape === "rect" ? RECT_SIZES : SQUARE_SIZES;
  const size = sizeList[sizeIdx] ?? sizeList[0];
  const installFee = useMemo(() => installationFee(size), [size]);
  const total = size.price + (withInstall ? installFee : 0);

  const media = [product.image, hero];
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  const switchShape = (s: "rect" | "square") => {
    setShape(s);
    setSizeIdx(0);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
      <nav className="mb-6 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-primary">בית</Link> /{" "}
        <Link to="/shop" className="hover:text-primary">חנות</Link> /{" "}
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="relative overflow-hidden rounded-2xl glass">
            <img src={media[activeMedia]} alt={product.name} className="aspect-[4/5] w-full object-cover" />
            <span className="absolute bottom-3 right-3 rounded-full bg-background/70 px-3 py-1 text-[11px] tracking-wider text-rose-gold backdrop-blur">
              {activeMedia === 0 ? "תצוגת אמנות" : "תצוגה בסלון"}
            </span>
          </div>
          <div className="mt-4 flex gap-3">
            {media.map((m, i) => (
              <button key={i} onClick={() => setActiveMedia(i)}
                className={`overflow-hidden rounded-lg border-2 transition ${activeMedia === i ? "border-rose-gold" : "border-transparent"}`}>
                <img src={m} alt="" className="h-20 w-20 object-cover" />
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">תצוגה: היצירה ממוסגרת בזכוכית פרימיום, וסצנת חיים בחלל אמיתי.</p>
        </div>

        {/* Details */}
        <div>
          <span className="text-xs uppercase tracking-[0.3em] text-rose-gold">{product.style}</span>
          <h1 className="mt-2 font-serif text-4xl md:text-5xl">{product.name}</h1>
          <div className="mt-4 flex items-baseline gap-3">
            <div className="text-3xl font-semibold text-rose-gold">₪{total}</div>
            <span className="text-sm text-muted-foreground">כולל מע"מ</span>
          </div>
          {withInstall && (
            <div className="mt-1 text-xs text-muted-foreground">
              הדפסה ₪{size.price} + התקנה מקצועית ₪{installFee}
            </div>
          )}

          <p className="mt-6 leading-relaxed text-muted-foreground">{product.description}</p>

          {/* Shape toggle */}
          <div className="mt-8">
            <h3 className="mb-3 font-medium">פורמט</h3>
            <div className="inline-flex rounded-full glass p-1">
              <button onClick={() => switchShape("rect")}
                className={`rounded-full px-5 py-2 text-sm transition ${shape === "rect" ? "btn-rose" : "text-muted-foreground hover:text-foreground"}`}>
                מלבני
              </button>
              <button onClick={() => switchShape("square")}
                className={`rounded-full px-5 py-2 text-sm transition ${shape === "square" ? "btn-rose" : "text-muted-foreground hover:text-foreground"}`}>
                ריבועי
              </button>
            </div>
          </div>

          {/* Sizes */}
          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-medium">בחר מידה</h3>
              <span className="text-xs text-muted-foreground">{size.label} · ₪{size.price}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {sizeList.map((s, i) => (
                <button key={s.id} onClick={() => setSizeIdx(i)}
                  className={`rounded-xl border-2 px-3 py-3 text-sm transition ${sizeIdx === i ? "border-rose-gold bg-rose-gold/10 text-rose-gold" : "border-border hover:border-rose-gold/50"}`}>
                  <div className="font-medium">{s.label}</div>
                  <div className="text-xs text-muted-foreground">₪{s.price}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Screw color */}
          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-medium">צבע ברגי תליה</h3>
              <span className="text-xs text-muted-foreground">{screw.label}</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {SCREW_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setScrewColor(opt.id)}
                  aria-label={`בורג ${opt.label}`}
                  aria-pressed={screwColor === opt.id}
                  className={`flex items-center gap-2 rounded-full border-2 py-2 pl-4 pr-2 text-sm transition ${
                    screwColor === opt.id
                      ? "border-rose-gold bg-rose-gold/10 text-rose-gold"
                      : "border-border hover:border-rose-gold/50"
                  }`}
                >
                  <span
                    className="h-6 w-6 rounded-full ring-1 ring-border shadow-inner"
                    style={{ background: opt.swatch }}
                  />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">ללא תוספת מחיר — בחירה בהתאמה לעיצוב החלל.</p>
          </div>

          {/* Installation upsell */}
          <label className={`mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 transition ${withInstall ? "border-rose-gold bg-rose-gold/5" : "border-border hover:border-rose-gold/50"}`}>
            <input
              type="checkbox"
              checked={withInstall}
              onChange={(e) => setWithInstall(e.target.checked)}
              className="mt-1 h-5 w-5 accent-rose-gold"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-rose-gold" />
                <span className="font-medium">הוסף התקנה מקצועית לבית</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                תיאום מועד, מדידה והרכבה על ידי מתקין מוסמך. למידות עד 70×100 — ₪250, מעבר לכך — ₪350.
              </p>
            </div>
            <div className="shrink-0 text-left">
              <div className="text-xs text-muted-foreground">תוספת</div>
              <div className="font-semibold text-rose-gold">+₪{installFee}</div>
            </div>
          </label>

          <button
            onClick={() =>
              add({
                productId: product.id,
                name: product.name,
                image: product.image,
                sizeLabel: `${size.label} · ברגים ${screw.label}${withInstall ? " · כולל התקנה" : ""}`,
                unitPrice: total,
              })
            }
            className="mt-6 w-full rounded-full btn-rose py-4 font-semibold hover:btn-rose-hover">
            הוסף לעגלה · ₪{total}
          </button>

          <div className="mt-6 grid gap-3 sm:grid-cols-3 text-sm">
            <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-rose-gold" /><span className="text-muted-foreground">זכוכית אקסטרה קלירית</span></div>
            <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-rose-gold" /><span className="text-muted-foreground">משלוח מבוטח</span></div>
            <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-rose-gold" /><span className="text-muted-foreground">אחריות 5 שנים</span></div>
          </div>

          {/* Tabs */}
          <div className="mt-10 border-t border-border pt-6">
            <div className="flex gap-6 text-sm">
              <button onClick={() => setTab("specs")} className={`pb-2 ${tab === "specs" ? "border-b-2 border-rose-gold text-rose-gold" : "text-muted-foreground"}`}>פרטי המוצר</button>
              <button onClick={() => setTab("shipping")} className={`pb-2 ${tab === "shipping" ? "border-b-2 border-rose-gold text-rose-gold" : "text-muted-foreground"}`}>משלוחים והחזרות</button>
            </div>
            <div className="mt-5 space-y-3 text-sm text-muted-foreground">
              {tab === "specs" ? (
                <>
                  <p className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-rose-gold" />זכוכית מחוסמת אקסטרה קלירית בעובי 6 מ"מ</p>
                  <p className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-rose-gold" />הדפסה דיגיטלית בטכנולוגיית UV — עמידה בדהייה</p>
                  <p className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-rose-gold" />מערכת תליה סמויה הכלולה במחיר</p>
                  <p className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-rose-gold" />ליטוש קצוות מקצועי וגימור פרימיום</p>
                </>
              ) : (
                <>
                  <p>זמן ייצור: 7–10 ימי עסקים. משלוח עד הבית בכל הארץ באריזה הרמטית ומבוטחת.</p>
                  <p>החזרה תוך 14 ימים על מוצרי מדף. הדפסות בעיצוב אישי אינן ניתנות להחזרה.</p>
                  <p>לתאום הובלה והרכבה בבית — סמנו "הוסף התקנה מקצועית" או צרו קשר בוואטסאפ.</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="mb-8 font-serif text-2xl md:text-3xl">יצירות נוספות מהקטגוריה</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
