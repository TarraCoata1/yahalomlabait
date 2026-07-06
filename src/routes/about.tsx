import { createFileRoute, Link } from "@tanstack/react-router";
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
            ב־Yahalom La Bait אנחנו יוצרים תמונות זכוכית ועבודות עיצוב אישיות ברמה הגבוהה ביותר, מתוך חיבור עמוק לאסתטיקה, דיוק, רגש ופסטורליות.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-12 px-4 py-20 md:grid-cols-2 md:px-8">
        {[
          { n: "01", t: "הקשבה לחלל", d: "תהליך היצירה מתחיל בהבנת המקום — האור, הצבעים, הפרופורציות והאווירה." },
          { n: "02", t: "עיצוב אישי מלא", d: "כל תמונה מתוכננת מתוך הקשבה מדויקת לצרכים, לאווירה ולסגנון המבוקש." },
          { n: "03", t: "הדפסה ברמת גלריה", d: "הדפסה דיגיטלית בטכנולוגיית UV על זכוכית מחוסמת אקסטרה קלירית." },
          { n: "04", t: "התקנה ומעטפת מלאה", d: "ליווי מלא עד להתקנה הסופית בבית הלקוח." },
        ].map((s) => (
          <div key={s.n} className="rounded-2xl glass p-8">
            <div className="text-gradient-rose font-serif text-5xl">{s.n}</div>
            <h3 className="mt-4 font-serif text-2xl">{s.t}</h3>
            <p className="mt-3 text-muted-foreground">{s.d}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-24 text-center md:px-8">
        <h2 className="font-serif text-3xl md:text-4xl">"זו לא יצירה מדף. <span className="text-gradient-rose">זו יצירה בהתאמה אישית מלאה."</span></h2>
        <Link to="/contact" className="mt-8 inline-block rounded-full btn-rose px-7 py-3.5 font-semibold">צרו קשר</Link>
      </section>
    </div>
  );
}
