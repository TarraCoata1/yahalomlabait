/** Cookie + legal consent state (client-side, localStorage backed). */

export type CookiePrefs = {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  decidedAt: string;
};

const COOKIE_KEY = "ylb:cookie-consent:v1";
const MARKETING_KEY = "ylb:marketing-consent:v1";

export const COOKIE_CONSENT_EVENT = "ylb:cookie-consent-change";

export function readCookiePrefs(): CookiePrefs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(COOKIE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<CookiePrefs>;
    return {
      essential: true,
      analytics: !!p.analytics,
      marketing: !!p.marketing,
      decidedAt: p.decidedAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function writeCookiePrefs(prefs: { analytics: boolean; marketing: boolean }): CookiePrefs {
  const next: CookiePrefs = {
    essential: true,
    analytics: prefs.analytics,
    marketing: prefs.marketing,
    decidedAt: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(COOKIE_KEY, JSON.stringify(next));
    } catch { /* storage unavailable */ }
    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: next }));
  }
  return next;
}

/** Optional newsletter/marketing opt-in, remembered between visits. */
export function readMarketingConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(MARKETING_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeMarketingConsent(v: boolean) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MARKETING_KEY, v ? "1" : "0");
  } catch { /* storage unavailable */ }
}
