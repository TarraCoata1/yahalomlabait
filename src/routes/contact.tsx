import { createFileRoute } from "@tanstack/react-router";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { useState } from "react";
import { localizedMeta, canonicalLink, jsonLd, breadcrumbSchema } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: localizedMeta({
      title: "צור קשר | יהלום לבית - תמונות לבית ואמנות זכוכית",
      description: "צרו קשר עם יהלום לבית — סטודיו תמונות זכוכית במודיעין. טלפון 053-320-6500, וואטסאפ ואימייל.",
      path: "/contact",
    }),
    links: canonicalLink("/contact"),
    scripts: [
      breadcrumbSchema([{ name: "בית", path: "/" }, { name: "צור קשר", path: "/contact" }]),
      jsonLd({
        "@context": "https://schema.org",
        "@type": "ContactPage",
        name: "צור קשר · יהלום לבית",
        url: "https://yahalom-la-bait.com/contact",
        inLanguage: "he-IL",
        mainEntity: {
          "@type": "LocalBusiness",
          "@id": "https://yahalom-la-bait.com/#organization",
          name: "יהלום לבית",
          alternateName: "Yahalom La Bait",
          telephone: "+972-53-320-6500",
          email: "moshemalkaa@gmail.com",
          url: "https://yahalom-la-bait.com",
          priceRange: "₪₪₪",
          address: {
            "@type": "PostalAddress",
            addressLocality: "מודיעין",
            addressCountry: "IL",
          },
          areaServed: { "@type": "Country", name: "Israel" },
          openingHoursSpecification: [{
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
            opens: "10:00",
            closes: "18:00",
          }],
          contactPoint: [{
            "@type": "ContactPoint",
            telephone: "+972-53-320-6500",
            contactType: "customer service",
            areaServed: "IL",
            availableLanguage: ["Hebrew", "English"],
          }],
        },
      }),
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 md:px-8">
      <div className="text-center">
        <span className="text-xs uppercase tracking-[0.3em] text-rose-gold">צור קשר</span>
        <h1 className="mt-3 font-serif text-4xl md:text-5xl">נשמח לשמוע מכם</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">לכל שאלה, ייעוץ או הזמנה אישית — אנחנו כאן.</p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_320px]">
        <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="rounded-2xl glass p-8 space-y-4">
          {sent ? (
            <div className="py-12 text-center">
              <h2 className="font-serif text-2xl">תודה! קיבלנו את הפנייה</h2>
              <p className="mt-2 text-muted-foreground">נחזור אליך בהקדם.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="שם מלא" required />
                <Field label="טלפון" type="tel" required />
              </div>
              <Field label="אימייל" type="email" required />
              <label className="block">
                <span className="mb-1 block text-xs text-muted-foreground">הודעה</span>
                <textarea rows={5} className="w-full rounded-lg border border-border bg-input/50 px-3 py-2.5 outline-none focus:border-rose-gold" />
              </label>
              <button type="submit" className="w-full rounded-full btn-rose py-3.5 font-semibold hover:btn-rose-hover">שליחה</button>
            </>
          )}
        </form>

        <aside className="space-y-4">
          {[
            { i: Phone, t: "טלפון", d: "053-320-6500", href: "tel:0533206500" },
            { i: Mail, t: "אימייל", d: "moshemalkaa@gmail.com", href: "mailto:moshemalkaa@gmail.com" },
            { i: MapPin, t: "מיקום", d: "מודיעין, ישראל" },
            { i: Clock, t: "שעות פעילות", d: "א'–ה' · 10:00–18:00" },
          ].map((c) => (
            <a key={c.t} href={c.href ?? "#"} className="flex items-start gap-3 rounded-xl glass p-4 hover:border-rose-gold/60">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-rose-gold/10"><c.i className="h-5 w-5 text-rose-gold" /></div>
              <div>
                <div className="text-xs text-muted-foreground">{c.t}</div>
                <div className="font-medium">{c.d}</div>
              </div>
            </a>
          ))}
        </aside>
      </div>
    </div>
  );
}

function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-muted-foreground">{label}</span>
      <input {...rest} className="w-full rounded-lg border border-border bg-input/50 px-3 py-2.5 outline-none focus:border-rose-gold" />
    </label>
  );
}
