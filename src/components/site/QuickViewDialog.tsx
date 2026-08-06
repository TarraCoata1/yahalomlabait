import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { X, Plus, ArrowLeft } from "lucide-react";
import { aspectClass, type Product } from "@/lib/catalog";
import { sizesFor } from "@/lib/products";
import { trackAddToCart } from "@/lib/analytics";
import { useCart } from "@/lib/cart";
import { ProtectedImg } from "@/components/site/ProtectedImg";

export function QuickViewDialog({ product, onClose }: { product: Product; onClose: () => void }) {
  const add = useCart((s) => s.add);
  const [sizeIdx, setSizeIdx] = useState(0);
  const sizeList = sizesFor(product.orientation);
  const size = sizeList[sizeIdx] ?? sizeList[0];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleAdd = () => {
    add({
      productId: product.id,
      sku: product.sku ?? "",
      name: product.name,
      image: product.image,
      sizeId: size.id,
      sizeLabel: size.label,
      basePrice: size.price,
      screwColor: "silver",
      screwColorLabel: "כסוף",
      withInstallation: false,
      orientation: product.orientation,
      installationFee: 0,
      unitPrice: size.price,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-background/80 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`תצוגה מהירה — ${product.name}`}
    >
      <div
        className="relative w-full max-w-4xl overflow-hidden rounded-3xl glass-strong shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="סגור"
          className="absolute left-3 top-3 z-20 grid h-10 w-10 place-items-center rounded-full bg-background/80 backdrop-blur hover:bg-background"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid gap-0 md:grid-cols-2">
          <div className={`relative ${aspectClass(product.displayMode)} md:aspect-auto`}>
            <div
              aria-hidden
              className="absolute inset-0 scale-110 opacity-30 blur-2xl"
              style={{ backgroundImage: `url(${product.image})`, backgroundSize: "cover", backgroundPosition: "center" }}
            />
            <ProtectedImg
              src={product.image}
              alt={product.name}
              wrapperClassName="relative z-10 h-full w-full grid place-items-center p-6"
              className="max-h-full max-w-full object-contain drop-shadow-xl"
            />
          </div>

          <div className="flex flex-col p-6 md:p-8">
            <span className="text-xs uppercase tracking-[0.3em] text-rose-gold">{product.style}</span>
            <h2 className="mt-2 font-serif text-2xl md:text-3xl">{product.name}</h2>
            <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{product.description}</p>

            <div className="mt-5">
              <div className="mb-2 flex items-baseline justify-between">
                <h3 className="text-sm font-medium">מידה</h3>
                <span className="text-xs text-muted-foreground">{size.label} · ₪{size.price} כולל מע״מ</span>
              </div>
              <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
                {sizeList.slice(0, 9).map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => setSizeIdx(i)}
                    className={`rounded-lg border-2 px-2 py-2 text-xs transition ${
                      sizeIdx === i ? "border-rose-gold bg-rose-gold/10 text-rose-gold" : "border-border hover:border-rose-gold/50"
                    }`}
                  >
                    <div className="font-medium">{s.label}</div>
                    <div className="text-[10px] text-muted-foreground">₪{s.price}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-auto flex flex-col gap-2 pt-6">
              <button onClick={handleAdd} className="flex items-center justify-center gap-2 rounded-full btn-rose py-3 font-semibold hover:btn-rose-hover">
                <Plus className="h-4 w-4" /> הוסף לעגלה · ₪{size.price}
              </button>
              <Link
                to="/product/$id"
                params={{ id: product.slug }}
                onClick={onClose}
                className="flex items-center justify-center gap-2 rounded-full border border-border py-3 text-sm hover:border-rose-gold hover:text-rose-gold"
              >
                לעמוד המוצר המלא <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
