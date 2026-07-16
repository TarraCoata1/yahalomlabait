import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";
import { pageSeoQuery, buildSeoHead } from "@/lib/page-seo";

export const Route = createFileRoute("/returns")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageSeoQuery("/returns")),
  head: ({ loaderData }) => buildSeoHead({ routePath: "/returns", seo: loaderData ?? null }),
  component: () => (
    <InfoPage
      eyebrow="מדיניות"
      title="החזרות וביטולים"
      intro="לפני ביצוע ההזמנה, נשמח שתקראו בעיון את המדיניות שלנו."
      sections={[
        {
          q: "ביטול הזמנה",
          a: "לא ניתן לבטל הזמנה לאחר ביצועה. כל תמונה מיוצרת בהזמנה אישית עבורכם ותהליך הייצור מתחיל מיד עם אישור ההזמנה.",
        },
        {
          q: "החזרות",
          a: "אנו לא מקבלים החזרות על מוצרים שנרכשו באתר. כל המכירות סופיות.",
        },
        {
          q: "פגם בייצור או נזק במשלוח",
          a: "המשלוח וההתקנה מבוטחים. במקרה נדיר של פגם ייצור או נזק במעמד המשלוח — יש לפנות אלינו תוך 48 שעות מקבלת המוצר עם תמונות של הפגם, ואנו נטפל בכך על חשבוננו.",
        },
        {
          q: "יצירת קשר",
          a: "לכל שאלה או תיאום — צרו איתנו קשר בטלפון או בוואטסאפ, ונחזור אליכם במהירות.",
        },
      ]}
    />
  ),
});
