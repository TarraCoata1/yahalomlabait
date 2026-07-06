import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";
import { localizedMeta, canonicalLink } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: localizedMeta({
      title: "מדיניות פרטיות | יהלום לבית",
      description: "מדיניות הפרטיות של יהלום לבית — כיצד אנו אוספים, שומרים ומשתמשים במידע שלכם.",
      path: "/privacy",
    }),
    links: canonicalLink("/privacy"),
  }),
  component: () => (
    <InfoPage
      eyebrow="פרטיות"
      title="מדיניות פרטיות"
      intro="אנו מכבדים את פרטיותכם ופועלים לפי חוק הגנת הפרטיות בישראל."
      sections={[
        { q: "המידע שאנו אוספים", a: "פרטי התקשרות (שם, טלפון, אימייל, כתובת) הנחוצים להשלמת ההזמנה והמשלוח בלבד." },
        { q: "שימוש במידע", a: "לצורך מימוש ההזמנה, שירות לקוחות ושליחת עדכונים שיווקיים במידה ואישרתם זאת מפורשות." },
        { q: "אבטחת מידע", a: "אנו משתמשים בתקני SSL וספקי תשלום מאובטחים (Stripe/PayPal). פרטי אשראי אינם נשמרים אצלנו." },
        { q: "עוגיות", a: "האתר משתמש בעוגיות טכניות בלבד לשיפור חוויית הגלישה. ניתן לחסום אותן בהגדרות הדפדפן." },
        { q: "זכויותיכם", a: "בכל עת ניתן לפנות אלינו לצורך עיון, תיקון או מחיקת המידע האישי שלכם ממאגרינו." },
      ]}
    />
  ),
});
