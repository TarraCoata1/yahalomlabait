import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Check, ShieldCheck, Truck, Sparkles } from "lucide-react";
import hero from "@/assets/hero-living-room.jpg";
import { getProduct, SIZES, products } from "@/lib/products";
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
  const [sizeIdx, setSizeIdx] = useState(0);
  const [tab, setTab] = useState<"specs" | "shipping">("specs");
  const [activeMedia, setActiveMedia] = useState(0);
  const add = useCart((s) => s.add);

  const size = SIZES[sizeIdx];
  const price = product.basePrice + size.price;
  const media = [product.image, hero, product.image];

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

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
          <div className="overflow-hidden rounded-2xl glass">
            <img src={media[activeMedia]} alt={product.name} className="aspect-[4/5] w-full object-cover" />
          </div>
          <div className="mt-4 flex gap-3">
            {media.map((m, i) => (
              <button key={i} onClick={() => setActiveMedia(i)}
                className={`overflow-hidden rounded-lg border-2 transition ${activeMedia === i ? "border-rose-gold" : "border-transparent"}`}>
                <img src={m} alt="" className="h-20 w-20 object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div>
          <span className="text-xs uppercase tracking-[0.3em] text-rose-gold">{product.style}</span>
          <h1 className="mt-2 font-serif text-4xl md:text-5xl">{product.name}</h1>
          <div className="mt-4 flex items-baseline gap-3">
            <div className="text-3xl font-semibold text-rose-gold">₪{price}</div>
            <span className="text-sm text-muted-foreground">כולל מע"מ</span>
          </div>

          <p className="mt-6 leading-relaxed text-muted-foreground">{product.description}</p>

          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-medium">בחר מידה</h3>
              <span className="text-xs text-muted-foreground">{size.label}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {SIZES.map((s, i) => (
                <button key={s.id} onClick={() => setSizeIdx(i)}
                  className={`rounded-xl border-2 px-3 py-3 text-sm transition ${sizeIdx === i ? "border-rose-gold bg-rose-gold/10 text-rose-gold" : "border-border hover:border-rose-gold/50"}`}>
                  <div className="font-medium">{s.label}</div>
                  <div className="text-xs text-muted-foreground">₪{product.basePrice + s.price}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => add({ productId: product.id, name: product.name, image: product.image, sizeLabel: size.label, unitPrice: price })}
            className="mt-8 w-full rounded-full btn-rose py-4 font-semibold hover:btn-rose-hover">
            הוסף לעגלה · ₪{price}
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
                  <p>לתאום הובלה והרכבה בבית — צרו קשר בוואטסאפ.</p>
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
