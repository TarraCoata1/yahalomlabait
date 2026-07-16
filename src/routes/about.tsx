import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Sparkles, Palette, Truck } from "lucide-react";
import hero from "@/assets/hero-living-room.jpg";
import { localizedMeta, canonicalLink } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: localizedMeta({
      title: "אודות יהלום לבית | הסטודיו לתמונות זכוכית יוקרתיות",
      description: "יהלום לבית — סטודיו ישראלי המתמחה ביצירת תמונות לבית ואמנות זכוכית בעיצוב אישי לחללים פרטיים.",
      path: "/about",
    }),
    links: canonicalLink("/about"),
  }),
  component: About,
});

const STEPS = [
  {
    n: "01",
    icon: Palette,
    t: "הקשבה לחלל",
    d: "אנחנו לא מוכרים תמונה — אנחנו מתאימים יצירה למקום שלך.",
    d2: "בשיחה קצרה נבין את האור, הפרופורציות והסגנון של החלל שבו היצירה תיתלה.",
    bullets: ["ייעוץ אישי חינם", "מדידה מדויקת", "התאמה לסלון / משרד / חדר שינה"],
  },
  {
    n: "02",
    icon: Sparkles,
    t: "עיצוב אישי מלא",
    d: "כל יצירה נבנית לפי הסגנון והצבעוניות שביקשת — לא קטלוג סטנדרטי.",
    d2: "מעטפת עיצובית מלאה: התאמת צבעים, קומפוזיציה ופרופורציות עד שמקבלים את התוצאה המדויקת.",
    bullets: ["בדיקת קובץ מקצועית", "Proof דיגיטלי לפני ייצור", "עד שלוש התאמות ללא עלות"],
  },
  {
    n: "03",
    icon: ShieldCheck,
    t: "הדפסה ברמת גלריה",
    d: "הדפסה דיגיטלית UV על זכוכית מחוסמת אקסטרה קליר בעובי 6 מ״מ.",
    d2: "טכנולוגיה שעמידה בפני דהייה, לחות ושריטות — כדי שהיצירה תיראה מושלמת גם בעוד עשור.",
    bullets: ["אחריות 5 שנים", "ייצור כחול־לבן במודיעין", "מערכת תלייה סמויה"],
  },
  {
    n: "04",
    icon: Truck,
    t: "משלוח והתקנה",
    d: "אריזה מבוטחת, משלוח לכל הארץ, ואופציית התקנה מקצועית בבית.",
    d2: "טכנאי מוסמך מגיע עם ציוד ייעודי, מיישר לפי פלס ומוודא תוצאה מקצועית.",
    bullets: ["משלוח מבוטח בכל הארץ", "התקנה החל מ־₪300", "עד 14 ימי עסקים"],
  },
];

function About() {
  return (
    <div>
      <section className="relative isolate overflow-hidden">
        <img src={hero} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/50 via-background/70 to-background" />
        <div className="mx-auto max-w-4xl px-4 py-28 text-center md:px-8">
          <span className="text-xs uppercase tracking-[0.3em] text-rose-gold">אודות</span>
          <h1 className="mt-3 font-serif text-4xl md:text-6xl">קצת עלינו</h1>
          <p className="mx-auto mt-6 max-w-2xl text-muted-foreground md:text-lg">
            ב״יהלום לבית״ אנחנו יוצרים תמונות זכוכית ועבודות עיצוב אישיות ברמה הגבוהה ביותר, מתוך חיבור עמוק לאסתטיקה, דיוק, רגש ופסטורליות.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 md:px-8">
        <div className="mb-12 text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-rose-gold">התהליך שלנו</span>
          <h2 className="mt-3 font-serif text-3xl md:text-4xl">איך נולדת תמונת זכוכית יוקרתית</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">מעטפת אישית מלאה — מהשיחה הראשונה ועד ליצירה תלויה על הקיר.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.n} className="group relative overflow-hidden rounded-2xl glass p-8 transition hover:-translate-y-1 hover:border-rose-gold/50">
                <div className="flex items-start justify-between">
                  <div className="text-gradient-rose font-serif text-5xl leading-none">{s.n}</div>
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-rose-gold/10 text-rose-gold ring-1 ring-rose-gold/30">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="mt-4 font-serif text-2xl">{s.t}</h3>
                <p className="mt-3 text-muted-foreground">{s.d}</p>
                <p className="mt-2 text-sm text-muted-foreground/80">{s.d2}</p>
                <ul className="mt-5 space-y-1.5 border-t border-border/50 pt-4">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="h-1 w-1 rounded-full bg-rose-gold" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-24 text-center md:px-8">
        <h2 className="font-serif text-3xl md:text-4xl">"זו לא יצירה מדף. <span className="text-gradient-rose">זו יצירה בהתאמה אישית מלאה."</span></h2>
        <Link to="/contact" className="mt-8 inline-block rounded-full btn-rose px-7 py-3.5 font-semibold">צרו קשר</Link>
      </section>
    </div>
  );
}
