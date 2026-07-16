// Site-wide SEO constants and JSON-LD helpers.
export const SITE_URL = "https://www.yahalom-la-bait.com";
export const SITE_NAME = "יהלום לבית";
export const SITE_NAME_EN = "יהלום לבית";

export const canonical = (path: string) => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

export const localizedMeta = (opts: {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article" | "product";
}) => {
  const url = canonical(opts.path);
  const type = opts.type ?? "website";
  const base = [
    { title: opts.title },
    { name: "description", content: opts.description },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:type", content: type },
    { property: "og:locale", content: "he_IL" },
    { property: "og:url", content: url },
    { property: "og:title", content: opts.title },
    { property: "og:description", content: opts.description },
    { name: "twitter:card", content: opts.image ? "summary_large_image" : "summary" },
    { name: "twitter:title", content: opts.title },
    { name: "twitter:description", content: opts.description },
  ];
  if (opts.image) {
    base.push({ property: "og:image", content: opts.image });
    base.push({ name: "twitter:image", content: opts.image });
  }
  return base;
};

export const canonicalLink = (path: string) => [{ rel: "canonical", href: canonical(path) }];

export const jsonLd = (data: unknown) => ({
  type: "application/ld+json" as const,
  children: JSON.stringify(data),
});

export const breadcrumbSchema = (items: Array<{ name: string; path: string }>) =>
  jsonLd({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: canonical(it.path),
    })),
  });

export const organizationSchema = jsonLd({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  alternateName: SITE_NAME_EN,
  url: SITE_URL,
  description:
    "יהלום לבית — מותג פרימיום ישראלי לתמונות זכוכית ואמנות קיר יוקרתית לבית, בעיצוב אישי והדפסה דיגיטלית ברמת גלריה.",
  telephone: "+972-53-320-6500",
  email: "moshemalkaa@gmail.com",
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
});

export const websiteSchema = jsonLd({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  inLanguage: "he-IL",
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/shop?cat={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
});
