import { createFileRoute, Link } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useMemo, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { FROM_PRICE } from "@/lib/products";
import { categoriesQuery, productsQuery, ORIENTATIONS, orientationPath, type Orientation } from "@/lib/catalog";
import { ProductCard } from "@/components/site/ProductCard";
import { breadcrumbSchema } from "@/lib/seo";
import { pageSeoQuery, buildSeoHead } from "@/lib/page-seo";

const schema = z.object({
  cat: fallback(z.string(), "").default(""),
  orient: fallback(z.enum(["all", "square", "rectangle"]), "all").default("all"),
  sort: fallback(z.enum(["featured", "low", "high"]), "featured").default("featured"),
});

export const Route = createFileRoute("/shop")({
  head: ({ loaderData }) =>
    buildSeoHead({
      routePath: "/shop",
      seo: loaderData?.[0] ?? null,
      extraScripts: [breadcrumbSchema([{ name: "בית", path: "/" }, { name: "חנות", path: "/shop" }])],
    }),
  validateSearch: zodValidator(schema),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(pageSeoQuery("/shop")),
      context.queryClient.ensureQueryData(categoriesQuery),
      context.queryClient.ensureQueryData(productsQuery),
    ]),
  component: Shop,
});

function Shop() {
  const { cat, sort, orient } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data: categories } = useSuspenseQuery(categoriesQuery);
  const { data: products } = useSuspenseQuery(productsQuery);
  const [styles, setStyles] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);

  const allStyles = useMemo(() => Array.from(new Set(products.map((p) => p.style).filter(Boolean))), [products]);
  const allColors = useMemo(() => Array.from(new Set(products.flatMap((p) => p.colors))), [products]);

  const filtered = useMemo(() => {
    let list = products.filter((p) => !p.isHidden);
    if (orient !== "all") list = list.filter((p) => p.orientation === orient);
    if (cat) list = list.filter((p) => p.categorySlug === cat);
    if (styles.length) list = list.filter((p) => styles.includes(p.style));
    if (colors.length) list = list.filter((p) => p.colors.some((c) => colors.includes(c)));
    if (sort === "low") list.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "high") list.sort((a, b) => b.name.localeCompare(a.name));
    return list;
  }, [cat, orient, sort, styles, colors, products]);

  const toggle = (arr: string[], v: string, set: (a: string[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const setOrient = (o: "all" | Orientation) =>
    navigate({ to: ".", search: (p: z.infer<typeof schema>) => ({ ...p, orient: o }) });
  const setCat = (c?: string) => navigate({ search: (p: z.infer<typeof schema>) => ({ ...p, cat: c ?? "" }) });
  const activeCat = categories.find((c) => c.slug === cat);

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
        <Link to="/shop/square" className="rounded-full glass px-4 py-2 text-sm transition hover:border-rose-gold/40">מרובעות</Link>
        <Link to="/shop/rectangle" className="rounded-full glass px-4 py-2 text-sm transition hover:border-rose-gold/40">מלבניות</Link>
        <button onClick={() => setCat(undefined)} className={`rounded-full px-4 py-2 text-sm transition ${!cat ? "btn-rose" : "glass hover:border-rose-gold/40"}`}>הכל</button>
        {categories.filter((c) => c.is_active).map((c) => (
          <button key={c.id} onClick={() => setCat(c.slug)} className={`rounded-full px-4 py-2 text-sm transition ${cat === c.slug ? "btn-rose" : "glass hover:border-rose-gold/40"}`}>{c.name}</button>
        ))}
      </div>

      <div className="grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* Filters */}
        <aside className="space-y-6">
          <div className="rounded-2xl glass p-5">
            <h3 className="mb-3 font-serif text-lg">פורמט היצירה</h3>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setOrient("all")} aria-pressed={orient === "all"}
                className={`rounded-full px-3 py-1.5 text-xs transition ${orient === "all" ? "btn-rose" : "border border-border hover:border-rose-gold"}`}>הכל</button>
              {ORIENTATIONS.map((o) => (
                <button key={o.id} onClick={() => setOrient(o.id)} aria-pressed={orient === o.id}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition ${orient === o.id ? "btn-rose" : "border border-border hover:border-rose-gold"}`}>
                  <span aria-hidden className="block w-3 rounded border border-current opacity-70" style={{ aspectRatio: o.ratio }} />
                  {o.label}
                </button>
              ))}
            </div>
            {orient !== "all" && (
              <Link to={orientationPath(orient)} className="mt-3 inline-block text-xs text-rose-gold hover:underline">
                לעמוד הקולקציה המלא
              </Link>
            )}
          </div>

          {allStyles.length > 0 && (
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
          )}
          {allColors.length > 0 && (
            <div className="rounded-2xl glass p-5">
              <h3 className="mb-3 font-serif text-lg">צבעים</h3>
              <div className="flex flex-wrap gap-2">
                {allColors.map((c) => (
                  <button key={c} onClick={() => toggle(colors, c, setColors)}
                    className={`rounded-full px-3 py-1 text-xs transition ${colors.includes(c) ? "btn-rose" : "border border-border hover:border-rose-gold"}`}>{c}</button>
                ))}
              </div>
            </div>
          )}
          <div className="rounded-2xl glass p-5 text-sm text-muted-foreground">
            <h3 className="mb-2 font-serif text-lg text-foreground">מחיר</h3>
            <p>המחירים מתחילים מ־₪{FROM_PRICE} ומשתנים לפי המידה שנבחרה. לכל יצירה פורמט קבוע (מרובע או מלבני) עם טבלת המידות המתאימה, וניתן להוסיף התקנה מקצועית בעמוד המוצר.</p>
          </div>
        </aside>

        {/* Grid */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{filtered.length} יצירות</p>
            <select value={sort} onChange={(e) => navigate({ search: (p: z.infer<typeof schema>) => ({ ...p, sort: e.target.value as "featured" | "low" | "high" }) })}
              className="rounded-full bg-card border border-border px-4 py-2 text-sm">
              <option value="featured">מומלצים</option>
              <option value="low">א׳-ת׳</option>
              <option value="high">ת׳-א׳</option>
            </select>
          </div>
          {filtered.length === 0 ? (
            <div className="rounded-2xl glass p-16 text-center text-muted-foreground">לא נמצאו יצירות. נסו לשנות את הסינון.</div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
          <p className="mt-8 text-xs text-muted-foreground">* המחירים החל מ־₪{FROM_PRICE} (מידה 15×20). המידות הזמינות נגזרות מפורמט היצירה, והתקנה מקצועית ניתנת להוספה בעמוד המוצר.</p>
        </section>
      </div>
    </div>
  );
}
