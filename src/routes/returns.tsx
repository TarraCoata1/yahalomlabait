import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";
import { localizedMeta, canonicalLink } from "@/lib/seo";

export const Route = createFileRoute("/returns")({
  head: () => ({
    meta: localizedMeta({
      title: "מדיניות החזרות | יהלום לבית",
      description: "מדיניות ההחזרות של יהלום לבית — 14 ימי החזרה על מוצרי מדף.",
      path: "/returns",
    }),
    links: canonicalLink("/returns"),
  }),
  component: () => (
    <InfoPage
      eyebrow="מדיניות"
      title="החזרות והחלפות"
      intro="שביעות הרצון שלכם היא בראש סדר העדיפויות שלנו."
      sections={[
        { q: "החזרה תוך 14 יום", a: "מוצרי מדף שלא נפגמו ניתן להחזיר תוך 14 ימים מיום קבלת המשלוח לזיכוי מלא." },
        { q: "הזמנות בעיצוב אישי", a: "על פי חוק, פריטים המיוצרים בהתאמה אישית אינם ניתנים להחזרה, אלא במקרה של פגם ייצור." },
        { q: "פגם ייצור", a: "במקרה של פגם — יש ליצור קשר תוך 48 שעות מהקבלה עם תמונה של הפגם. אנו נחליף את המוצר על חשבוננו." },
        { q: "תהליך ההחזרה", a: "פנו אלינו בטלפון או באימייל, נשלח שליח לאיסוף המוצר ונזכה את הכרטיס תוך 7 ימי עסקים." },
      ]}
    />
  ),
});
