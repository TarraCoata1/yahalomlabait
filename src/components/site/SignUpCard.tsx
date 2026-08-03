import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { lovable } from "@/integrations/lovable/index";
import { LegalConsentCheckbox, MarketingConsentCheckbox } from "@/components/site/ConsentCheckboxes";
import { readMarketingConsent, writeMarketingConsent } from "@/lib/consent";

/**
 * Customer sign-up / sign-in card with required legal consent and
 * optional marketing consent (unchecked by default).
 */
export function SignUpCard({
  title = "התחברות או יצירת חשבון",
  description = "כדי להעלות קבצים ולשלוח הזמנה אישית יש להתחבר לחשבון.",
  redirectPath,
}: {
  title?: string;
  description?: string;
  redirectPath: string;
}) {
  const [legal, setLegal] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setMarketing(readMarketingConsent());
  }, []);

  const signIn = async () => {
    if (!legal) {
      toast.error("יש לאשר את התקנון ומדיניות הפרטיות");
      return;
    }
    setBusy(true);
    writeMarketingConsent(marketing);
    const res = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + redirectPath,
    });
    if (res.error) {
      toast.error("שגיאת התחברות: " + res.error.message);
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border-2 border-dashed border-rose-gold/40 bg-rose-gold/5 p-5 text-right">
      <h4 className="font-serif text-lg">{title}</h4>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-4 space-y-2">
        <LegalConsentCheckbox id="signup-legal" checked={legal} onChange={setLegal} context="account" />
        <MarketingConsentCheckbox id="signup-marketing" checked={marketing} onChange={setMarketing} />
      </div>
      <button
        type="button"
        onClick={signIn}
        disabled={busy || !legal}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full btn-rose py-3 text-sm font-semibold hover:btn-rose-hover disabled:opacity-50"
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        המשך עם Google
      </button>
    </div>
  );
}
