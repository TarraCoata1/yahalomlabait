import { Link } from "@tanstack/react-router";
import { Plus, Pencil, EyeOff, Eye, Trash2, Heart } from "lucide-react";
import { useState } from "react";
import { aspectClass, aspectDims, type Product } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { RECT_SIZES, SQUARE_SIZES, FROM_PRICE } from "@/lib/products";
import { useSession, useIsAdmin } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EditProductDialog } from "@/components/admin/EditProductDialog";
import { useWishlist } from "@/lib/wishlist";
import { QuickViewDialog } from "@/components/site/QuickViewDialog";

export function ProductCard({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const { user } = useSession();
  const { data: isAdmin } = useIsAdmin(user);
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [quickView, setQuickView] = useState(false);
  const wishlisted = useWishlist((s) => s.ids.includes(product.id));
  const toggleWish = useWishlist((s) => s.toggle);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    const s = (product.orientation === "square" ? SQUARE_SIZES : RECT_SIZES)[0];
    add({
      productId: product.id,
      sku: product.sku ?? "",
      name: product.name,
      image: product.image,
      sizeId: s.id,
      sizeLabel: s.label,
      basePrice: s.price,
      screwColor: "silver",
      screwColorLabel: "כסוף",
      withInstallation: false,
      installationFee: 0,
      unitPrice: s.price,
    });
  };


  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const toggleHidden = async (e: React.MouseEvent) => {
    stop(e);
    const { error } = await supabase.from("products").update({ is_hidden: !product.isHidden }).eq("id", product.id);
    if (error) return toast.error("שגיאה בעדכון: " + error.message);
    toast.success(product.isHidden ? "המוצר הוצג" : "המוצר הוסתר");
    qc.invalidateQueries({ queryKey: ["products"] });
    qc.invalidateQueries({ queryKey: ["product", product.slug] });
  };

  const deleteProduct = async (e: React.MouseEvent) => {
    stop(e);
    if (!confirm(`למחוק את "${product.name}"? פעולה זו לא ניתנת לביטול.`)) return;
    const { error } = await supabase.from("products").delete().eq("id", product.id);
    if (error) return toast.error("שגיאה במחיקה: " + error.message);
    toast.success("המוצר נמחק");
    qc.invalidateQueries({ queryKey: ["products"] });
  };

  return (
    <>
      <Link to="/product/$id" params={{ id: product.slug }} className="group relative block">
        <div className={`relative overflow-hidden rounded-2xl glass ${product.isHidden ? "opacity-60" : ""}`}>
          <div className={`relative ${aspectClass(product.displayMode)} overflow-hidden`}>
            {/* Blurred backdrop lets us show the whole artwork without cropping it */}
            <div
              aria-hidden
              className="absolute inset-0 scale-110 opacity-30 blur-xl"
              style={{ backgroundImage: `url(${product.image})`, backgroundSize: "cover", backgroundPosition: "center" }}
            />
            <img
              src={product.image}
              alt={`${product.name} - תמונת זכוכית לבית ${product.style ?? ""} מיהלום לבית`}
              loading="lazy"
              width={aspectDims(product.displayMode).width}
              height={aspectDims(product.displayMode).height}
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
              style={{ WebkitUserSelect: "none", userSelect: "none", WebkitTouchCallout: "none" } as React.CSSProperties}
              className="relative z-10 h-full w-full object-contain transition-transform duration-700 group-hover:scale-105"
            />
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="absolute bottom-4 right-4 flex flex-col gap-2 opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
            <button onClick={handleQuickAdd} aria-label="הוסף לעגלה"
              className="grid h-11 w-11 place-items-center rounded-full btn-rose shadow-lg">
              <Plus className="h-5 w-5" />
            </button>
            <button onClick={(e) => { stop(e); setQuickView(true); }} aria-label="תצוגה מהירה"
              className="grid h-11 w-11 place-items-center rounded-full bg-background/90 text-foreground backdrop-blur ring-1 ring-rose-gold/40 shadow-lg hover:bg-background">
              <Eye className="h-5 w-5" />
            </button>
          </div>
          <button
            onClick={(e) => { stop(e); toggleWish(product.id); toast.success(wishlisted ? "הוסר מהמועדפים" : "נוסף למועדפים"); }}
            aria-label={wishlisted ? "הסר ממועדפים" : "הוסף למועדפים"}
            aria-pressed={wishlisted}
            className={`absolute top-3 left-3 z-10 grid h-10 w-10 place-items-center rounded-full backdrop-blur transition ${
              wishlisted ? "bg-rose-gold/90 text-white" : "bg-background/80 text-foreground hover:bg-background"
            }`}>
            <Heart className={`h-5 w-5 ${wishlisted ? "fill-current" : ""}`} />
          </button>
          {product.bestSeller && (
            <span className="absolute top-3 right-3 rounded-full bg-background/70 px-3 py-1 text-[11px] tracking-wider text-rose-gold backdrop-blur">
              רב מכר
            </span>
          )}
          {product.isHidden && (
            <span className="absolute top-14 left-3 rounded-full bg-background/80 px-3 py-1 text-[11px] tracking-wider text-amber-400 backdrop-blur">
              מוסתר
            </span>
          )}

          {isAdmin && (
            <div className="absolute bottom-3 left-3 flex gap-1.5">
              <button onClick={(e) => { stop(e); setEditing(true); }} aria-label="ערוך"
                className="grid h-9 w-9 place-items-center rounded-full bg-background/85 text-foreground backdrop-blur ring-1 ring-rose-gold/40 hover:bg-background">
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={toggleHidden} aria-label={product.isHidden ? "הצג" : "הסתר"}
                className="grid h-9 w-9 place-items-center rounded-full bg-background/85 text-foreground backdrop-blur ring-1 ring-rose-gold/40 hover:bg-background">
                {product.isHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
              <button onClick={deleteProduct} aria-label="מחק"
                className="grid h-9 w-9 place-items-center rounded-full bg-background/85 text-destructive backdrop-blur ring-1 ring-destructive/40 hover:bg-destructive/10">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
        <div className="mt-4 flex items-start justify-between gap-3 px-1">
          <div className="min-w-0">
            <h3 className="truncate font-serif text-lg text-foreground">{product.name}</h3>
            <p className="text-xs text-muted-foreground">{product.style}</p>
          </div>
          <div className="shrink-0 text-left">
            <div className="text-sm text-muted-foreground">החל מ־</div>
            <div className="font-semibold text-rose-gold">₪{FROM_PRICE}</div>
          </div>
        </div>
      </Link>

      {editing && <EditProductDialog product={product} onClose={() => setEditing(false)} />}
      {quickView && <QuickViewDialog product={product} onClose={() => setQuickView(false)} />}
    </>
  );
}
