import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import type { Product } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { SIZES } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    add({
      productId: product.id,
      name: product.name,
      image: product.image,
      sizeLabel: SIZES[0].label,
      unitPrice: product.basePrice,
    });
  };
  return (
    <Link to="/product/$id" params={{ id: product.id }} className="group relative block">
      <div className="relative overflow-hidden rounded-2xl glass">
        <div className="aspect-[4/5] overflow-hidden">
          <img src={product.image} alt={product.name} loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <button onClick={handleQuickAdd} aria-label="הוסף לעגלה"
          className="absolute bottom-4 right-4 grid h-11 w-11 translate-y-2 place-items-center rounded-full btn-rose opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <Plus className="h-5 w-5" />
        </button>
        {product.bestSeller && (
          <span className="absolute top-3 right-3 rounded-full bg-background/70 px-3 py-1 text-[11px] tracking-wider text-rose-gold backdrop-blur">
            רב מכר
          </span>
        )}
      </div>
      <div className="mt-4 flex items-start justify-between gap-3 px-1">
        <div className="min-w-0">
          <h3 className="truncate font-serif text-lg text-foreground">{product.name}</h3>
          <p className="text-xs text-muted-foreground">{product.style}</p>
        </div>
        <div className="shrink-0 text-left">
          <div className="text-sm text-muted-foreground">החל מ־</div>
          <div className="font-semibold text-rose-gold">₪{product.basePrice}</div>
        </div>
      </div>
    </Link>
  );
}
