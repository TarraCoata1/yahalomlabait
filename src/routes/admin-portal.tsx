import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut, ShieldCheck, Plus, Pencil, Trash2, EyeOff, Eye, Search, Upload, ImageIcon, X } from "lucide-react";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { useSession, useIsAdmin, signOut } from "@/hooks/use-auth";
import { categoriesQuery, productsQuery, type Category, type Product } from "@/lib/catalog";
import { EditProductDialog } from "@/components/admin/EditProductDialog";
import { toast } from "sonner";
import logo from "@/assets/logo.png.asset.json";
import { siteSettingsQuery, saveSiteSettings, uploadSocialImage, DEFAULT_SITE_SETTINGS, type SiteSettings, type PaymentMethodConfig } from "@/lib/site-settings";
import { allPageSeoQuery, savePageSeo, createPageSeo, deletePageSeo, type PageSeo } from "@/lib/page-seo";
import { adminOrdersQuery, ORDER_STATUSES, PAYMENT_STATUSES, ORDER_STATUS_LABEL, PAYMENT_STATUS_LABEL, PAYMENT_METHOD_LABEL, type OrderRow, type OrderStatus, type PaymentStatus } from "@/lib/orders";


export const Route = createFileRoute("/admin-portal")({
  head: () => ({
    meta: [
      { title: "ניהול | Yahalom La Bait" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPortal,
});

function AdminPortal() {
  const { user, loading } = useSession();
  const { data: isAdmin, isLoading: roleLoading } = useIsAdmin(user);

  if (loading || (user && roleLoading)) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="text-sm text-muted-foreground">טוען…</div>
      </div>
    );
  }

  if (!user) return <LoginScreen />;
  if (!isAdmin) return <NoAccessScreen email={user.email ?? ""} />;
  return <Dashboard />;
}

function LoginScreen() {
  const [busy, setBusy] = useState(false);

  const signIn = async () => {
    setBusy(true);
    const res = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/admin-portal",
    });
    if (res.error) {
      toast.error("שגיאת התחברות: " + res.error.message);
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-[80vh] place-items-center px-4">
      <div className="w-full max-w-md rounded-3xl glass-strong p-8 text-center">
        <img src={logo.url} alt="" width={64} height={64} className="mx-auto rounded-full ring-1 ring-rose-gold/40" />
        <div className="mt-4 text-xs uppercase tracking-[0.3em] text-rose-gold">פאנל ניהול</div>
        <h1 className="mt-2 font-serif text-3xl">כניסת אדמין</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          התחברות מאובטחת באמצעות חשבון Google. החיבור נשמר במכשיר זה.
        </p>
        <button
          onClick={signIn}
          disabled={busy}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-full bg-foreground text-background py-3.5 font-semibold transition hover:opacity-90 disabled:opacity-50"
        >
          <GoogleIcon className="h-5 w-5" />
          {busy ? "מעביר ל־Google…" : "התחבר עם Google"}
        </button>
        <p className="mt-6 text-xs text-muted-foreground">גישה מוגבלת לכתובות אימייל מאושרות בלבד.</p>
        <Link to="/" className="mt-4 inline-block text-xs text-rose-gold hover:underline">← חזרה לאתר</Link>
      </div>
    </div>
  );
}

function NoAccessScreen({ email }: { email: string }) {
  return (
    <div className="grid min-h-[80vh] place-items-center px-4">
      <div className="w-full max-w-md rounded-3xl glass-strong p-8 text-center">
        <h1 className="font-serif text-2xl">אין גישת אדמין</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          החשבון <span className="text-foreground">{email}</span> לא מורשה לגשת לפאנל הניהול.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <button onClick={signOut} className="rounded-full btn-rose py-3 font-semibold">התנתק</button>
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">חזרה לאתר</Link>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const { user } = useSession();
  const [tab, setTab] = useState<"products" | "categories" | "orders" | "settings" | "seo">("products");

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-full glass">
            <ShieldCheck className="h-5 w-5 text-rose-gold" />
          </div>
          <div>
            <h1 className="font-serif text-3xl">פאנל ניהול</h1>
            <p className="text-xs text-muted-foreground">מחובר כ־{user?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/" className="rounded-full glass px-4 py-2 text-sm hover:border-rose-gold/60">לאתר</Link>
          <button onClick={signOut} className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-secondary">
            <LogOut className="h-4 w-4" /> התנתק
          </button>
        </div>
      </header>

      <div className="mb-6 inline-flex flex-wrap rounded-full glass p-1">
        <button onClick={() => setTab("products")} className={`rounded-full px-5 py-2 text-sm ${tab === "products" ? "btn-rose" : "text-muted-foreground"}`}>מוצרים</button>
        <button onClick={() => setTab("categories")} className={`rounded-full px-5 py-2 text-sm ${tab === "categories" ? "btn-rose" : "text-muted-foreground"}`}>קטגוריות</button>
        <button onClick={() => setTab("orders")} className={`rounded-full px-5 py-2 text-sm ${tab === "orders" ? "btn-rose" : "text-muted-foreground"}`}>הזמנות</button>
        <button onClick={() => setTab("settings")} className={`rounded-full px-5 py-2 text-sm ${tab === "settings" ? "btn-rose" : "text-muted-foreground"}`}>הגדרות אתר</button>
        <button onClick={() => setTab("seo")} className={`rounded-full px-5 py-2 text-sm ${tab === "seo" ? "btn-rose" : "text-muted-foreground"}`}>SEO</button>
      </div>

      {tab === "products" && <ProductsPanel />}
      {tab === "categories" && <CategoriesPanel />}
      {tab === "orders" && <OrdersPanel />}
      {tab === "settings" && <SiteSettingsPanel />}
      {tab === "seo" && <SeoPanel />}
    </div>
  );
}


/* -------------------- PRODUCTS PANEL -------------------- */

function ProductsPanel() {
  const { data: products = [], isLoading } = useQuery(productsQuery);
  const { data: categories = [] } = useQuery(categoriesQuery);
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);

  const filtered = products.filter((p) =>
    p.name.includes(search) || p.style.includes(search) || (p.categorySlug ?? "").includes(search),
  );

  const toggleHidden = async (p: Product) => {
    const { error } = await supabase.from("products").update({ is_hidden: !p.isHidden }).eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success(p.isHidden ? "המוצר הוצג" : "המוצר הוסתר");
    qc.invalidateQueries({ queryKey: ["products"] });
  };

  const remove = async (p: Product) => {
    if (!confirm(`למחוק את "${p.name}"?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success("נמחק");
    qc.invalidateQueries({ queryKey: ["products"] });
  };

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="חיפוש מוצר…"
            className="w-full rounded-full bg-card border border-border pr-10 pl-4 py-2.5 text-sm focus:border-rose-gold outline-none" />
        </div>
        <span className="text-xs text-muted-foreground">{filtered.length} / {products.length} מוצרים</span>
      </div>

      <div className="overflow-hidden rounded-2xl glass">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">טוען…</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border/50 text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-3 text-right">תמונה</th>
                <th className="px-3 py-3 text-right">שם</th>
                <th className="px-3 py-3 text-right hidden sm:table-cell">קטגוריה</th>
                <th className="px-3 py-3 text-right hidden md:table-cell">סגנון</th>
                <th className="px-3 py-3 text-right">סטטוס</th>
                <th className="px-3 py-3 text-left">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const catName = categories.find((c) => c.id === p.categoryId)?.name ?? "—";
                return (
                  <tr key={p.id} className="border-t border-border/30 hover:bg-secondary/30">
                    <td className="px-3 py-3"><img src={p.image} alt="" className="h-12 w-12 rounded-lg object-cover" /></td>
                    <td className="px-3 py-3"><div className="font-medium">{p.name}</div><div className="text-xs text-muted-foreground sm:hidden">{catName}</div></td>
                    <td className="px-3 py-3 hidden sm:table-cell">{catName}</td>
                    <td className="px-3 py-3 hidden md:table-cell">{p.style}</td>
                    <td className="px-3 py-3">
                      {p.isHidden ? <span className="text-amber-400">מוסתר</span> : <span className="text-emerald-400">מוצג</span>}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setEditing(p)} aria-label="ערוך" className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => toggleHidden(p)} aria-label="הסתר/הצג" className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary">{p.isHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
                        <button onClick={() => remove(p)} aria-label="מחק" className="grid h-8 w-8 place-items-center rounded-full text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">אין מוצרים להצגה.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {editing && <EditProductDialog product={editing} onClose={() => setEditing(null)} />}
    </section>
  );
}

/* -------------------- CATEGORIES PANEL -------------------- */

function CategoriesPanel() {
  const { data: categories = [], isLoading } = useQuery(categoriesQuery);
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["categories"] });

  const remove = async (c: Category) => {
    if (!confirm(`למחוק את "${c.name}"? מוצרים שיוקצו לקטגוריה זו ישארו ללא קטגוריה.`)) return;
    const { error } = await supabase.from("categories").delete().eq("id", c.id);
    if (error) return toast.error(error.message);
    toast.success("נמחק");
    invalidate();
  };

  const toggleActive = async (c: Category) => {
    const { error } = await supabase.from("categories").update({ is_active: !c.is_active }).eq("id", c.id);
    if (error) return toast.error(error.message);
    invalidate();
  };

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{categories.length} קטגוריות</span>
        <button onClick={() => setCreating(true)} className="flex items-center gap-2 rounded-full btn-rose px-4 py-2 text-sm">
          <Plus className="h-4 w-4" /> קטגוריה חדשה
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {isLoading ? (
          <div className="col-span-full p-8 text-center text-sm text-muted-foreground">טוען…</div>
        ) : (
          categories.map((c) => (
            <CategoryRow key={c.id} category={c} onChange={invalidate} onDelete={() => remove(c)} onToggle={() => toggleActive(c)} />
          ))
        )}
      </div>

      {creating && <CategoryDialog onClose={() => setCreating(false)} onSaved={invalidate} />}
    </section>
  );
}

function CategoryRow({ category, onChange, onDelete, onToggle }: {
  category: Category; onChange: () => void; onDelete: () => void; onToggle: () => void;
}) {
  const [editing, setEditing] = useState(false);
  return (
    <>
      <div className="flex items-center gap-4 rounded-2xl glass p-4">
        <img src={category.image} alt="" className="h-14 w-14 rounded-xl object-cover" />
        <div className="min-w-0 flex-1">
          <div className="font-medium">{category.name}</div>
          <div className="truncate text-xs text-muted-foreground">{category.tagline}</div>
          <div className="mt-1 text-[11px] text-muted-foreground">/{category.slug} · {category.is_active ? "פעיל" : "מושבת"}</div>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setEditing(true)} aria-label="ערוך" className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary"><Pencil className="h-4 w-4" /></button>
          <button onClick={onToggle} aria-label="הפעל/השבת" className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary">{category.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
          <button onClick={onDelete} aria-label="מחק" className="grid h-9 w-9 place-items-center rounded-full text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>
      {editing && <CategoryDialog category={category} onClose={() => setEditing(false)} onSaved={onChange} />}
    </>
  );
}

function CategoryDialog({ category, onClose, onSaved }: { category?: Category; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [tagline, setTagline] = useState(category?.tagline ?? "");
  const [imageKey, setImageKey] = useState(category?.image_key ?? "catModern");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim() || !slug.trim()) return toast.error("שם וכתובת (slug) הם שדות חובה");
    setSaving(true);
    const payload = { name: name.trim(), slug: slug.trim(), tagline: tagline.trim(), image_key: imageKey };
    const { error } = category
      ? await supabase.from("categories").update(payload).eq("id", category.id)
      : await supabase.from("categories").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(category ? "הקטגוריה עודכנה" : "הקטגוריה נוצרה");
    onSaved();
    onClose();
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-[60] grid place-items-center bg-background/70 backdrop-blur-sm p-4">
      <div onClick={(e) => e.stopPropagation()} dir="rtl" className="w-full max-w-md rounded-2xl glass-strong p-6 space-y-4">
        <h2 className="font-serif text-2xl">{category ? "עריכת קטגוריה" : "קטגוריה חדשה"}</h2>
        <div className="space-y-3 text-sm">
          <label className="block">
            <span className="text-xs text-muted-foreground">שם תצוגה</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-xl bg-card border border-border px-4 py-2.5 focus:border-rose-gold outline-none" />
          </label>
          <label className="block">
            <span className="text-xs text-muted-foreground">כתובת (slug באנגלית, ללא רווחים)</span>
            <input value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))} className="mt-1 w-full rounded-xl bg-card border border-border px-4 py-2.5 focus:border-rose-gold outline-none" dir="ltr" />
          </label>
          <label className="block">
            <span className="text-xs text-muted-foreground">תיאור קצר</span>
            <input value={tagline} onChange={(e) => setTagline(e.target.value)} className="mt-1 w-full rounded-xl bg-card border border-border px-4 py-2.5 focus:border-rose-gold outline-none" />
          </label>
          <label className="block">
            <span className="text-xs text-muted-foreground">תמונה</span>
            <select value={imageKey} onChange={(e) => setImageKey(e.target.value)} className="mt-1 w-full rounded-xl bg-card border border-border px-4 py-2.5 focus:border-rose-gold outline-none">
              <option value="catModern">תמונת קטגוריה — מודרני</option>
              <option value="catLandscape">תמונת קטגוריה — נופים</option>
              <option value="catAbstract">תמונת קטגוריה — אבסטרקט</option>
              <option value="catKodesh">תמונת קטגוריה — קודש</option>
              <option value="catCustom">תמונת קטגוריה — פרימיום/אישי</option>
            </select>
          </label>
        </div>
        <div className="flex gap-2 pt-2">
          <button onClick={save} disabled={saving} className="flex-1 rounded-full btn-rose py-3 font-semibold disabled:opacity-50">
            {saving ? "שומר…" : "שמור"}
          </button>
          <button onClick={onClose} className="rounded-full border border-border px-6 py-3 text-sm hover:bg-secondary">ביטול</button>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#FFC107" d="M21.8 10.2H12v3.9h5.6c-.5 2.6-2.8 4.4-5.6 4.4-3.4 0-6.1-2.7-6.1-6.1S8.6 6.3 12 6.3c1.5 0 2.9.5 4 1.5l2.7-2.7C16.9 3.4 14.6 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12S6.8 21.5 12 21.5c5.5 0 9.4-3.9 9.4-9.4 0-.6-.1-1.2-.2-1.9z"/>
      <path fill="#FF3D00" d="M3.6 7.4l3.2 2.4c.9-2 2.9-3.5 5.2-3.5 1.5 0 2.9.5 4 1.5l2.7-2.7C16.9 3.4 14.6 2.5 12 2.5 8.2 2.5 4.9 4.6 3.6 7.4z"/>
      <path fill="#4CAF50" d="M12 21.5c2.5 0 4.8-.9 6.5-2.4l-3-2.5c-1 .7-2.2 1.1-3.5 1.1-2.7 0-5.1-1.8-5.6-4.4l-3.1 2.4C4.7 19.2 8.1 21.5 12 21.5z"/>
      <path fill="#1976D2" d="M21.8 10.2H12v3.9h5.6c-.3 1.3-1 2.4-2.1 3.2l3 2.5c1.8-1.7 3.1-4.2 3.1-7.7 0-.6-.1-1.2-.2-1.9z"/>
    </svg>
  );
}

/* -------------------- SEO PANEL (Tabbed CMS) -------------------- */

type SeoSubTab = "general" | "business" | "analytics" | "pages";

function SeoPanel() {
  const [sub, setSub] = useState<SeoSubTab>("general");
  return (
    <section>
      <div className="mb-6 flex flex-wrap gap-1 rounded-full glass p-1">
        {(
          [
            ["general", "כללי ושיתוף"],
            ["business", "פרטי עסק"],
            ["analytics", "אנליטיקס וקודי אימות"],
            ["pages", "SEO לפי עמוד"],
          ] as [SeoSubTab, string][]
        ).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setSub(k)}
            className={`rounded-full px-4 py-2 text-sm ${sub === k ? "btn-rose" : "text-muted-foreground hover:text-foreground"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {sub === "general" && <GeneralSeoPanel />}
      {sub === "business" && <BusinessInfoPanel />}
      {sub === "analytics" && <AnalyticsPanel />}
      {sub === "pages" && <PagesSeoPanel />}
    </section>
  );
}

/* -------- General (site title/desc/OG image) -------- */

function useSettingsForm() {
  const { data, isLoading } = useQuery(siteSettingsQuery);
  const qc = useQueryClient();
  const router = useRouter();
  const [form, setForm] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (data) setForm(data); }, [data]);

  const save = async (patch?: Partial<SiteSettings>) => {
    setSaving(true);
    try {
      await saveSiteSettings(patch ?? form);
      await qc.invalidateQueries({ queryKey: ["site_settings"] });
      router.invalidate();
      toast.success("הגדרות נשמרו");
    } catch (e) {
      toast.error((e as Error).message);
    } finally { setSaving(false); }
  };

  const setField = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  return { form, setField, save, saving, isLoading };
}

function GeneralSeoPanel() {
  const { form, setField, save, saving, isLoading } = useSettingsForm();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) return toast.error("יש להעלות קובץ תמונה");
    if (file.size > 5 * 1024 * 1024) return toast.error("גודל מקסימלי 5MB");
    setUploading(true);
    try {
      const url = await uploadSocialImage(file);
      setField("social_image_url", url);
      toast.success("התמונה הועלתה");
    } catch (e) { toast.error((e as Error).message); }
    finally { setUploading(false); }
  };

  if (isLoading) return <PanelSkeleton />;
  const titleCount = form.site_title.length;
  const descCount = form.site_description.length;

  return (
    <div className="max-w-3xl rounded-2xl glass p-6 space-y-6">
      <PanelHeader title="Site SEO & Social Share" subtitle="ברירת המחדל של כותרת האתר, תיאור ותמונת שיתוף — משמשות כשאין ערך ייעודי בעמוד." />
      <Field label="כותרת אתר (Site Title)" hint={`${titleCount}/60`} warn={titleCount > 60}>
        <input value={form.site_title} onChange={(e) => setField("site_title", e.target.value.slice(0, 60))} maxLength={60} className={inputCls} />
      </Field>
      <Field label="תיאור (Meta Description)" hint={`${descCount}/160`} warn={descCount > 160}>
        <textarea value={form.site_description} onChange={(e) => setField("site_description", e.target.value.slice(0, 160))} maxLength={160} rows={3} className={inputCls + " resize-none"} />
      </Field>
      <Field label="Social / OG Image">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="grid h-32 w-full sm:w-56 place-items-center overflow-hidden rounded-xl bg-card border border-border">
            {form.social_image_url ? <img src={form.social_image_url} alt="" className="h-full w-full object-cover" /> :
              <div className="flex flex-col items-center gap-2 text-muted-foreground text-xs"><ImageIcon className="h-6 w-6" />אין תמונה</div>}
          </div>
          <div className="flex-1 space-y-2">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ""; }} />
            <button onClick={() => fileRef.current?.click()} disabled={uploading} className="flex items-center gap-2 rounded-full btn-rose px-5 py-2.5 text-sm font-semibold disabled:opacity-50">
              <Upload className="h-4 w-4" />{uploading ? "מעלה…" : form.social_image_url ? "החלף תמונה" : "העלה תמונה"}
            </button>
            {form.social_image_url && <button onClick={() => setField("social_image_url", "")} className="block text-xs text-muted-foreground hover:text-destructive">הסר תמונה</button>}
            <p className="text-xs text-muted-foreground">מומלץ 1200×630, עד 5MB.</p>
          </div>
        </div>
      </Field>
      <SaveBar saving={saving} onSave={() => save()} />
    </div>
  );
}

/* -------- Business info -------- */

function BusinessInfoPanel() {
  const { form, setField, save, saving, isLoading } = useSettingsForm();
  if (isLoading) return <PanelSkeleton />;
  return (
    <div className="max-w-3xl rounded-2xl glass p-6 space-y-5">
      <PanelHeader title="פרטי עסק וקשר" subtitle="המידע הזה מזין את סכמת הארגון (JSON-LD), הפוטר וכפתורי הצור-קשר." />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="שם החברה"><input value={form.company_name} onChange={(e) => setField("company_name", e.target.value)} className={inputCls} /></Field>
        <Field label="אימייל"><input value={form.contact_email} onChange={(e) => setField("contact_email", e.target.value)} className={inputCls} dir="ltr" /></Field>
        <Field label="טלפון"><input value={form.contact_phone} onChange={(e) => setField("contact_phone", e.target.value)} className={inputCls} dir="ltr" /></Field>
        <Field label="וואטסאפ (מספר מלא ללא +)"><input value={form.whatsapp_number} onChange={(e) => setField("whatsapp_number", e.target.value)} className={inputCls} dir="ltr" /></Field>
        <Field label="כתובת"><input value={form.address} onChange={(e) => setField("address", e.target.value)} className={inputCls} /></Field>
        <Field label="קישור Google Maps"><input value={form.google_maps_url} onChange={(e) => setField("google_maps_url", e.target.value)} className={inputCls} dir="ltr" /></Field>
        <Field label="Google Business Profile URL"><input value={form.google_business_url} onChange={(e) => setField("google_business_url", e.target.value)} className={inputCls} dir="ltr" /></Field>
        <Field label="Logo URL"><input value={form.logo_url} onChange={(e) => setField("logo_url", e.target.value)} className={inputCls} dir="ltr" /></Field>
        <Field label="Facebook"><input value={form.facebook_url} onChange={(e) => setField("facebook_url", e.target.value)} className={inputCls} dir="ltr" /></Field>
        <Field label="Instagram"><input value={form.instagram_url} onChange={(e) => setField("instagram_url", e.target.value)} className={inputCls} dir="ltr" /></Field>
        <Field label="TikTok"><input value={form.tiktok_url} onChange={(e) => setField("tiktok_url", e.target.value)} className={inputCls} dir="ltr" /></Field>
        <Field label="YouTube"><input value={form.youtube_url} onChange={(e) => setField("youtube_url", e.target.value)} className={inputCls} dir="ltr" /></Field>
      </div>
      <SaveBar saving={saving} onSave={() => save()} />
    </div>
  );
}

/* -------- Analytics / tracking / verification -------- */

function AnalyticsPanel() {
  const { form, setField, save, saving, isLoading } = useSettingsForm();
  if (isLoading) return <PanelSkeleton />;
  return (
    <div className="max-w-3xl rounded-2xl glass p-6 space-y-5">
      <PanelHeader title="Analytics & Verification" subtitle="הזינו רק את המזהה — הסקריפטים ייטענו אוטומטית. השאירו ריק כדי לכבות." />
      <Field label="Google Analytics 4 — Measurement ID" hint="דוגמה: G-XXXXXXX">
        <input value={form.ga4_measurement_id} onChange={(e) => setField("ga4_measurement_id", e.target.value.trim())} className={inputCls} dir="ltr" placeholder="G-XXXXXXX" />
      </Field>
      <Field label="Google Tag Manager — Container ID" hint="דוגמה: GTM-XXXXXX">
        <input value={form.gtm_container_id} onChange={(e) => setField("gtm_container_id", e.target.value.trim())} className={inputCls} dir="ltr" placeholder="GTM-XXXXXX" />
      </Field>
      <Field label="Facebook Pixel ID">
        <input value={form.facebook_pixel_id} onChange={(e) => setField("facebook_pixel_id", e.target.value.trim())} className={inputCls} dir="ltr" placeholder="1234567890" />
      </Field>
      <Field label="Google Search Console — קוד אימות" hint="ה-content של תג ה-meta">
        <input value={form.gsc_verification} onChange={(e) => setField("gsc_verification", e.target.value.trim())} className={inputCls} dir="ltr" />
      </Field>
      <SaveBar saving={saving} onSave={() => save()} />
    </div>
  );
}

/* -------- Per-page SEO manager -------- */

function PagesSeoPanel() {
  const { data: pages = [], isLoading } = useQuery(allPageSeoQuery);
  const qc = useQueryClient();
  const router = useRouter();
  const [editing, setEditing] = useState<PageSeo | null>(null);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () => pages.filter((p) => p.route_path.includes(search) || p.page_label.includes(search) || p.title.includes(search)),
    [pages, search],
  );

  const refresh = () => { qc.invalidateQueries({ queryKey: ["page_seo"] }); router.invalidate(); };

  const remove = async (p: PageSeo) => {
    if (!confirm(`למחוק את הגדרות ה-SEO של ${p.route_path}?`)) return;
    try { await deletePageSeo(p.id); toast.success("נמחק"); refresh(); }
    catch (e) { toast.error((e as Error).message); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="חיפוש עמוד…" className="w-full rounded-full bg-card border border-border pr-10 pl-4 py-2.5 text-sm focus:border-rose-gold outline-none" />
        </div>
        <button onClick={() => setCreating(true)} className="flex items-center gap-2 rounded-full btn-rose px-4 py-2 text-sm">
          <Plus className="h-4 w-4" /> עמוד חדש
        </button>
      </div>

      {isLoading ? <PanelSkeleton /> : (
        <div className="overflow-hidden rounded-2xl glass">
          <table className="w-full text-sm">
            <thead className="border-b border-border/50 text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-3 text-right">נתיב</th>
                <th className="px-3 py-3 text-right">כותרת עמוד</th>
                <th className="px-3 py-3 text-right hidden md:table-cell">Meta Title</th>
                <th className="px-3 py-3 text-right">Index</th>
                <th className="px-3 py-3 text-left">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t border-border/30 hover:bg-secondary/30">
                  <td className="px-3 py-3 font-mono text-xs" dir="ltr">{p.route_path}</td>
                  <td className="px-3 py-3">{p.page_label || "—"}</td>
                  <td className="px-3 py-3 hidden md:table-cell truncate max-w-[280px]">{p.title || <span className="text-muted-foreground">ברירת מחדל</span>}</td>
                  <td className="px-3 py-3">{p.robots_index ? <span className="text-emerald-400">פתוח</span> : <span className="text-amber-400">noindex</span>}</td>
                  <td className="px-3 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setEditing(p)} aria-label="ערוך" className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => remove(p)} aria-label="מחק" className="grid h-8 w-8 place-items-center rounded-full text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-sm text-muted-foreground">אין עמודים.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {editing && <PageSeoDialog page={editing} onClose={() => setEditing(null)} onSaved={refresh} />}
      {creating && <PageSeoDialog onClose={() => setCreating(false)} onSaved={refresh} />}
    </div>
  );
}

function PageSeoDialog({ page, onClose, onSaved }: { page?: PageSeo; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<Partial<PageSeo>>(
    page ?? { route_path: "", page_label: "", title: "", description: "", keywords: "", canonical_url: "", og_title: "", og_description: "", og_image: "", twitter_card: "summary_large_image", robots_index: true, robots_follow: true, breadcrumb_title: "", is_active: true },
  );
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof PageSeo>(k: K, v: PageSeo[K]) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.route_path?.trim()) return toast.error("נתיב הוא שדה חובה");
    setSaving(true);
    try {
      if (page) await savePageSeo(page.id, form);
      else await createPageSeo({ ...(form as PageSeo), route_path: form.route_path.trim() });
      toast.success("נשמר");
      onSaved(); onClose();
    } catch (e) { toast.error((e as Error).message); }
    finally { setSaving(false); }
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-[60] grid place-items-center bg-background/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div onClick={(e) => e.stopPropagation()} dir="rtl" className="w-full max-w-2xl my-8 rounded-2xl glass-strong p-6 space-y-4">
        <div className="flex items-start justify-between">
          <h2 className="font-serif text-2xl">{page ? `עריכת ${page.route_path}` : "עמוד חדש"}</h2>
          <button onClick={onClose} aria-label="סגור" className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary"><X className="h-4 w-4" /></button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="נתיב (route)"><input value={form.route_path ?? ""} onChange={(e) => set("route_path", e.target.value)} className={inputCls} dir="ltr" placeholder="/example" disabled={!!page} /></Field>
          <Field label="שם ידידותי לעמוד"><input value={form.page_label ?? ""} onChange={(e) => set("page_label", e.target.value)} className={inputCls} /></Field>
          <Field label="Meta Title" hint={`${(form.title ?? "").length}/60`} warn={(form.title ?? "").length > 60}><input value={form.title ?? ""} onChange={(e) => set("title", e.target.value)} className={inputCls} /></Field>
          <Field label="Breadcrumb Title"><input value={form.breadcrumb_title ?? ""} onChange={(e) => set("breadcrumb_title", e.target.value)} className={inputCls} /></Field>
        </div>
        <Field label="Meta Description" hint={`${(form.description ?? "").length}/160`} warn={(form.description ?? "").length > 160}>
          <textarea value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} rows={2} className={inputCls + " resize-none"} />
        </Field>
        <Field label="Keywords (מופרד בפסיקים)"><input value={form.keywords ?? ""} onChange={(e) => set("keywords", e.target.value)} className={inputCls} /></Field>
        <Field label="Canonical URL"><input value={form.canonical_url ?? ""} onChange={(e) => set("canonical_url", e.target.value)} className={inputCls} dir="ltr" placeholder="https://yahalom-la-bait.com/..." /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="OG Title"><input value={form.og_title ?? ""} onChange={(e) => set("og_title", e.target.value)} className={inputCls} /></Field>
          <Field label="OG Image URL"><input value={form.og_image ?? ""} onChange={(e) => set("og_image", e.target.value)} className={inputCls} dir="ltr" /></Field>
        </div>
        <Field label="OG Description"><textarea value={form.og_description ?? ""} onChange={(e) => set("og_description", e.target.value)} rows={2} className={inputCls + " resize-none"} /></Field>
        <div className="flex flex-wrap gap-6 pt-1">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.robots_index ?? true} onChange={(e) => set("robots_index", e.target.checked)} /> Index</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.robots_follow ?? true} onChange={(e) => set("robots_follow", e.target.checked)} /> Follow</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active ?? true} onChange={(e) => set("is_active", e.target.checked)} /> פעיל</label>
        </div>
        <div className="flex gap-2 pt-2 border-t border-border/40">
          <button onClick={save} disabled={saving} className="flex-1 rounded-full btn-rose py-3 font-semibold disabled:opacity-50">{saving ? "שומר…" : "שמור"}</button>
          <button onClick={onClose} className="rounded-full border border-border px-6 py-3 text-sm hover:bg-secondary">ביטול</button>
        </div>
      </div>
    </div>
  );
}

/* -------- Small primitives -------- */

const inputCls = "w-full rounded-xl bg-card border border-border px-4 py-2.5 text-sm outline-none focus:border-rose-gold";

function Field({ label, hint, warn, children }: { label: string; hint?: string; warn?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {hint && <span className={`text-[11px] ${warn ? "text-destructive" : "text-muted-foreground"}`}>{hint}</span>}
      </div>
      {children}
    </label>
  );
}

function PanelHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="font-serif text-2xl">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function SaveBar({ saving, onSave }: { saving: boolean; onSave: () => void }) {
  return (
    <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
      <button onClick={onSave} disabled={saving} className="rounded-full btn-rose px-6 py-2.5 text-sm font-semibold disabled:opacity-50">
        {saving ? "שומר…" : "שמור הגדרות"}
      </button>
    </div>
  );
}

function PanelSkeleton() {
  return <div className="rounded-2xl glass p-8 text-center text-sm text-muted-foreground">טוען…</div>;
}

