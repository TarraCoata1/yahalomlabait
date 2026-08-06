import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { productsQuery, type Orientation } from "@/lib/catalog";
import { ProductCard } from "@/components/site/ProductCard";
import { FROM_PRICE, SQUARE_SIZES, RECT_SIZES } from "@/lib/products";

type Copy = {
  heading: string;
  tagline: string;
  crumb: string;
  note: string;
};

const COPY: Record<Orientation, Copy> = {
  square: {
    heading: "יצירות מרובעות",
    tagline: "קולקציית תמונות זכוכית בפרופורציה מרובעת (1:1) — איזון מושלם לקירות מודרניים, פינות עיצוב וקומפוזיציות גלריה.",
    crumb: "יצירות מרובעות",
    note: `מידות מרובעות מ־30×30 ועד 100×100 ס״מ, החל מ־₪${SQUARE_SIZES[0].price}.`,
  },
  rectangle: {
    heading: "יצירות מלבניות",
    tagline: "קולקציית תמונות זכוכית בפרופורציה מלבנית — נוכחות אלגנטית לקירות גדולים, סלון, פינת אוכל ומסדרונות.",
    crumb: "יצירות מלבניות",
    note: `מידות מלבניות מ־15×20 ועד 100×200 ס״מ, החל מ־₪${RECT_SIZES[0].price}.`,
  },
};

export function OrientationCollection({ orientation }: { orientation: Orientation }) {
  const { data: products } = useSuspenseQuery(productsQuery);
  const copy = COPY[orientation];
  const [styles, setStyles] = useState<string[]>([]);

  const inCollection = useMemo(
    () => products.filter((p) => !p.isHidden && p.orientation === orientation),
    [products, orientation],
  );
  const allStyles = useMemo(
    () => Array.from(new Set(inCollection.map((p) => p.style).filter(Boolean))),
    [inCollection],
  );
  const filtered = useMemo(
    () => (styles.length ? inCollection.filter((p) => styles.includes(p.style)) : inCollection),
    [inCollection, styles],
  );

  const toggle = (v: string) =>
    setStyles((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
      <header className="mb-10">
        <nav aria-label="פירורי לחם" className="text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary">בית</Link> /{" "}
          <Link to="/shop" className="hover:text-primary">חנות</Link> /{" "}
          <span className="text-foreground">{copy.crumb}</span>
        </nav>
        <h1 className="mt-3 font-serif text-4xl md:text-5xl">{copy.heading}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{copy.tagline}</p>
      </header>

      <div className="mb-8 flex flex-wrap gap-2">
        <Link to="/shop" className="rounded-full glass px-4 py-2 text-sm transition hover:border-rose-gold/40">כל היצירות</Link>
        <Link
          to="/shop/square"
          className={`rounded-full px-4 py-2 text-sm transition ${orientation === "square" ? "btn-rose" : "glass hover:border-rose-gold/40"}`}
        >
          מרובעות
        </Link>
        <Link
          to="/shop/rectangle"
          className={`rounded-full px-4 py-2 text-sm transition ${orientation === "rectangle" ? "btn-rose" : "glass hover:border-rose-gold/40"}`}
        >
          מלבניות
        </Link>
      </div>

      {allStyles.length > 0 && (
        <div className="mb-8 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">סגנון:</span>
          {allStyles.map((s) => (
            <button
              key={s}
              onClick={() => toggle(s)}
              aria-pressed={styles.includes(s)}
              className={`rounded-full px-3 py-1.5 text-xs transition ${
                styles.includes(s) ? "btn-rose" : "border border-border hover:border-rose-gold"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <p className="mb-6 text-sm text-muted-foreground">{filtered.length} יצירות · {copy.note}</p>

      {filtered.length === 0 ? (
        <div className="rounded-2xl glass p-16 text-center text-muted-foreground">
          אין כרגע יצירות בקולקציה זו.{" "}
          <Link to="/shop" className="text-rose-gold hover:underline">לכל היצירות</Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}

      <p className="mt-8 text-xs text-muted-foreground">
        * המחירים החל מ־₪{FROM_PRICE} וכוללים מע״מ. כל יצירה נוצרה בפרופורציה קבועה ומוצגת במלואה — ללא חיתוך או מתיחה.
      </p>
    </div>
  );
}
