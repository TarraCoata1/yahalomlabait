import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut, ShieldCheck, Plus, Pencil, Trash2, EyeOff, Eye, Search } from "lucide-react";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { useSession, useIsAdmin, signOut } from "@/hooks/use-auth";
import { categoriesQuery, productsQuery, type Category, type Product } from "@/lib/catalog";
import { EditProductDialog } from "@/components/admin/EditProductDialog";
import { toast } from "sonner";
import logo from "@/assets/logo.png.asset.json";

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
  const [tab, setTab] = useState<"products" | "categories" | "seo">("products");

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

      <div className="mb-6 inline-flex rounded-full glass p-1">
        <button onClick={() => setTab("products")} className={`rounded-full px-5 py-2 text-sm ${tab === "products" ? "btn-rose" : "text-muted-foreground"}`}>מוצרים</button>
        <button onClick={() => setTab("categories")} className={`rounded-full px-5 py-2 text-sm ${tab === "categories" ? "btn-rose" : "text-muted-foreground"}`}>קטגוריות</button>
        <button onClick={() => setTab("seo")} className={`rounded-full px-5 py-2 text-sm ${tab === "seo" ? "btn-rose" : "text-muted-foreground"}`}>SEO</button>
      </div>

      {tab === "products" ? <ProductsPanel /> : tab === "categories" ? <CategoriesPanel /> : <SeoPanel />}
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
