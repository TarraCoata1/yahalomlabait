import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { MiniCart } from "@/components/site/MiniCart";
import { FloatingWidgets } from "@/components/site/FloatingWidgets";
import { BackToTop } from "@/components/site/BackToTop";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-7xl text-gradient-rose">404</h1>
        <h2 className="mt-4 font-serif text-2xl">העמוד לא נמצא</h2>
        <p className="mt-2 text-sm text-muted-foreground">העמוד שחיפשת לא קיים או הוסר.</p>
        <Link to="/" className="mt-6 inline-block rounded-full btn-rose px-6 py-3 text-sm font-semibold">חזרה לבית</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-2xl">משהו השתבש</h1>
        <p className="mt-2 text-sm text-muted-foreground">נסה לרענן את הדף.</p>
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="rounded-full btn-rose px-5 py-2 text-sm font-semibold">נסה שוב</button>
          <a href="/" className="rounded-full border border-border px-5 py-2 text-sm">לבית</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  loader: async ({ context }) => {
    const { fetchSiteSettings, siteSettingsQuery } = await import("@/lib/site-settings");
    try {
      return { settings: await context.queryClient.ensureQueryData(siteSettingsQuery) };
    } catch {
      return { settings: await fetchSiteSettings() };
    }
  },
  head: ({ loaderData }) => {
    const s = loaderData?.settings ?? {
      site_title: "יהלום לבית | תמונות זכוכית יוקרתית ואמנות פרימיום לבית",
      site_description:
        "שדרגו את החלל עם קולקציית תמונות זכוכית מחוסמת אקסטרה קליר בהדפסה דיגיטלית ברמת גלריה. אמנות מודרנית, נופים, יודאיקה ועיצוב אישי תוצרת ישראל.",
      social_image_url: "",
      company_name: "יהלום לבית",
      contact_email: "moshemalkaa@gmail.com",
      contact_phone: "+972-53-320-6500",
      address: "מודיעין, ישראל",
      facebook_url: "",
      instagram_url: "",
      tiktok_url: "",
      youtube_url: "",
      ga4_measurement_id: "",
      gtm_container_id: "",
      facebook_pixel_id: "",
      gsc_verification: "",
    } as {
      site_title: string; site_description: string; social_image_url: string;
      company_name: string; contact_email: string; contact_phone: string; address: string;
      facebook_url: string; instagram_url: string; tiktok_url: string; youtube_url: string;
      ga4_measurement_id: string; gtm_container_id: string; facebook_pixel_id: string; gsc_verification: string;
    };
    const meta: Array<Record<string, string>> = [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "author", content: `${s.company_name} - Yahalom La Bait` },
      { name: "theme-color", content: "#b98a5e" },
      { title: s.site_title },
      { name: "description", content: s.site_description },
      { property: "og:site_name", content: s.company_name },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "he_IL" },
      { property: "og:title", content: s.site_title },
      { property: "og:description", content: s.site_description },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: s.site_title },
      { name: "twitter:description", content: s.site_description },
    ];
    if (s.gsc_verification) {
      meta.push({ name: "google-site-verification", content: s.gsc_verification });
    }
    if (s.facebook_pixel_id) {
      meta.push({ name: "facebook-domain-verification", content: s.facebook_pixel_id });
    }
    const ogImage = s.social_image_url || "https://yahalom-la-bait.com/og-cover.jpg";
    meta.push({ property: "og:image", content: ogImage });
    meta.push({ property: "og:image:width", content: "1200" });
    meta.push({ property: "og:image:height", content: "630" });
    meta.push({ name: "twitter:image", content: ogImage });

    const sameAs = [s.facebook_url, s.instagram_url, s.tiktok_url, s.youtube_url].filter(Boolean);
    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "LocalBusiness",
          "@id": "https://yahalom-la-bait.com/#organization",
          name: s.company_name,
          alternateName: "Yahalom La Bait",
          url: "https://yahalom-la-bait.com",
          image: s.social_image_url || "https://yahalom-la-bait.com/og-cover.jpg",
          logo: "https://yahalom-la-bait.com/logo.png",
          description:
            "יהלום לבית — מותג פרימיום ישראלי לתמונות לבית ואמנות קיר יוקרתית: הדפסה דיגיטלית מתקדמת על זכוכית מחוסמת, בעיצוב אישי.",
          telephone: s.contact_phone,
          email: s.contact_email,
          priceRange: "₪₪₪",
          address: {
            "@type": "PostalAddress",
            addressLocality: s.address,
            addressCountry: "IL",
          },
          areaServed: { "@type": "Country", name: "Israel" },
          ...(sameAs.length ? { sameAs } : {}),
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
              opens: "10:00",
              closes: "18:00",
            },
          ],
        },
        {
          "@type": "WebSite",
          "@id": "https://yahalom-la-bait.com/#website",
          url: "https://yahalom-la-bait.com",
          name: s.company_name,
          inLanguage: "he-IL",
          publisher: { "@id": "https://yahalom-la-bait.com/#organization" },
          potentialAction: {
            "@type": "SearchAction",
            target: "https://yahalom-la-bait.com/shop?cat={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        },
      ],
    };

    const scripts: Array<Record<string, string>> = [
      {
        type: "application/ld+json",
        children: JSON.stringify(jsonLd),
      },
    ];

    // GTM (fires as early as possible)
    if (s.gtm_container_id) {
      scripts.unshift({
        children: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${s.gtm_container_id}');`,
      });
    }

    // GA4
    if (s.ga4_measurement_id) {
      scripts.push({
        src: `https://www.googletagmanager.com/gtag/js?id=${s.ga4_measurement_id}`,
        async: "true",
      } as Record<string, string>);
      scripts.push({
        children: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${s.ga4_measurement_id}');`,
      });
    }

    // Facebook Pixel
    if (s.facebook_pixel_id) {
      scripts.push({
        children: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${s.facebook_pixel_id}');fbq('track','PageView');`,
      });
    }

    return {
      meta,
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "icon", type: "image/png", href: "/favicon.png" },
        { rel: "apple-touch-icon", href: "/favicon.png" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
        { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800;900&family=Frank+Ruhl+Libre:wght@500;700;800;900&family=Heebo:wght@300;400;500;600;700;800&family=Cormorant+Garamond:wght@500;600;700&display=swap" },
      ],
      scripts,
    };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-dvh flex-col">
        <Header />
        <main id="main" className="flex-1"><Outlet /></main>
        <Footer />
      </div>
      <MiniCart />
      <FloatingWidgets />
      <BackToTop />
      <Toaster />
    </QueryClientProvider>
  );
}
