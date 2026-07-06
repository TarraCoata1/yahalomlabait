import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";
import { localizedMeta, canonicalLink } from "@/lib/seo";

export const Route = createFileRoute("/shipping")({
  head: () => ({
    meta: localizedMeta({
      title: "משלוחים | יהלום לבית",
      description: "משלוח מבוטח באריזה הרמטית לכל הארץ. פרטי זמנים, עלויות ואפשרויות איסוף עצמי.",
      path: "/shipping",
    }),
    links: canonicalLink("/shipping"),
  }),
  component: () => (
    <InfoPage
      eyebrow="לוגיסטיקה"
      title="משלוחים"
      intro="כל תמונה נשלחת באריזה הרמטית ומבוטחת עד דלת הבית, ומגיעה מוכנה לתלייה."
      sections={[
        { q: "זמני משלוח", a: "7–10 ימי עסקים ייצור + 2–4 ימי עסקים משלוח. במידות גדולות ייתכנו 1–2 ימים נוספים." },
        { q: "עלות משלוח", a: "משלוח סטנדרטי ₪49. חינם בהזמנות מעל ₪1,500." },
        { q: "איסוף עצמי", a: "ניתן לתאם איסוף עצמי מהסטודיו במודיעין ללא עלות." },
        { q: "התקנה בבית", a: "שירות התקנה מקצועי אופציונלי: ₪250 עד 70×100, ₪350 מעבר לכך." },
        { q: "משלוח לחו״ל", a: "לצורך משלוח מחוץ לישראל צרו איתנו קשר לקבלת הצעת מחיר מותאמת." },
      ]}
    />
  ),
});
