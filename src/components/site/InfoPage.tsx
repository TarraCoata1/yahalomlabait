import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

interface Section { q: string; a: ReactNode; }

export function InfoPage({
  eyebrow, title, intro, sections, faqSchema,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  sections: Section[];
  faqSchema?: boolean;
}) {
  return (
    <>
      {faqSchema && (() => {
        const qa = sections.filter((s) => typeof s.a === "string");
        if (qa.length === 0) return null;
        return (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: qa.map((s) => ({
                  "@type": "Question",
                  name: s.q,
                  acceptedAnswer: { "@type": "Answer", text: s.a as string },
                })),
              }),
            }}
          />
        );
      })()}
      <article className="mx-auto max-w-4xl px-4 py-16 md:px-8">
        <nav aria-label="פירורי לחם" className="mb-6 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary">בית</Link> / <span className="text-foreground">{title}</span>
        </nav>
        <header className="text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-rose-gold">{eyebrow}</span>
          <h1 className="mt-3 font-serif text-4xl md:text-5xl">{title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">{intro}</p>
        </header>
        <div className="mt-12 space-y-4">
          {sections.map((s, i) => (
            <details key={i} className="group rounded-2xl glass p-6 transition hover:border-rose-gold/50 open:border-rose-gold/40">
              <summary className="cursor-pointer list-none font-serif text-lg text-foreground marker:hidden">
                <span className="text-rose-gold">{String(i + 1).padStart(2, "0")}.</span> {s.q}
              </summary>
              <div className="mt-3 text-muted-foreground leading-relaxed">{s.a}</div>
            </details>
          ))}
        </div>
        <div className="mt-14 rounded-2xl glass-strong p-8 text-center">
          <h2 className="font-serif text-2xl">לא מצאתם תשובה?</h2>
          <p className="mt-2 text-sm text-muted-foreground">צוות יהלום לבית זמין עבורכם בטלפון, וואטסאפ ואימייל.</p>
          <Link to="/contact" className="mt-5 inline-block rounded-full btn-rose px-6 py-3 text-sm font-semibold hover:btn-rose-hover">צור קשר</Link>
        </div>
      </article>
    </>
  );
}
