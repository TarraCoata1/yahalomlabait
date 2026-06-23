import { useState } from "react";
import { MessageCircle, Accessibility, X, Type, Contrast, Pause, BookOpen, RotateCcw } from "lucide-react";

export function FloatingWidgets() {
  const [a11yOpen, setA11yOpen] = useState(false);
  const [scale, setScale] = useState(100);
  const [contrast, setContrast] = useState(false);
  const [stopMotion, setStopMotion] = useState(false);
  const [readable, setReadable] = useState(false);

  const applyScale = (v: number) => {
    setScale(v);
    document.documentElement.style.fontSize = `${v}%`;
  };
  const toggleContrast = () => {
    const next = !contrast;
    setContrast(next);
    document.documentElement.classList.toggle("a11y-contrast", next);
  };
  const toggleMotion = () => {
    const next = !stopMotion;
    setStopMotion(next);
    document.documentElement.classList.toggle("motion-reduce", next);
  };
  const toggleReadable = () => {
    const next = !readable;
    setReadable(next);
    document.documentElement.classList.toggle("a11y-readable", next);
  };
  const reset = () => {
    applyScale(100);
    if (contrast) toggleContrast();
    if (stopMotion) toggleMotion();
    if (readable) toggleReadable();
  };

  return (
    <>
      <a href="https://api.whatsapp.com/send?phone=972533206500" target="_blank" rel="noopener noreferrer"
        aria-label="WhatsApp"
        className="fixed bottom-6 left-6 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-elegant transition hover:scale-105">
        <MessageCircle className="h-6 w-6" />
      </a>

      <button onClick={() => setA11yOpen(true)} aria-label="פתח תפריט נגישות"
        className="sparkle after:sparkle-after fixed bottom-6 right-6 z-40 grid h-14 w-14 place-items-center rounded-full btn-rose hover:btn-rose-hover diamond-border after:diamond-border-after">
        <Accessibility className="h-6 w-6 relative z-10" />
      </button>

      {a11yOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:items-center sm:justify-center">
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={() => setA11yOpen(false)} />
          <div className="relative w-full max-w-md glass rounded-2xl p-6 diamond-border after:diamond-border-after">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-serif text-2xl text-gradient-rose">תפריט נגישות</h3>
              <button onClick={() => setA11yOpen(false)} aria-label="סגור"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-card/50 p-3 border border-border/60">
                <div className="flex items-center gap-2"><Type className="h-4 w-4 text-rose-gold" /><span>גודל טקסט</span></div>
                <div className="flex items-center gap-2">
                  <button onClick={() => applyScale(Math.max(80, scale - 10))} aria-label="הקטן טקסט" className="h-8 w-8 rounded bg-secondary hover:bg-accent">-</button>
                  <span className="w-12 text-center text-sm font-semibold">{scale}%</span>
                  <button onClick={() => applyScale(Math.min(150, scale + 10))} aria-label="הגדל טקסט" className="h-8 w-8 rounded bg-secondary hover:bg-accent">+</button>
                </div>
              </div>
              <button onClick={toggleContrast} className="flex w-full items-center justify-between rounded-lg bg-card/50 p-3 text-right border border-border/60 hover:border-rose-gold/60">
                <span className="flex items-center gap-2"><Contrast className="h-4 w-4 text-rose-gold" />ניגודיות גבוהה</span>
                <span className="text-sm text-muted-foreground">{contrast ? "פעיל" : "כבוי"}</span>
              </button>
              <button onClick={toggleReadable} className="flex w-full items-center justify-between rounded-lg bg-card/50 p-3 text-right border border-border/60 hover:border-rose-gold/60">
                <span className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-rose-gold" />גופן קריא</span>
                <span className="text-sm text-muted-foreground">{readable ? "פעיל" : "כבוי"}</span>
              </button>
              <button onClick={toggleMotion} className="flex w-full items-center justify-between rounded-lg bg-card/50 p-3 text-right border border-border/60 hover:border-rose-gold/60">
                <span className="flex items-center gap-2"><Pause className="h-4 w-4 text-rose-gold" />עצירת אנימציות</span>
                <span className="text-sm text-muted-foreground">{stopMotion ? "פעיל" : "כבוי"}</span>
              </button>
              <button onClick={reset} className="flex w-full items-center justify-center gap-2 rounded-lg border border-rose-gold/40 py-2 text-sm hover:bg-secondary">
                <RotateCcw className="h-4 w-4" /> איפוס הגדרות
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
