import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { InfoPage } from "@/components/site/InfoPage";
import { localizedMeta, canonicalLink } from "@/lib/seo";
import { siteSettingsQuery } from "@/lib/site-settings";

export const Route = createFileRoute("/shipping")({
  loader: ({ context }) => context.queryClient.ensureQueryData(siteSettingsQuery),
  head: () => ({
    meta: localizedMeta({
      title: "משלוחים ואיסוף | יהלום לבית (Yahalom LaBayit)",
      description:
        "משלוח מבוטח באריזה הרמטית לכל הארץ, עד 14 ימי עסקים. פרטי זמנים, עלויות ואפשרויות איסוף עצמי של יהלום לבית.",
      path: "/shipping",
    }),
    links: canonicalLink("/shipping"),
  }),
  component: ShippingPage,
});

function ShippingPage() {
  const { data: s } = useSuspenseQuery(siteSettingsQuery);
  const lead = s.shipping_lead_time_text || "עד 14 ימי עסקים";
  const pickupSection = s.pickup_enabled
    ? {
        q: "איסוף עצמי",
        a: [
          s.pickup_address ? `כתובת: ${s.pickup_address}.` : "ניתן לתאם איסוף עצמי מהסטודיו ללא עלות.",
          s.pickup_instructions,
        ]
          .filter(Boolean)
          .join(" "),
      }
    : { q: "איסוף עצמי", a: "האיסוף העצמי אינו זמין כרגע." };

  return (
    <InfoPage
      eyebrow="לוגיסטיקה"
      title="משלוחים ואיסוף"
      intro="כל תמונה של יהלום לבית נשלחת באריזה הרמטית ומבוטחת עד דלת הבית, ומגיעה מוכנה לתלייה."
      sections={[
        { q: "זמני משלוח", a: `${lead} מרגע אישור ההזמנה, כולל ייצור ומשלוח מבוטח לכל הארץ.` },
        { q: "עלות משלוח", a: "משלוח סטנדרטי ₪49. חינם בהזמנות מעל ₪1,500." },
        pickupSection,
        {
          q: "התקנה בבית",
          a: `שירות התקנה מקצועי אופציונלי: ₪250 עד 70×100 ס״מ. ${s.large_size_install_note}`,
        },
        { q: "משלוח וההתקנה מבוטחים", a: "המשלוח וההתקנה מבוטחים על ידי המפעל — טיפול מלא במקרה של נזק בהובלה או בהתקנה." },
        { q: "משלוח לחו״ל", a: "לצורך משלוח מחוץ לישראל צרו איתנו קשר לקבלת הצעת מחיר מותאמת." },
      ]}
    />
  );
}
