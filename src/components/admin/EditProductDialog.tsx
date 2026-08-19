import { useEffect, useMemo, useState } from "react";
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

/** Create + edit dialog. `product === null` creates a new artwork. */
export function EditProductDialog({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const { data: categories = [] } = useQuery(categoriesQuery);
  const qc = useQueryClient();
  const isNew = product === null;
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [categoryId, setCategoryId] = useState<string>(product?.categoryId ?? "");
  const [style, setStyle] = useState(product?.style ?? "");
  const [sku, setSku] = useState(product?.sku ?? "");
  const [bestSeller, setBestSeller] = useState(product?.bestSeller ?? false);
  const [orientation, setOrientation] = useState<Orientation | "">(product?.orientation ?? "");
  const [displayMode, setDisplayMode] = useState<DisplayMode>(product?.displayMode ?? "portrait");
  const [stockQty, setStockQty] = useState<string>(String(product?.stockQuantity ?? 0));
  const [lowStock, setLowStock] = useState<string>(String(product?.lowStockThreshold ?? 2));
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmClose, setConfirmClose] = useState(false);

  const allowedModes = orientation ? displayModesFor(orientation) : [];
  const effectiveMode: DisplayMode =
    orientation === "square" ? "square" : allowedModes.includes(displayMode) ? displayMode : "portrait";

  const pickOrientation = (o: Orientation) => {
    setOrientation(o);
    setDisplayMode(o === "square" ? "square" : displayMode === "square" ? "portrait" : displayMode);
  };

  /** Snapshot of the initial values — used for the unsaved-changes guard. */
  const initial = useMemo(
    () =>
      JSON.stringify({
        name: product?.name ?? "",
        slug: product?.slug ?? "",
        description: product?.description ?? "",
        categoryId: product?.categoryId ?? "",
        style: product?.style ?? "",
        sku: product?.sku ?? "",
        bestSeller: product?.bestSeller ?? false,
        orientation: product?.orientation ?? "",
        displayMode: product?.displayMode ?? "portrait",
        stockQty: String(product?.stockQuantity ?? 0),
        lowStock: String(product?.lowStockThreshold ?? 2),
      }),
    [product],
  );
  const current = JSON.stringify({
    name, slug, description, categoryId, style, sku, bestSeller, orientation, displayMode, stockQty, lowStock,
  });
  const dirty = current !== initial;

  /** Lock the page behind the modal so only the form body scrolls. */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const requestClose = () => {
    if (dirty) return setConfirmClose(true);
    onClose();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") requestClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const validate = () => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "יש להזין שם מוצר";
    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "");
    if (isNew && !cleanSlug) next.slug = "יש להזין כתובת (slug) באנגלית";
    if (!orientation) next.orientation = "יש לבחור פורמט יצירה (מרובע או מלבני)";
    const qty = Number(stockQty);
    if (!Number.isInteger(qty) || qty < 0) next.stockQty = "כמות מלאי חייבת להיות מספר שלם מ־0 ומעלה";
    const low = Number(lowStock);
    if (!Number.isInteger(low) || low < 0) next.lowStock = "רף מלאי נמוך חייב להיות מספר שלם מ־0 ומעלה";
    setErrors(next);
    return { ok: Object.keys(next).length === 0, cleanSlug, qty, low };
  };

  /** Returns true only when the database write actually succeeded. */
  const save = async (): Promise<boolean> => {
    const { ok, cleanSlug, qty, low } = validate();
    if (!ok) {
      toast.error("יש שדות שדורשים תיקון");
      return false;
    }
    setSaving(true);
    const payload = {
      name: name.trim(),
      description: description.trim(),
      category_id: categoryId || null,
      style: style.trim(),
      sku: sku.trim() || null,
      best_seller: bestSeller,
      orientation: orientation as Orientation,
      display_mode: effectiveMode,
      stock_quantity: qty,
      low_stock_threshold: low,
    };
    const { error } = isNew
      ? await supabase.from("products").insert({ ...payload, slug: cleanSlug })
      : await supabase.from("products").update(payload).eq("id", product.id);

    setSaving(false);
    if (error) {
      toast.error("שגיאה בשמירה: " + error.message);
      return false;
    }
    toast.success(isNew ? "המוצר נוצר בהצלחה" : "השינויים נשמרו בהצלחה");
    qc.invalidateQueries({ queryKey: ["products"] });
    if (product) qc.invalidateQueries({ queryKey: ["product", product.slug] });
    return true;
  };

  const saveAndClose = async () => {
    if (await save()) onClose();
  };

  const err = (k: string) =>
    errors[k] ? <span className="mt-1 block text-[11px] text-destructive">{errors[k]}</span> : null;
  const fieldCls = (k: string) =>
    `mt-1 w-full rounded-xl bg-card border px-4 py-2.5 outline-none ${
      errors[k] ? "border-destructive" : "border-border focus:border-rose-gold"
    }`;

  return (
    <div
      onClick={requestClose}
      className="fixed inset-0 z-[60] grid place-items-center bg-background/70 backdrop-blur-sm p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        className="relative flex w-full max-w-lg max-h-[90dvh] flex-col overflow-hidden rounded-2xl glass-strong"
        dir="rtl"
      >
        {/* Header (stays visible) */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border/40 px-6 py-4">
          <h2 className="font-serif text-2xl">{isNew ? "מוצר חדש" : "עריכת מוצר"}</h2>
          <button onClick={requestClose} aria-label="סגור" className="grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-secondary">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable form body — visible native scrollbar */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4 visible-scrollbar">

        <div className="space-y-3 text-sm">
          <label className="block">
            <span className="text-xs text-muted-foreground">שם המוצר</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className={fieldCls("name")} />
            {err("name")}
          </label>
          {isNew && (
            <label className="block">
              <span className="text-xs text-muted-foreground">כתובת באנגלית (slug) <span className="text-rose-gold">*</span></span>
              <input value={slug} onChange={(e) => setSlug(e.target.value)} dir="ltr" placeholder="modern-gold-lines"
                className={fieldCls("slug")} />
              {err("slug")}
            </label>
          )}
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

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs text-muted-foreground">כמות במלאי</span>
              <input type="number" min={0} step={1} inputMode="numeric" value={stockQty}
                onChange={(e) => setStockQty(e.target.value)} className={fieldCls("stockQty")} />
              {err("stockQty")}
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground">רף מלאי נמוך</span>
              <input type="number" min={0} step={1} inputMode="numeric" value={lowStock}
                onChange={(e) => setLowStock(e.target.value)} className={fieldCls("lowStock")} />
              {err("lowStock")}
            </label>
          </div>
          <p className="text-[11px] text-muted-foreground">
            כמות 0 = אזל מהמלאי. כשהכמות יורדת עד הרף — יופיע סימון “מלאי נמוך” בטבלת המוצרים.
          </p>

          <fieldset>
            <legend className="text-xs text-muted-foreground">
              פורמט היצירה <span className="text-rose-gold">*</span>
            </legend>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {ORIENTATIONS.map((o) => (
                <label
                  key={o.id}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm transition ${
                    orientation === o.id ? "border-rose-gold bg-rose-gold/10 text-rose-gold" : "border-border hover:border-rose-gold/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="orientation"
                    value={o.id}
                    checked={orientation === o.id}
                    onChange={() => pickOrientation(o.id)}
                    required
                    className="h-4 w-4 accent-rose-gold"
                  />
                  <span aria-hidden className="block w-6 rounded border border-current opacity-70" style={{ aspectRatio: o.ratio }} />
                  <span>{o.label}</span>
                </label>
              ))}
            </div>
            {err("orientation")}
            <p className="mt-1 text-[11px] text-muted-foreground">
              מאפיין קבוע של היצירה — קובע באיזו קולקציה היא מוצגת (מרובעות / מלבניות) ואילו מידות זמינות. לא ניתן לבחור בשניהם.
            </p>
          </fieldset>

          {orientation === "rectangle" && (
            <div>
              <span className="text-xs text-muted-foreground">מצב תצוגת תמונה</span>
              <div className="mt-1 grid grid-cols-2 gap-2">
                {DISPLAY_MODES.filter((m) => allowedModes.includes(m.id)).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setDisplayMode(m.id)}
                    aria-pressed={effectiveMode === m.id}
                    className={`rounded-xl border-2 px-2 py-2 text-xs transition ${
                      effectiveMode === m.id ? "border-rose-gold bg-rose-gold/10 text-rose-gold" : "border-border hover:border-rose-gold/50"
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
          )}


          <label className="flex items-center gap-2">
            <input type="checkbox" checked={bestSeller} onChange={(e) => setBestSeller(e.target.checked)}
              className="h-4 w-4 accent-rose-gold" />
            <span>סמן כרב מכר</span>
          </label>
        </div>
        </div>

        {/* Sticky action bar */}
        <div className="shrink-0 border-t border-border/40 bg-background/80 px-6 py-4 backdrop-blur">
          <div className="flex gap-2">
            <button onClick={saveAndClose} disabled={saving}
              className="flex-1 rounded-full btn-rose py-3 font-semibold hover:btn-rose-hover disabled:opacity-50">
              {saving ? "שומר…" : isNew ? "צור מוצר" : "שמור שינויים"}
            </button>
            <button onClick={requestClose} className="rounded-full border border-border px-6 py-3 text-sm hover:bg-secondary">
              ביטול
            </button>
          </div>
          {dirty && <p className="mt-2 text-[11px] text-muted-foreground">יש שינויים שלא נשמרו.</p>}
        </div>

        {confirmClose && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-background/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl glass-strong p-5 text-center">
              <h3 className="font-serif text-xl">יש שינויים שלא נשמרו</h3>
              <p className="mt-2 text-sm text-muted-foreground">מה לעשות עם השינויים שביצעת?</p>
              <div className="mt-5 space-y-2">
                <button onClick={() => { setConfirmClose(false); void saveAndClose(); }} disabled={saving}
                  className="w-full rounded-full btn-rose py-3 text-sm font-semibold disabled:opacity-50">
                  שמור וצא
                </button>
                <button onClick={onClose}
                  className="w-full rounded-full border border-destructive/50 py-3 text-sm text-destructive hover:bg-destructive/10">
                  צא בלי לשמור
                </button>
                <button onClick={() => setConfirmClose(false)}
                  className="w-full rounded-full border border-border py-3 text-sm hover:bg-secondary">
                  המשך לערוך
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
