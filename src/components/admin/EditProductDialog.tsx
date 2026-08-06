import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  categoriesQuery,
  DISPLAY_MODES,
  ORIENTATIONS,
  displayModesFor,
  type DisplayMode,
  type Orientation,
  type Product,
} from "@/lib/catalog";
import { toast } from "sonner";
import { X } from "lucide-react";

export function EditProductDialog({ product, onClose }: { product: Product; onClose: () => void }) {
  const { data: categories = [] } = useQuery(categoriesQuery);
  const qc = useQueryClient();
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description);
  const [categoryId, setCategoryId] = useState<string>(product.categoryId ?? "");
  const [style, setStyle] = useState(product.style);
  const [sku, setSku] = useState(product.sku ?? "");
  const [bestSeller, setBestSeller] = useState(product.bestSeller);
  const [orientation, setOrientation] = useState<Orientation | "">(product.orientation ?? "");
  const [displayMode, setDisplayMode] = useState<DisplayMode>(product.displayMode);
  const [saving, setSaving] = useState(false);

  const allowedModes = orientation ? displayModesFor(orientation) : [];
  const effectiveMode: DisplayMode =
    orientation === "square" ? "square" : allowedModes.includes(displayMode) ? displayMode : "portrait";

  const pickOrientation = (o: Orientation) => {
    setOrientation(o);
    setDisplayMode(o === "square" ? "square" : displayMode === "square" ? "portrait" : displayMode);
  };

  const save = async () => {
    if (!orientation) return toast.error("יש לבחור פורמט יצירה (מרובע או מלבני)");
    setSaving(true);
    const { error } = await supabase
      .from("products")
      .update({
        name: name.trim(),
        description: description.trim(),
        category_id: categoryId || null,
        style: style.trim(),
        sku: sku.trim() || null,
        best_seller: bestSeller,
        orientation,
        display_mode: effectiveMode,
      })
      .eq("id", product.id);


    setSaving(false);
    if (error) return toast.error("שגיאה בשמירה: " + error.message);
    toast.success("המוצר עודכן");
    qc.invalidateQueries({ queryKey: ["products"] });
    qc.invalidateQueries({ queryKey: ["product", product.slug] });
    onClose();
  };


  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[60] grid place-items-center bg-background/70 backdrop-blur-sm p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-2xl glass-strong p-6 space-y-4"
        dir="rtl"
      >
        <button onClick={onClose} aria-label="סגור" className="absolute top-3 left-3 grid h-9 w-9 place-items-center rounded-full hover:bg-secondary">
          <X className="h-5 w-5" />
        </button>
        <h2 className="font-serif text-2xl">עריכת מוצר</h2>
        <div className="space-y-3 text-sm">
          <label className="block">
            <span className="text-xs text-muted-foreground">שם המוצר</span>
            <input value={name} onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl bg-card border border-border px-4 py-2.5 focus:border-rose-gold outline-none" />
          </label>
          <label className="block">
            <span className="text-xs text-muted-foreground">סגנון</span>
            <input value={style} onChange={(e) => setStyle(e.target.value)}
              className="mt-1 w-full rounded-xl bg-card border border-border px-4 py-2.5 focus:border-rose-gold outline-none" />
          </label>
          <label className="block">
            <span className="text-xs text-muted-foreground">מק״ט (SKU)</span>
            <input value={sku} onChange={(e) => setSku(e.target.value)} dir="ltr" placeholder="למשל: YLB-MOD-001"
              className="mt-1 w-full rounded-xl bg-card border border-border px-4 py-2.5 focus:border-rose-gold outline-none" />
          </label>

          <label className="block">
            <span className="text-xs text-muted-foreground">קטגוריה</span>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
              className="mt-1 w-full rounded-xl bg-card border border-border px-4 py-2.5 focus:border-rose-gold outline-none">
              <option value="">— ללא קטגוריה —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs text-muted-foreground">תיאור</span>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
              className="mt-1 w-full rounded-xl bg-card border border-border px-4 py-2.5 focus:border-rose-gold outline-none resize-none" />
          </label>
          <div>
            <span className="text-xs text-muted-foreground">מצב תצוגת תמונה</span>
            <div className="mt-1 grid grid-cols-3 gap-2">
              {DISPLAY_MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setDisplayMode(m.id)}
                  aria-pressed={displayMode === m.id}
                  className={`rounded-xl border-2 px-2 py-2 text-xs transition ${
                    displayMode === m.id ? "border-rose-gold bg-rose-gold/10 text-rose-gold" : "border-border hover:border-rose-gold/50"
                  }`}
                >
                  <span
                    aria-hidden
                    className="mx-auto mb-1.5 block w-8 rounded border border-current opacity-70"
                    style={{ aspectRatio: m.ratio }}
                  />
                  {m.label}
                </button>
              ))}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              יחס התמונה בכל הגלריות באתר — התמונה תמיד מוצגת במלואה ללא חיתוך.
            </p>
          </div>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={bestSeller} onChange={(e) => setBestSeller(e.target.checked)}
              className="h-4 w-4 accent-rose-gold" />
            <span>סמן כרב מכר</span>
          </label>
        </div>
        <div className="flex gap-2 pt-2">
          <button onClick={save} disabled={saving}
            className="flex-1 rounded-full btn-rose py-3 font-semibold hover:btn-rose-hover disabled:opacity-50">
            {saving ? "שומר…" : "שמור שינויים"}
          </button>
          <button onClick={onClose} className="rounded-full border border-border px-6 py-3 text-sm hover:bg-secondary">
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}
