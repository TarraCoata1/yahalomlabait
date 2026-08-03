import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Cookie, SlidersHorizontal, X } from "lucide-react";
import {
  COOKIE_CONSENT_EVENT,
  readCookiePrefs,
  writeCookiePrefs,
} from "@/lib/consent";

/**
 * Cookie consent banner — Accept all / Reject non-essential / Customize.
 * Essential cookies are always on (session, cart, security).
 */
export function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [customize, setCustomize] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const existing = readCookiePrefs();
    if (!existing) {
      setOpen(true);
      return;
    }
    setAnalytics(existing.analytics);
    setMarketing(existing.marketing);
  }, []);

  useEffect(() => {
    const reopen = () => {
      const existing = readCookiePrefs();
      setAnalytics(!!existing?.analytics);
      setMarketing(!!existing?.marketing);
      setCustomize(true);
      setOpen(true);
    };
    window.addEventListener("ylb:open-cookie-settings", reopen);
    return () => window.removeEventListener("ylb:open-cookie-settings", reopen);
  }, []);

  const decide = (next: { analytics: boolean; marketing: boolean }) => {
    writeCookiePrefs(next);
    setOpen(false);
    setCustomize(false);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
      dir="rtl"
      className="fixed inset-x-0 bottom-0 z-[70] p-3 sm:p-4"
    >
      <div className="mx-auto max-w-4xl rounded-2xl glass-strong border border-border/60 p-5 shadow-2xl">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-rose-gold/15 text-rose-gold">
            <Cookie className="h-5 w-5" aria-hidden />
          </span>
          <div className="flex-1">
            <h2 id="cookie-consent-title" className="font-serif text-lg">
              אנחנו משתמשים בעוגיות
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              עוגיות חיוניות נדרשות לתפקוד האתר (עגלה, התחברות ואבטחה). עוגיות אנליטיקה ושיווק
              נטענות רק בהסכמתכם. פרטים מלאים ב
              <Link to="/cookies" className="text-rose-gold hover:underline"> מדיניות העוגיות</Link>{" "}
              וב
              <Link to="/privacy" className="text-rose-gold hover:underline">מדיניות הפרטיות</Link>.
            </p>

            {customize && (
              <div className="mt-4 space-y-2">
                <ToggleRow
                  title="עוגיות חיוניות"
                  desc="נדרשות לתפעול האתר — לא ניתן לכבות."
                  checked
                  disabled
                  onChange={() => {}}
                />
                <ToggleRow
                  title="אנליטיקה ומדידה"
                  desc="עוזרות לנו להבין כיצד משתמשים באתר ולשפר אותו."
                  checked={analytics}
                  onChange={setAnalytics}
                />
                <ToggleRow
                  title="שיווק ורימרקטינג"
                  desc="התאמת פרסום ומודעות ברשתות החברתיות."
                  checked={marketing}
                  onChange={setMarketing}
                />
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => decide({ analytics: true, marketing: true })}
                className="rounded-full btn-rose px-5 py-2.5 text-sm font-semibold hover:btn-rose-hover"
              >
                אישור הכל
              </button>
              <button
                type="button"
                onClick={() => decide({ analytics: false, marketing: false })}
                className="rounded-full border border-border px-5 py-2.5 text-sm hover:bg-secondary"
              >
                דחיית לא־חיוניות
              </button>
              {customize ? (
                <button
                  type="button"
                  onClick={() => decide({ analytics, marketing })}
                  className="rounded-full border border-rose-gold/60 px-5 py-2.5 text-sm text-rose-gold hover:bg-rose-gold/10"
                >
                  שמירת ההעדפות שלי
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setCustomize(true)}
                  className="flex items-center gap-1.5 rounded-full border border-border px-5 py-2.5 text-sm hover:bg-secondary"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden /> התאמה אישית
                </button>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => decide({ analytics: false, marketing: false })}
            aria-label="סגירה ודחיית עוגיות לא־חיוניות"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full hover:bg-secondary"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  title, desc, checked, disabled, onChange,
}: {
  title: string; desc: string; checked: boolean; disabled?: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label className={`flex items-start gap-3 rounded-xl border border-border/60 p-3 ${disabled ? "opacity-70" : "cursor-pointer hover:border-rose-gold/50"}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 accent-rose-gold"
      />
      <span>
        <span className="block text-sm font-medium">{title}</span>
        <span className="block text-xs text-muted-foreground">{desc}</span>
      </span>
    </label>
  );
}

/** Footer/anywhere trigger to reopen the cookie preferences. */
export function openCookieSettings() {
  window.dispatchEvent(new Event("ylb:open-cookie-settings"));
}
