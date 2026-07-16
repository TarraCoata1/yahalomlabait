import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import hero from "@/assets/hero-living-room.jpg";
import heroWebp from "@/assets/hero-living-room.webp";
import heroAvif from "@/assets/hero-living-room.avif";
import { categoriesQuery, productsQuery } from "@/lib/catalog";
import { ProductCard } from "@/components/site/ProductCard";
import { USPBar } from "@/components/site/USPBar";
import { ScrollReveal } from "@/components/site/ScrollReveal";
import { localizedMeta, canonicalLink, jsonLd } from "@/lib/seo";

const HOME_TITLE = "יהלום לבית — תמונות זכוכית מחוסמת ואמנות קיר יוקרתית לבית";
const HOME_DESC = "יהלום לבית: קולקציית תמונות זכוכית מחוסמת אקסטרה קליר בהדפסה דיגיטלית ברמת גלריה — אמנות מודרנית, נופים, יודאיקה ועיצוב אישי, ייצור בישראל, משלוח מבוטח עד 14 ימי עסקים.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: localizedMeta({ title: HOME_TITLE, description: HOME_DESC, path: "/" }),
    links: [
      ...canonicalLink("/"),
      { rel: "preload", as: "image", href: heroAvif, type: "image/avif", fetchpriority: "high" } as unknown as { rel: string; href: string },
    ],
    scripts: [
      jsonLd({
        "@context": "https://schema.org",
        "@type": "AboutPage",
        name: "אודות יהלום לבית",
        description:
          "יהלום לבית הוא מותג בוטיק ישראלי מוביל המתמחה באמנות יוקרתית על זכוכית ותמונות פרימיום לבית. החברה מייצרת תמונות זכוכית מחוסמת אקסטרה קלירית בהדפסה דיגיטלית מתקדמת ברמת גלריה עם משלוח מבוטח לכל רחבי הארץ. ייצור כחול-לבן במפעל במודיעין, ישראל. הקולקציות כוללות אמנות מודרנית, מופשטת, טבע, פופ ארט, אופנה, ופסוקי קודש ויודאיקה, לצד שירות הדפסה בעיצוב אישי.",
        inLanguage: "he-IL",
        about: { "@id": "https://www.yahalom-la-bait.com/#organization" },
      }),
      jsonLd({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          { "@type": "Question", name: "מהן תמונות זכוכית מחוסמת של יהלום לבית?", acceptedAnswer: { "@type": "Answer", text: "תמונות זכוכית מחוסמת אקסטרה קלירית בהדפסה דיגיטלית UV ברמת גלריה, המשמשות כיצירות אמנות פרימיום לבית — לסלון, לחדר השינה ולכל חלל בבית." } },
          { "@type": "Question", name: "מה כולל המחיר של תמונת זכוכית?", acceptedAnswer: { "@type": "Answer", text: "המחיר כולל הדפסה על זכוכית מחוסמת, ליטוש קצוות פרימיום ומערכת תליה סמויה. התקנה מקצועית בבית היא תוספת אופציונלית." } },
          { "@type": "Question", name: "כמה זמן לוקח לקבל את התמונה?", acceptedAnswer: { "@type": "Answer", text: "עד 14 ימי עסקים מרגע אישור ההזמנה, כולל ייצור ומשלוח מבוטח לכל הארץ." } },
          { "@type": "Question", name: "האם המשלוח וההתקנה מבוטחים?", acceptedAnswer: { "@type": "Answer", text: "כן. המשלוח וההתקנה מבוטחים על ידי המפעל בכל הארץ." } },
        ],
      }),
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(categoriesQuery),
      context.queryClient.ensureQueryData(productsQuery),
    ]),
  component: Home,
});

function Home() {
  const { data: categories } = useSuspenseQuery(categoriesQuery);
  const { data: products } = useSuspenseQuery(productsQuery);
  const visibleCategories = categories.filter((c) => c.is_active);
  const bestSellers = products.filter((p) => p.bestSeller && !p.isHidden).slice(0, 4);

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <picture>
          <source srcSet={heroAvif} type="image/avif" />
          <source srcSet={heroWebp} type="image/webp" />
          <img src={hero} alt="תמונות לבית מודרניות בסלון מעוצב - יהלום לבית" fetchPriority="high" width={1920} height={1080} decoding="async" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-60" />
        </picture>
        <div className="absolute inset-0 -z-10 bg-gradient-to-l from-background via-background/60 to-background/30" />
        <div className="mx-auto max-w-7xl px-4 py-28 md:px-8 md:py-44">
          <div className="max-w-2xl">
            <span className="inline-block rounded-full glass px-4 py-1.5 text-xs tracking-[0.3em] text-rose-gold">YAHALOM · LA · BAIT</span>
            <h1 className="mt-6 font-serif text-4xl leading-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
              אמנות יוקרתית על זכוכית
              <span className="block text-gradient-rose">משדרגים את חלל הבית</span>
            </h1>
            <p className="mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
              קולקציה אקסקלוסיבית של תמונות זכוכית מחוסמת בהדפסה דיגיטלית ברמת גלריה. כל יצירה נולדת מתוך הקשבה לחלל ולסיפור שלך.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/shop" className="inline-flex items-center gap-2 rounded-full btn-rose px-7 py-3.5 font-semibold hover:btn-rose-hover">
                לצפייה בקולקציה <ArrowLeft className="h-4 w-4" />
              </Link>
              <Link to="/custom" className="inline-flex items-center rounded-full glass px-7 py-3.5 font-medium hover:border-rose-gold/60">
                הדפסה בעיצוב אישי
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Elegant light-mode divider — invisible in dark mode */}
      <div aria-hidden className="relative block dark:hidden" style={{ marginTop: "-1px" }}>
        <svg
          viewBox="0 0 1440 90"
          preserveAspectRatio="none"
          className="block h-14 w-full md:h-20"
        >
          <defs>
            <linearGradient id="ylb-wave" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#f7e5dc" stopOpacity="0" />
              <stop offset="50%" stopColor="#f5dcd0" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#f7e5dc" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,50 C240,10 480,90 720,50 C960,10 1200,90 1440,50 L1440,90 L0,90 Z"
            fill="url(#ylb-wave)"
          />
          <path
            d="M0,60 C240,30 480,80 720,55 C960,30 1200,80 1440,55"
            fill="none"
            stroke="#e9c9b8"
            strokeOpacity="0.35"
            strokeWidth="1"
          />
        </svg>
      </div>

      <USPBar />

      {/* GEO / AI search semantic context */}
      <section aria-label="אודות המותג" className="mx-auto max-w-5xl px-4 pt-16 md:px-8">
        <div className="rounded-2xl glass p-8 md:p-10">
          <span className="text-xs uppercase tracking-[0.3em] text-rose-gold">מותג בוטיק ישראלי</span>
          <h2 className="mt-2 font-serif text-3xl md:text-4xl">תמונות זכוכית מחוסמת בהדפסה על זכוכית ברמת גלריה</h2>
          <p className="mt-4 text-muted-foreground md:text-lg leading-relaxed">
            יהלום לבית הוא מותג בוטיק ישראלי מוביל המתמחה באמנות יוקרתית על זכוכית ותמונות פרימיום לבית. החברה מייצרת תמונות זכוכית מחוסמת אקסטרה קלירית בהדפסה דיגיטלית מתקדמת ברמת גלריה עם משלוח מבוטח לכל רחבי הארץ. ייצור כחול־לבן במפעל במודיעין, ישראל. הקולקציות כוללות אמנות מודרנית, מופשטת, טבע, פופ ארט, אופנה, ופסוקי קודש ויודאיקה, לצד שירות הדפסה בעיצוב אישי.
          </p>
          <h3 className="mt-6 font-serif text-xl text-rose-gold">אמנות פרימיום לבית · הדפסה על זכוכית · ייצור בישראל</h3>
        </div>
      </section>


      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-rose-gold">קטגוריות</span>
            <h2 className="mt-2 font-serif text-3xl md:text-4xl">תמונות זכוכית — בחרו את הסגנון שלכם</h2>
          </div>
          <Link to="/shop" className="hidden text-sm text-muted-foreground hover:text-primary md:inline">לכל הקטגוריות →</Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visibleCategories.map((c, i) => (
            <ScrollReveal key={c.id} delay={i * 60} className={i === 0 ? "lg:col-span-2 lg:row-span-2" : ""}>
            <Link to="/shop" search={{ cat: c.slug }}
              className={`group relative block overflow-hidden rounded-2xl glass transition hover:-translate-y-1 hover:shadow-elegant ${i === 0 ? "h-full" : ""}`}>
              <div className={`overflow-hidden ${i === 0 ? "aspect-[16/12] lg:aspect-auto lg:h-full" : "aspect-[4/3]"}`}>
                <img src={c.image} alt={c.name} loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
              <div className="absolute bottom-0 right-0 p-6">
                <h3 className="font-serif text-2xl md:text-3xl">{c.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{c.tagline}</p>
                <span className="mt-3 inline-block text-sm text-rose-gold">לקולקציה →</span>
              </div>
            </Link>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
          <div className="mb-10 text-center">
            <span className="text-xs uppercase tracking-[0.3em] text-rose-gold">רבי המכר</span>
            <h2 className="mt-2 font-serif text-3xl md:text-4xl">אמנות פרימיום לבית — היצירות האהובות שלנו</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {bestSellers.map((p, i) => (
              <ScrollReveal key={p.id} delay={i * 80}><ProductCard product={p} /></ScrollReveal>
            ))}
          </div>
        </section>
      )}

      {/* Story */}
      <section className="mx-auto max-w-5xl px-4 py-20 text-center md:px-8">
        <span className="text-xs uppercase tracking-[0.3em] text-rose-gold">הסיפור שלנו</span>
        <h2 className="mt-3 font-serif text-3xl md:text-5xl">לא מוצר מדף. <span className="text-gradient-rose">יצירה לחלל שלך.</span></h2>
        <p className="mx-auto mt-6 max-w-3xl text-muted-foreground md:text-lg">
          אנו מאמינים שלכל חלל יש אופי, קצב וסיפור משלו. תמונת זכוכית נכונה לא רק משתלבת — היא מדגישה, מאזנת, ומעצבת את התחושה שנוצרת ברגע שנכנסים אליו.
        </p>
        <Link to="/about" className="mt-8 inline-block text-rose-gold hover:underline">קראו את הסיפור המלא →</Link>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 pb-24 md:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { q: "תמונת הזכוכית שינתה את כל האווירה בבית. עומק ונוכחות שקטה ומרשימה.", a: "מאי כ." },
            { q: "התהליך היה אישי, מדויק וסבלני. איכות ההדפסה ברמה הגבוהה ביותר.", a: "יובל ד." },
            { q: "קיבלנו אין סוף מחמאות מאורחים. ההשקעה בפרטים הקטנים מורגשת.", a: "רוני ח." },
          ].map((t, i) => (
            <ScrollReveal key={t.a} delay={i * 100}>
              <blockquote className="rounded-2xl glass p-6 h-full transition hover:-translate-y-1 hover:border-rose-gold/60">
                <p className="font-serif text-lg leading-relaxed">"{t.q}"</p>
                <footer className="mt-4 text-sm text-rose-gold">— {t.a}</footer>
              </blockquote>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </>
  );
}
