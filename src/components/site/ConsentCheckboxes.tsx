import { Link } from "@tanstack/react-router";

/** Required legal consent checkbox (terms + privacy). */
export function LegalConsentCheckbox({
  checked, onChange, id = "legal-consent", context = "purchase",
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  id?: string;
  context?: "purchase" | "account";
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/60 p-3 text-sm hover:border-rose-gold/50">
      <input
        id={id}
        type="checkbox"
        required
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 accent-rose-gold"
      />
      <span>
        {context === "purchase" ? "קראתי ואני מאשר/ת את " : "אני מאשר/ת את "}
        <Link to="/terms" target="_blank" className="text-rose-gold hover:underline">תקנון האתר ותנאי השימוש</Link>
        {", "}
        <Link to="/privacy" target="_blank" className="text-rose-gold hover:underline">מדיניות הפרטיות</Link>
        {" ו"}
        <Link to="/cookies" target="_blank" className="text-rose-gold hover:underline">מדיניות העוגיות</Link>
        <span className="text-rose-gold"> *</span>
        {context === "purchase" && (
          <span className="mt-1 block text-xs text-muted-foreground">
            כולל המדיניות לפיה ההזמנות מיוצרות בהתאמה אישית וסופיות.
          </span>
        )}
      </span>
    </label>
  );
}

/** Optional marketing / newsletter consent — unchecked by default. */
export function MarketingConsentCheckbox({
  checked, onChange, id = "marketing-consent",
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  id?: string;
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/60 p-3 text-sm hover:border-rose-gold/50">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 accent-rose-gold"
      />
      <span>
        אני מעוניין/ת לקבל עדכונים, השקות ומבצעים במייל או ב־SMS
        <span className="mt-1 block text-xs text-muted-foreground">
          אופציונלי · ניתן להסיר את ההרשמה בכל עת.
        </span>
      </span>
    </label>
  );
}
