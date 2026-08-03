import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { Eye, History, Loader2, RotateCcw, Save, Send } from "lucide-react";
import { toast } from "sonner";
import { LegalContent } from "@/components/site/LegalDoc";
import {
  formatLegalDate,
  legalDocsAdminQuery,
  legalVersionsQuery,
  publishLegalDoc,
  restoreLegalVersion,
  saveLegalDraft,
  type LegalDocAdmin,
  type LegalVersion,
} from "@/lib/legal";

type Editor = { userId: string | null; email: string };

export function LegalPanel({ editor }: { editor: Editor }) {
  const { data: docs = [], isLoading } = useQuery(legalDocsAdminQuery);
  const [slug, setSlug] = useState<string>("");

  const active = useMemo(
    () => docs.find((d) => d.slug === slug) ?? docs[0] ?? null,
    [docs, slug],
  );

  if (isLoading) {
    return <div className="rounded-2xl glass p-8 text-center text-sm text-muted-foreground">טוען מסמכים…</div>;
  }
  if (docs.length === 0) {
    return <div className="rounded-2xl glass p-8 text-center text-sm text-muted-foreground">לא נמצאו מסמכים משפטיים.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {docs.map((d) => (
          <button
            key={d.id}
            onClick={() => setSlug(d.slug)}
            className={`rounded-full px-4 py-2 text-sm ${active?.slug === d.slug ? "btn-rose" : "border border-border text-muted-foreground hover:bg-secondary"}`}
          >
            {d.page_label || d.slug}
          </button>
        ))}
      </div>
      {active && <LegalEditor key={active.id} doc={active} editor={editor} />}
    </div>
  );
}

function LegalEditor({ doc, editor }: { doc: LegalDocAdmin; editor: Editor }) {
  const qc = useQueryClient();
  const router = useRouter();
  const [form, setForm] = useState({
    title: doc.title ?? "",
    eyebrow: doc.eyebrow ?? "",
    intro: doc.intro ?? "",
    draft_content: doc.draft_content || doc.published_content || "",
  });
  const [busy, setBusy] = useState<"draft" | "publish" | null>(null);
  const [preview, setPreview] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    setForm({
      title: doc.title ?? "",
      eyebrow: doc.eyebrow ?? "",
      intro: doc.intro ?? "",
      draft_content: doc.draft_content || doc.published_content || "",
    });
  }, [doc.id, doc.title, doc.eyebrow, doc.intro, doc.draft_content, doc.published_content]);

  const dirty = form.draft_content !== (doc.draft_content || doc.published_content || "");
  const unpublished = (doc.draft_content || "") !== (doc.published_content || "");

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["legal_docs"] });
    qc.invalidateQueries({ queryKey: ["legal_doc"] });
    qc.invalidateQueries({ queryKey: ["legal_versions", doc.id] });
    router.invalidate();
  };

  const set = <K extends keyof typeof form>(k: K, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onSave = async () => {
    setBusy("draft");
    try {
      await saveLegalDraft(doc, form, editor);
      toast.success("הטיוטה נשמרה");
      refresh();
    } catch (e) {
      toast.error("שגיאה בשמירה: " + (e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const onPublish = async () => {
    if (!confirm("לפרסם את הגרסה הזו לאתר? הגרסה הקודמת תישמר בהיסטוריה.")) return;
    setBusy("publish");
    try {
      await publishLegalDoc(doc, form, editor);
      toast.success("המסמך פורסם");
      refresh();
    } catch (e) {
      toast.error("שגיאה בפרסום: " + (e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const onRestore = async (v: LegalVersion) => {
    if (!confirm(`לשחזר את הגרסה מ־${formatLegalDate(v.created_at)} לטיוטה?`)) return;
    try {
      await restoreLegalVersion(doc, v, editor);
      toast.success("הגרסה שוחזרה לטיוטה — בדקו ולחצו פרסום");
      refresh();
    } catch (e) {
      toast.error("שגיאה בשחזור: " + (e as Error).message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl glass p-4 text-xs">
        <span className="text-muted-foreground">
          פורסם לאחרונה: <span className="text-foreground">{formatLegalDate(doc.published_at)}</span>
        </span>
        <span className="text-muted-foreground">
          עודכן על ידי: <span className="text-foreground">{doc.updated_by_email || "—"}</span>
        </span>
        {(unpublished || dirty) && (
          <span className="rounded-full bg-amber-400/15 px-3 py-1 text-amber-400">יש שינויים שלא פורסמו</span>
        )}
        <span className="ms-auto font-mono text-muted-foreground" dir="ltr">/{doc.slug}</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <label className="block text-sm">
          <span className="text-xs text-muted-foreground">כותרת עליונה (Eyebrow)</span>
          <input value={form.eyebrow} onChange={(e) => set("eyebrow", e.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-card px-4 py-2.5 outline-none focus:border-rose-gold" />
        </label>
        <label className="block text-sm lg:col-span-2">
          <span className="text-xs text-muted-foreground">כותרת המסמך (H1)</span>
          <input value={form.title} onChange={(e) => set("title", e.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-card px-4 py-2.5 outline-none focus:border-rose-gold" />
        </label>
        <label className="block text-sm lg:col-span-3">
          <span className="text-xs text-muted-foreground">תקציר / פסקת פתיחה</span>
          <textarea value={form.intro} onChange={(e) => set("intro", e.target.value)} rows={2}
            className="mt-1 w-full resize-none rounded-xl border border-border bg-card px-4 py-2.5 outline-none focus:border-rose-gold" />
        </label>
      </div>

      <div className="rounded-2xl glass p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-serif text-lg">תוכן המסמך</h3>
          <div className="flex gap-2 text-xs">
            <button onClick={() => setPreview((p) => !p)}
              className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 hover:bg-secondary">
              <Eye className="h-3.5 w-3.5" /> {preview ? "חזרה לעריכה" : "תצוגה מקדימה"}
            </button>
            <button onClick={() => setShowHistory((h) => !h)}
              className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 hover:bg-secondary">
              <History className="h-3.5 w-3.5" /> היסטוריית גרסאות
            </button>
          </div>
        </div>

        {preview ? (
          <div className="mt-4 rounded-xl border border-border/60 bg-card/50 p-5">
            <div className="text-xs uppercase tracking-widest text-rose-gold">{form.eyebrow}</div>
            <h1 className="mt-1 font-serif text-2xl">{form.title}</h1>
            {form.intro && <p className="mt-2 text-sm text-muted-foreground">{form.intro}</p>}
            <div className="mt-4">
              <LegalContent content={form.draft_content} />
            </div>
          </div>
        ) : (
          <>
            <textarea
              value={form.draft_content}
              onChange={(e) => set("draft_content", e.target.value)}
              rows={22}
              dir="rtl"
              className="mt-4 w-full rounded-xl border border-border bg-card px-4 py-3 font-mono text-xs leading-6 outline-none focus:border-rose-gold"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              נתמך Markdown בסיסי: ## כותרת, - רשימה, **מודגש**, [טקסט](קישור).
            </p>
          </>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={onSave} disabled={busy !== null}
            className="flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm hover:bg-secondary disabled:opacity-50">
            {busy === "draft" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} שמירת טיוטה
          </button>
          <button onClick={onPublish} disabled={busy !== null}
            className="flex items-center gap-2 rounded-full btn-rose px-5 py-2.5 text-sm font-semibold hover:btn-rose-hover disabled:opacity-50">
            {busy === "publish" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} פרסום לאתר
          </button>
        </div>
      </div>

      {showHistory && <VersionHistory doc={doc} onRestore={onRestore} />}
    </div>
  );
}

function VersionHistory({ doc, onRestore }: { doc: LegalDocAdmin; onRestore: (v: LegalVersion) => void }) {
  const { data: versions = [], isLoading } = useQuery(legalVersionsQuery(doc.id));
  const [open, setOpen] = useState<string | null>(null);

  if (isLoading) return <div className="rounded-2xl glass p-6 text-sm text-muted-foreground">טוען היסטוריה…</div>;

  return (
    <div className="rounded-2xl glass p-4">
      <h3 className="font-serif text-lg">היסטוריית גרסאות</h3>
      {versions.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">אין גרסאות שפורסמו עדיין.</p>
      ) : (
        <ul className="mt-3 divide-y divide-border/40 text-sm">
          {versions.map((v) => (
            <li key={v.id} className="py-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-medium">{formatLegalDate(v.created_at)}</span>
                <span className="text-xs text-muted-foreground">{v.published_by_email || "—"}</span>
                <div className="ms-auto flex gap-2 text-xs">
                  <button onClick={() => setOpen(open === v.id ? null : v.id)}
                    className="rounded-full border border-border px-3 py-1.5 hover:bg-secondary">
                    {open === v.id ? "סגירה" : "צפייה"}
                  </button>
                  <button onClick={() => onRestore(v)}
                    className="flex items-center gap-1.5 rounded-full border border-rose-gold/60 px-3 py-1.5 text-rose-gold hover:bg-rose-gold/10">
                    <RotateCcw className="h-3.5 w-3.5" /> שחזור
                  </button>
                </div>
              </div>
              {open === v.id && (
                <div className="mt-3 max-h-80 overflow-auto rounded-xl border border-border/60 bg-card/50 p-4">
                  <LegalContent content={v.content} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
