import { SignUpCard } from "@/components/site/SignUpCard";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useRef, useEffect } from "react";
import { Upload, Sparkles, Check, Wrench, X, FileText, Loader2, AlertCircle } from "lucide-react";
import { sizesFor, installationFee } from "@/lib/products";
import { ORIENTATIONS, orientationLabel, type Orientation } from "@/lib/catalog";
import { trackAddToCart } from "@/lib/analytics";
import { useCart } from "@/lib/cart";
import { pageSeoQuery, buildSeoHead } from "@/lib/page-seo";
import { useSession } from "@/hooks/use-auth";
import {
  ACCEPT_ATTR,
  MAX_FILES,
  MAX_FILE_MB,
  formatSize,
  isImage,
  toAttachments,
  uploadCustomFile,
  validateFile,
  type UploadItem,
} from "@/lib/custom-uploads";
import { toast } from "sonner";

export const Route = createFileRoute("/custom")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageSeoQuery("/custom")),
  head: ({ loaderData }) => buildSeoHead({ routePath: "/custom", seo: loaderData ?? null }),
  component: CustomPage,
});

const BASE = 900;

const SCREW_OPTIONS = [
  { id: "silver" as const, label: "כסוף", swatch: "linear-gradient(135deg, #e8e8ea 0%, #b8b8bd 50%, #9a9aa1 100%)" },
  { id: "gold" as const,   label: "זהב",  swatch: "linear-gradient(135deg, #f7e3a8 0%, #d4a85a 50%, #8c6a2d 100%)" },
  { id: "black" as const,  label: "שחור", swatch: "linear-gradient(135deg, #3a3a3c 0%, #1a1a1c 50%, #050505 100%)" },
];

function randomId() {
  return Math.random().toString(36).slice(2, 10);
}

function CustomPage() {
  const [orientation, setOrientation] = useState<Orientation>("rectangle");
  const [sizeIdx, setSizeIdx] = useState(1);
  const [screwColor, setScrewColor] = useState<"silver" | "gold" | "black">("silver");
  const [withInstall, setWithInstall] = useState(false);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const { user } = useSession();
  const sessionId = user?.id ?? "";
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const add = useCart((s) => s.add);

  const sizeList = sizesFor(orientation);
  const size = sizeList[Math.min(sizeIdx, sizeList.length - 1)];
  const basePrice = BASE + size.price;
  const installFee = useMemo(() => installationFee(size), [size]);
  const price = basePrice + (withInstall ? installFee : 0);
  const screw = SCREW_OPTIONS.find((s) => s.id === screwColor)!;

  const doneUploads = uploads.filter((u) => u.status === "done");
  const hasPending = uploads.some((u) => u.status === "uploading" || u.status === "pending");
  const primaryPreview = doneUploads.find((u) => u.previewUrl)?.previewUrl
    ?? uploads.find((u) => u.previewUrl)?.previewUrl
    ?? null;

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      uploads.forEach((u) => { if (u.previewUrl) URL.revokeObjectURL(u.previewUrl); });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFiles = async (files: FileList | File[]) => {
    if (!sessionId) {
      toast.error("יש להתחבר כדי להעלות קבצים");
      return;
    }
    const arr = Array.from(files);
    if (uploads.length + arr.length > MAX_FILES) {
      toast.error(`ניתן להעלות עד ${MAX_FILES} קבצים`);
      return;
    }
    for (const file of arr) {
      const err = validateFile(file);
      const id = randomId();
      const previewUrl = isImage(file) ? URL.createObjectURL(file) : null;
      if (err) {
        setUploads((u) => [...u, { id, file, previewUrl, progress: 0, status: "error", error: err }]);
        continue;
      }
      setUploads((u) => [...u, { id, file, previewUrl, progress: 0, status: "uploading" }]);
      try {
        const path = await uploadCustomFile(sessionId, file, (pct) => {
          setUploads((u) => u.map((it) => it.id === id ? { ...it, progress: pct } : it));
        });
        setUploads((u) => u.map((it) => it.id === id ? { ...it, status: "done", progress: 100, path } : it));
      } catch (e) {
        setUploads((u) => u.map((it) => it.id === id ? { ...it, status: "error", error: (e as Error).message } : it));
        toast.error(`העלאה נכשלה: ${file.name}`);
      }
    }
  };

  const removeUpload = (id: string) => {
    setUploads((u) => {
      const it = u.find((x) => x.id === id);
      if (it?.previewUrl) URL.revokeObjectURL(it.previewUrl);
      return u.filter((x) => x.id !== id);
    });
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  const canAdd = doneUploads.length > 0 && !hasPending;

  const addToCart = () => {
    if (!canAdd) return;
    const attachments = toAttachments(uploads);
    add({
      productId: `custom-print-${sessionId}`,
      sku: "CUSTOM",
      name: "הדפסה בעיצוב אישי",
      image: primaryPreview ?? "",
      orientation,
      sizeId: size.id,
      sizeLabel: size.label,
      basePrice,
      screwColor,
      screwColorLabel: screw.label,
      withInstallation: withInstall,
      installationFee: withInstall ? installFee : 0,
      unitPrice: price,
      attachments,
    });
    toast.success("נוסף לעגלה");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 md:px-8">
      <header className="text-center">
        <span className="text-xs uppercase tracking-[0.3em] text-rose-gold">הדפס בעיצוב אישי</span>
        <h1 className="mt-3 font-serif text-4xl md:text-6xl">היצירה שלכם, על זכוכית פרימיום</h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">העלו תמונה או קובץ עיצוב, בחרו מידה וקבלו תצוגה מקדימה. הצוות שלנו יבדוק את האיכות לפני ההדפסה ויחזור אליכם לאישור.</p>
      </header>

      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        {/* Preview */}
        <div className="relative">
          <div className="overflow-hidden rounded-2xl glass">
            <div className="relative aspect-[4/3] bg-card">
              <div className="absolute inset-0 bg-gradient-to-b from-secondary to-card" />
              <div className="absolute inset-x-12 bottom-6 top-10 grid place-items-center">
                <div className="relative h-full w-full max-w-md rounded-md bg-card shadow-2xl ring-1 ring-rose-gold/40">
                  {primaryPreview ? (
                    <img src={primaryPreview} alt="תצוגה מקדימה" className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-center text-muted-foreground">
                      <div>
                        <Upload className="mx-auto h-10 w-10 text-rose-gold/60" />
                        <p className="mt-2 text-sm">העלו קובץ כדי לראות תצוגה מקדימה</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute -inset-px rounded-md ring-1 ring-white/10 pointer-events-none" />
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-background/60 to-transparent" />
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">המוצר הסופי — הדפסה דיגיטלית על זכוכית מחוסמת בעובי 6 מ"מ</p>
        </div>

        {/* Form */}
        <div>
          <div className="rounded-2xl glass p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl">1. העלו קבצים</h3>
              <span className="text-xs text-muted-foreground">{uploads.length}/{MAX_FILES}</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              תמונות (JPG/PNG/WEBP/HEIC/SVG) או קבצי עיצוב (PDF/AI/EPS) · עד {MAX_FILE_MB}MB לקובץ
            </p>
            <input ref={fileRef} type="file" accept={ACCEPT_ATTR} multiple hidden
              onChange={(e) => e.target.files && handleFiles(e.target.files)} />
            {!sessionId ? (
              <div className="mt-4">
                <SignUpCard redirectPath="/custom" />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed py-8 transition ${
                  dragOver ? "border-rose-gold bg-rose-gold/10" : "border-rose-gold/40 bg-rose-gold/5 hover:border-rose-gold"
                }`}>
                <Upload className="h-5 w-5 text-rose-gold" />
                <span>{uploads.length ? "הוסיפו קבצים נוספים" : "בחרו קבצים או גררו לכאן"}</span>
              </button>
            )}

            {uploads.length > 0 && (
              <ul className="mt-4 space-y-2">
                {uploads.map((u) => (
                  <li key={u.id} className="flex items-center gap-3 rounded-xl border border-border bg-card/50 p-2.5">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-secondary grid place-items-center">
                      {u.previewUrl
                        ? <img src={u.previewUrl} alt="" className="h-full w-full object-cover" />
                        : <FileText className="h-5 w-5 text-muted-foreground" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm">{u.file.name}</div>
                      <div className="text-xs text-muted-foreground">{formatSize(u.file.size)}</div>
                      {u.status === "uploading" && (
                        <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-secondary">
                          <div className="h-full bg-rose-gold transition-all" style={{ width: `${u.progress}%` }} />
                        </div>
                      )}
                      {u.status === "error" && (
                        <div className="mt-0.5 flex items-center gap-1 text-xs text-destructive">
                          <AlertCircle className="h-3 w-3" /> {u.error}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {u.status === "uploading" && <Loader2 className="h-4 w-4 animate-spin text-rose-gold" />}
                      {u.status === "done" && <Check className="h-4 w-4 text-rose-gold" />}
                      <button onClick={() => removeUpload(u.id)} aria-label="הסר קובץ"
                        className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-5 rounded-2xl glass p-6">
            <h3 className="font-serif text-xl">2. בחרו פורמט ומידה</h3>
            <fieldset className="mt-4">
              <legend className="text-xs text-muted-foreground">פורמט היצירה</legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {ORIENTATIONS.map((o) => (
                  <label
                    key={o.id}
                    className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm transition ${
                      orientation === o.id ? "border-rose-gold bg-rose-gold/10 text-rose-gold" : "border-border hover:border-rose-gold/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="custom-orientation"
                      value={o.id}
                      checked={orientation === o.id}
                      onChange={() => { setOrientation(o.id); setSizeIdx(0); }}
                      className="h-4 w-4 accent-rose-gold"
                    />
                    <span aria-hidden className="block w-5 rounded border border-current opacity-70" style={{ aspectRatio: o.ratio }} />
                    <span>{o.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {sizeList.map((s, i) => (
                <button key={s.id} onClick={() => setSizeIdx(i)}
                  className={`rounded-xl border-2 px-3 py-3 text-sm transition ${size.id === s.id ? "border-rose-gold bg-rose-gold/10 text-rose-gold" : "border-border hover:border-rose-gold/50"}`}>
                  <div className="font-medium">{s.label}</div>
                  <div className="text-xs text-muted-foreground">₪{BASE + s.price}</div>
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              המידות הזמינות נגזרות מהפורמט שנבחר ({orientationLabel(orientation)}) — לא ניתן לשלב מידה מפורמט אחר.
            </p>
          </div>


          <div className="mt-5 rounded-2xl glass p-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-serif text-xl">3. צבע ברגי תליה</h3>
              <span className="text-xs text-muted-foreground">{screw.label}</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {SCREW_OPTIONS.map((opt) => (
                <button key={opt.id} onClick={() => setScrewColor(opt.id)} aria-label={`בורג ${opt.label}`} aria-pressed={screwColor === opt.id}
                  className={`flex items-center gap-2 rounded-full border-2 py-2 pl-4 pr-2 text-sm transition ${
                    screwColor === opt.id ? "border-rose-gold bg-rose-gold/10 text-rose-gold" : "border-border hover:border-rose-gold/50"
                  }`}>
                  <span className="h-6 w-6 rounded-full ring-1 ring-border shadow-inner" style={{ background: opt.swatch }} />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">ללא תוספת מחיר — בחירה בהתאמה לעיצוב החלל.</p>
          </div>

          <label className={`mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 transition ${withInstall ? "border-rose-gold bg-rose-gold/5" : "border-border hover:border-rose-gold/50"}`}>
            <input type="checkbox" checked={withInstall} onChange={(e) => setWithInstall(e.target.checked)} className="mt-1 h-5 w-5 accent-rose-gold" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-rose-gold" />
                <span className="font-medium">הוסף התקנה מקצועית לבית</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                תיאום מועד, מדידה והרכבה על ידי מתקין מוסמך. למידות עד 70×100 ס״מ — ₪300 (כולל מע״מ).
              </p>
              <p className="mt-1 text-xs text-rose-gold/90">
                למידות מעל 70×100 ס״מ — ₪420 (כולל מע״מ).
              </p>
            </div>
            <div className="shrink-0 text-left">
              <div className="text-xs text-muted-foreground">תוספת</div>
              <div className="font-semibold text-rose-gold">+₪{installFee}</div>
            </div>
          </label>

          <div className="mt-5 rounded-2xl glass p-6">
            <h3 className="font-serif text-xl">4. סקירה והזמנה</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2"><Check className="h-4 w-4 text-rose-gold" />בדיקת איכות מקצועית של הקובץ</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-rose-gold" />תצוגת הוכחה (Proof) לפני ייצור</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-rose-gold" />זמן אספקה: עד 14 ימי עסקים</li>
            </ul>
            <div className="mt-5 flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">סה"כ (כולל מע״מ)</div>
                <div className="text-2xl font-semibold text-rose-gold">₪{price}</div>
                {withInstall && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    הדפסה ₪{basePrice} + התקנה ₪{installFee}
                  </div>
                )}
                {doneUploads.length > 0 && (
                  <div className="mt-1 text-xs text-muted-foreground">{doneUploads.length} קבצים מצורפים</div>
                )}
              </div>
              <button
                disabled={!canAdd}
                onClick={addToCart}
                className="rounded-full btn-rose px-6 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50 hover:btn-rose-hover">
                <span className="inline-flex items-center gap-2">
                  {hasPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {hasPending ? "מעלה קבצים…" : "הוסף לעגלה"}
                </span>
              </button>
            </div>
            {!canAdd && !hasPending && (
              <p className="mt-3 text-center text-xs text-muted-foreground">יש להעלות לפחות קובץ אחד להמשך.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
