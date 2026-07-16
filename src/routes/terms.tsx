import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";
import { pageSeoQuery, buildSeoHead } from "@/lib/page-seo";

export const Route = createFileRoute("/terms")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageSeoQuery("/terms")),
  head: ({ loaderData }) => buildSeoHead({ routePath: "/terms", seo: loaderData ?? null }),
  component: () => (
    <InfoPage
      eyebrow="תנאי שימוש"
      title="תקנון האתר"
      intro="השימוש באתר ורכישה דרכו כפופים לתנאים המפורטים בתקנון זה."
      sections={[
        { q: "כללי", a: "התקנון מנוסח בלשון זכר לצרכי נוחות בלבד ומתייחס לכל המגדרים כאחד." },
        { q: "ביצוע הזמנה", a: "רכישה תושלם רק לאחר קבלת אישור ההזמנה במייל וקבלת התשלום המלא." },
        { q: "מחירים", a: "המחירים באתר בשקלים חדשים כוללים מע״מ. יהלום לבית שומרת על הזכות לעדכן מחירים בכל עת." },
        { q: "ביטולים והחזרות", a: "כל ההזמנות סופיות. לא ניתן לבטל הזמנה לאחר ביצועה ולא מתקבלים החזרים. המשלוח וההתקנה מבוטחים במקרה של נזק." },
        { q: "קניין רוחני", a: "כל התכנים, התמונות והעיצובים באתר הם קניינה של יהלום לבית ואסורים בשימוש מסחרי ללא אישור בכתב." },
        { q: "שיפוט", a: "בכל מחלוקת, סמכות השיפוט הבלעדית נתונה לבתי המשפט המוסמכים במחוז מרכז, ישראל." },
      ]}
    />
  ),
});
