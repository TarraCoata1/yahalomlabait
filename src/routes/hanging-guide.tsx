import { createFileRoute, Link } from "@tanstack/react-router";
import { jsonLd, canonical } from "@/lib/seo";
import { pageSeoQuery, buildSeoHead } from "@/lib/page-seo";

const DESC =
  "מדריך שלב־אחר־שלב לתלייה נכונה של תמונת זכוכית מחוסמת: מערכת סטנד־אוף, סוגי קירות (גבס, בטון, בלוק), כלים, בטיחות ומיקום גובה עין. הוראות מקצועיות של יהלום לבית.";

export const Route = createFileRoute("/hanging-guide")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageSeoQuery("/hanging-guide")),
  head: ({ loaderData }) =>
    buildSeoHead({
      routePath: "/hanging-guide",
      seo: loaderData ?? null,
      type: "article",
      extraScripts: [
        jsonLd({
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: "איך תולים תמונת זכוכית מחוסמת על קיר",
          description: DESC,
          inLanguage: "he-IL",
          totalTime: "PT45M",
          tool: [
            { "@type": "HowToTool", name: "מקדחה" },
            { "@type": "HowToTool", name: "פלס" },
            { "@type": "HowToTool", name: "מטר" },
            { "@type": "HowToTool", name: "עיפרון" },
            { "@type": "HowToTool", name: "מברג פיליפס" },
          ],
          supply: [
            { "@type": "HowToSupply", name: "מערכת סטנד־אוף (Standoff) המסופקת עם התמונה" },
            { "@type": "HowToSupply", name: "דיבלים מתאימים לסוג הקיר" },
          ],
          step: [
            { "@type": "HowToStep", name: "בחירת מיקום וגובה", text: "מרכז התמונה בגובה 145–155 ס\"מ מהרצפה (גובה עין). מעל ספה: 15–25 ס\"מ מעל משענת." },
            { "@type": "HowToStep", name: "סימון נקודות הקידוח", text: "הצמידו את התבנית המסופקת לקיר, יישרו עם פלס וסמנו את שתי הנקודות בעיפרון." },
            { "@type": "HowToStep", name: "קידוח לפי סוג הקיר", text: "גבס — מקדח 6 מ\"מ + דיבל פרפר. בטון/בלוק — מקדח וידיה 8 מ\"מ + דיבל פלסטיק. שאבו אבק לפני החדרת הדיבל." },
            { "@type": "HowToStep", name: "הברגת בורגי הסטנד־אוף", text: "הבריגו את הבסיסים עד סוף התבריג. ודאו שהם ניצבים לקיר ויציבים לחלוטין." },
            { "@type": "HowToStep", name: "התקנת התמונה", text: "בעזרת אדם נוסף, הניחו את חורי הזכוכית על הבסיסים והבריגו את כובעי הסטנד־אוף בעדינות ביד — לא במברגה חשמלית." },
            { "@type": "HowToStep", name: "יישור וסיום", text: "בדקו עם פלס, נגבו את הזכוכית במטלית מיקרופייבר. סיימתם." },
          ],
        }),
        jsonLd({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "בית", item: canonical("/") },
            { "@type": "ListItem", position: 2, name: "מדריך התקנה", item: canonical("/hanging-guide") },
          ],
        }),
      ],
    }),
  component: HangingGuidePage,
});

function HangingGuidePage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-14 md:px-8">
      <header className="text-center">
        <span className="text-xs uppercase tracking-[0.3em] text-rose-gold">מדריך התקנה</span>
        <h1 className="mt-3 font-serif text-4xl md:text-5xl">איך תולים תמונת זכוכית מחוסמת</h1>
        <p className="mt-4 text-muted-foreground">
          מדריך מקצועי שלב־אחר־שלב לתלייה בטוחה ומדויקת של תמונת זכוכית פרימיום — לכל סוגי הקירות.
        </p>
      </header>

      <section className="mt-10 space-y-8 text-base leading-relaxed">
        <div>
          <h2 className="font-serif text-2xl text-rose-gold">למה מערכת סטנד־אוף (Standoff)?</h2>
          <p className="mt-2 text-muted-foreground">
            כל תמונת זכוכית של יהלום לבית מגיעה עם מערכת סטנד־אוף מנירוסטה — בורגי מרחק המחזיקים
            את הזכוכית 18 מ״מ מהקיר, יוצרים אפקט "צף" יוקרתי ומאפשרים אוורור לאחורי הזכוכית.
            המערכת מיועדת לזכוכית מחוסמת בעובי 6 מ״מ ותומכת בבטחה במידות עד 120×180 ס״מ.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-2xl text-rose-gold">כלים שצריך</h2>
          <ul className="mt-2 list-disc space-y-1 pr-6 text-muted-foreground">
            <li>מקדחה + מקדח מתאים לסוג הקיר (6 מ״מ לגבס, 8 מ״מ וידיה לבטון)</li>
            <li>פלס, מטר, עיפרון</li>
            <li>מברג פיליפס ידני (לא חשמלי — כדי לא לשבור זכוכית)</li>
            <li>שואב אבק קטן</li>
            <li>עוזר אחד — תמונות במידה 80×120 ומעלה דורשות שני אנשים</li>
          </ul>
        </div>

        <div>
          <h2 className="font-serif text-2xl text-rose-gold">בחירת מיקום וגובה תלייה נכון</h2>
          <p className="mt-2 text-muted-foreground">
            הכלל המקצועי: <strong>מרכז התמונה בגובה 145–155 ס״מ מהרצפה</strong> — גובה עין ממוצע.
            מעל רהיט (ספה, מיטה, קונסולה): השאירו 15–25 ס״מ בין תחתית התמונה למשענת. רוחב התמונה
            צריך להיות כ־⅔ מרוחב הרהיט שמתחתיה.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-2xl text-rose-gold">שלב־אחר־שלב: התקנה על סוגי קירות שונים</h2>

          <h3 className="mt-5 font-serif text-xl">קיר גבס</h3>
          <ol className="mt-2 list-decimal space-y-1 pr-6 text-muted-foreground">
            <li>סמנו את נקודות הקידוח לפי התבנית המצורפת.</li>
            <li>קדחו במקדח 6 מ״מ.</li>
            <li>החדירו דיבל פרפר (Butterfly) — נדרש לכל תמונה מעל 5 ק״ג.</li>
            <li>הבריגו את בסיסי הסטנד־אוף עד הסוף.</li>
          </ol>

          <h3 className="mt-5 font-serif text-xl">קיר בטון או בלוק</h3>
          <ol className="mt-2 list-decimal space-y-1 pr-6 text-muted-foreground">
            <li>השתמשו במקדח וידיה 8 מ״מ במצב הקשה (Hammer).</li>
            <li>שאבו את האבק מהחור לפני החדרת הדיבל.</li>
            <li>החדירו דיבל פלסטיק אדום/כחול.</li>
            <li>הבריגו את בסיסי הסטנד־אוף — הם חייבים להיות ניצבים לקיר.</li>
          </ol>

          <h3 className="mt-5 font-serif text-xl">קיר קרמיקה או אריחים</h3>
          <ol className="mt-2 list-decimal space-y-1 pr-6 text-muted-foreground">
            <li>סמנו את הנקודה עם מרקר והדביקו מלמעלה נייר דבק — מונע החלקה של המקדח.</li>
            <li>התחילו לקדוח לאט ללא הקשה עד שהמקדח חודר את הזיגוג.</li>
            <li>המשיכו במצב הקשה עם מקדח וידיה 8 מ״מ.</li>
          </ol>
        </div>

        <div>
          <h2 className="font-serif text-2xl text-rose-gold">התקנת הזכוכית — הכי חשוב</h2>
          <ol className="mt-2 list-decimal space-y-1 pr-6 text-muted-foreground">
            <li>עם עוזר, הרימו את הזכוכית והצמידו את החורים לבסיסים.</li>
            <li>הבריגו את כובעי הסטנד־אוף <strong>ביד בלבד</strong> — לעולם לא במברגה חשמלית.</li>
            <li>הידקו עד שהכובע יושב על הזכוכית — אל תהדקו יתר על המידה, זכוכית נסדקת מלחץ נקודתי.</li>
            <li>נגבו את הזכוכית במטלית מיקרופייבר יבשה.</li>
          </ol>
        </div>

        <div>
          <h2 className="font-serif text-2xl text-rose-gold">בטיחות זכוכית מחוסמת</h2>
          <p className="mt-2 text-muted-foreground">
            אנחנו משתמשים בזכוכית מחוסמת (Tempered Glass) בעובי 6 מ״מ — חזקה פי 5 מזכוכית רגילה.
            גם במקרה נדיר של שבר, היא מתפוררת לפירורים קטנים ולא בולטים במקום רסיסים חדים.
            המשלוח וההתקנה שלנו מבוטחים.
          </p>
        </div>

        <div className="rounded-2xl glass p-6 text-center">
          <h2 className="font-serif text-2xl">מעדיפים שנתקין עבורכם?</h2>
          <p className="mt-2 text-muted-foreground">
            שירות התקנה מקצועי בבית בכל הארץ — מ־₪250 עד 70×100 ס״מ. למידות מעל 70×100 ס״מ, ההתקנה מתחילה מ־₪350 ועולה בהתאם למידה.
          </p>
          <Link
            to="/contact"
            className="mt-4 inline-block rounded-full btn-rose px-6 py-3 text-sm font-semibold"
          >
            תיאום התקנה
          </Link>
        </div>
      </section>
    </article>
  );
}
