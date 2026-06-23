import { useState } from "react";
import { MessageCircle, Accessibility, X, Type, Contrast, Pause } from "lucide-react";

export function FloatingWidgets() {
  const [a11yOpen, setA11yOpen] = useState(false);
  const [scale, setScale] = useState(100);
  const [contrast, setContrast] = useState(false);
  const [stopMotion, setStopMotion] = useState(false);

  const applyScale = (v: number) => {
    setScale(v);
    document.documentElement.style.fontSize = `${v}%`;
  };
  const toggleContrast = () => {
    const next = !contrast;
    setContrast(next);
    document.documentElement.style.filter = next ? "contrast(1.25) saturate(1.1)" : "";
  };
  const toggleMotion = () => {
    const next = !stopMotion;
    setStopMotion(next);
    document.documentElement.style.setProperty("scroll-behavior", next ? "auto" : "");
    document.documentElement.classList.toggle("motion-reduce", next);
  };

  return (
    <>
      <a href="https://api.whatsapp.com/send?phone=972533206500" target="_blank" rel="noopener noreferrer"
        aria-label="WhatsApp"
        className="fixed bottom-6 left-6 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-elegant transition hover:scale-105">
        <MessageCircle className="h-6 w-6" />
      </a>

      <button onClick={() => setA11yOpen(true)} aria-label="נגישות"
        className="fixed bottom-6 right-6 z-40 grid h-14 w-14 place-items-center rounded-full btn-rose hover:btn-rose-hover">
        <Accessibility className="h-6 w-6" />
      </button>

      {a11yOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:items-center sm:justify-center">
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={() => setA11yOpen(false)} />
          <div className="relative w-full max-w-md glass rounded-2xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-serif text-xl">תפריט נגישות</h3>
              <button onClick={() => setA11yOpen(false)} aria-label="סגור"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-card/50 p-3">
                <div className="flex items-center gap-2"><Type className="h-4 w-4 text-rose-gold" /><span>גודל טקסט</span></div>
                <div className="flex items-center gap-2">
                  <button onClick={() => applyScale(Math.max(80, scale - 10))} className="h-8 w-8 rounded bg-secondary">-</button>
                  <span className="w-12 text-center text-sm">{scale}%</span>
                  <button onClick={() => applyScale(Math.min(150, scale + 10))} className="h-8 w-8 rounded bg-secondary">+</button>
                </div>
              </div>
              <button onClick={toggleContrast} className="flex w-full items-center justify-between rounded-lg bg-card/50 p-3 text-right">
                <span className="flex items-center gap-2"><Contrast className="h-4 w-4 text-rose-gold" />ניגודיות גבוהה</span>
                <span className="text-sm text-muted-foreground">{contrast ? "פעיל" : "כבוי"}</span>
              </button>
              <button onClick={toggleMotion} className="flex w-full items-center justify-between rounded-lg bg-card/50 p-3 text-right">
                <span className="flex items-center gap-2"><Pause className="h-4 w-4 text-rose-gold" />עצירת אנימציות</span>
                <span className="text-sm text-muted-foreground">{stopMotion ? "פעיל" : "כבוי"}</span>
              </button>
              <button onClick={() => { applyScale(100); if (contrast) toggleContrast(); if (stopMotion) toggleMotion(); }}
                className="w-full rounded-lg border border-border py-2 text-sm hover:bg-secondary">
                איפוס
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
