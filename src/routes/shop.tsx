import { createFileRoute, Link } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useMemo, useState } from "react";
import { products, categories, SIZES, type CategoryId } from "@/lib/products";
import { ProductCard } from "@/components/site/ProductCard";

const CATS = ["modern", "landscape", "abstract", "kodesh", "custom"] as const;
const schema = z.object({
  cat: fallback(z.string(), "").default(""),
  sort: fallback(z.enum(["featured", "low", "high"]), "featured").default("featured"),
});

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "החנות | Yahalom La Bait" },
      { name: "description", content: "כל הקולקציה של תמונות הזכוכית — סננו לפי סגנון, צבע, מידה ומחיר." },
      { property: "og:title", content: "החנות | Yahalom La Bait" },
      { property: "og:description", content: "קולקציית תמונות זכוכית פרימיום." },
    ],
  }),
  validateSearch: zodValidator(schema),
  component: Shop,
});

function Shop() {
  const { cat, sort } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [maxPrice, setMaxPrice] = useState(2000);
  const [styles, setStyles] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);

  const allStyles = Array.from(new Set(products.map((p) => p.style)));
  const allColors = Array.from(new Set(products.flatMap((p) => p.colors)));

  const filtered = useMemo(() => {
    let list = [...products];
    if (cat) list = list.filter((p) => p.category === cat);
    if (styles.length) list = list.filter((p) => styles.includes(p.style));
    if (colors.length) list = list.filter((p) => p.colors.some((c) => colors.includes(c)));
    list = list.filter((p) => p.basePrice <= maxPrice);
    if (sort === "low") list.sort((a, b) => a.basePrice - b.basePrice);
    if (sort === "high") list.sort((a, b) => b.basePrice - a.basePrice);
    return list;
  }, [cat, sort, styles, colors, maxPrice]);

  const toggle = (arr: string[], v: string, set: (a: string[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const setCat = (c?: CategoryId) => navigate({ search: (p: z.infer<typeof schema>) => ({ ...p, cat: c }) });
  const activeCat = categories.find((c) => c.id === cat);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
      <header className="mb-10">
        <nav className="text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary">בית</Link> / <span className="text-foreground">חנות</span>
          {activeCat && <> / <span className="text-foreground">{activeCat.name}</span></>}
        </nav>
        <h1 className="mt-3 font-serif text-4xl md:text-5xl">{activeCat?.name ?? "כל היצירות"}</h1>
        <p className="mt-2 text-muted-foreground">{activeCat?.tagline ?? "קולקציית תמונות זכוכית פרימיום בהדפסה דיגיטלית מתקדמת"}</p>
      </header>

      {/* category pills */}
      <div className="mb-8 flex flex-wrap gap-2">
        <button onClick={() => setCat(undefined)} className={`rounded-full px-4 py-2 text-sm transition ${!cat ? "btn-rose" : "glass hover:border-rose-gold/40"}`}>הכל</button>
        {categories.map((c) => (
          <button key={c.id} onClick={() => setCat(c.id)} className={`rounded-full px-4 py-2 text-sm transition ${cat === c.id ? "btn-rose" : "glass hover:border-rose-gold/40"}`}>{c.name}</button>
        ))}
      </div>

      <div className="grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* Filters */}
        <aside className="space-y-6">
          <div className="rounded-2xl glass p-5">
            <h3 className="mb-3 font-serif text-lg">סגנון</h3>
            <div className="space-y-2">
              {allStyles.map((s) => (
                <label key={s} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input type="checkbox" checked={styles.includes(s)} onChange={() => toggle(styles, s, setStyles)}
                    className="h-4 w-4 accent-rose-gold" />
                  <span>{s}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="rounded-2xl glass p-5">
            <h3 className="mb-3 font-serif text-lg">צבעים</h3>
            <div className="flex flex-wrap gap-2">
              {allColors.map((c) => (
                <button key={c} onClick={() => toggle(colors, c, setColors)}
                  className={`rounded-full px-3 py-1 text-xs transition ${colors.includes(c) ? "btn-rose" : "border border-border hover:border-rose-gold"}`}>{c}</button>
              ))}
            </div>
          </div>
          <div className="rounded-2xl glass p-5">
            <h3 className="mb-3 font-serif text-lg">מחיר עד</h3>
            <input type="range" min={400} max={2000} step={50} value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-rose-gold" />
            <div className="mt-2 text-sm text-muted-foreground">₪{maxPrice}</div>
          </div>
        </aside>

        {/* Grid */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{filtered.length} יצירות</p>
            <select value={sort} onChange={(e) => navigate({ search: (p: z.infer<typeof schema>) => ({ ...p, sort: e.target.value as "featured" | "low" | "high" }) })}
              className="rounded-full bg-card border border-border px-4 py-2 text-sm">
              <option value="featured">מומלצים</option>
              <option value="low">מחיר: נמוך לגבוה</option>
              <option value="high">מחיר: גבוה לנמוך</option>
            </select>
          </div>
          {filtered.length === 0 ? (
            <div className="rounded-2xl glass p-16 text-center text-muted-foreground">לא נמצאו יצירות. נסו לשנות את הסינון.</div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
          <p className="mt-8 text-xs text-muted-foreground">* המחירים החל מ־ {SIZES[0].label}. מידות נוספות במחיר מעודכן בעמוד המוצר.</p>
        </section>
      </div>
    </div>
  );
}
