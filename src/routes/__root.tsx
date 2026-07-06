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
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "author", content: "יהלום לבית - Yahalom La Bait" },
      { name: "google-site-verification", content: "ih_LInCKz_Xs-Pe6Stx-wqNdEFOOTT4tlqYVdC1jNEo" },
      { name: "theme-color", content: "#b98a5e" },
      { property: "og:site_name", content: "יהלום לבית" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "he_IL" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800;900&family=Frank+Ruhl+Libre:wght@500;700;800;900&family=Heebo:wght@300;400;500;600;700;800&family=Cormorant+Garamond:wght@500;600;700&display=swap" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "LocalBusiness",
              "@id": "https://yahalom-la-bait.com/#organization",
              name: "יהלום לבית",
              alternateName: "Yahalom La Bait",
              url: "https://yahalom-la-bait.com",
              description:
                "יהלום לבית — מותג פרימיום ישראלי לתמונות לבית ואמנות קיר יוקרתית: הדפסה דיגיטלית מתקדמת על זכוכית מחוסמת, בעיצוב אישי.",
              telephone: "+972-53-320-6500",
              email: "moshemalkaa@gmail.com",
              priceRange: "₪₪₪",
              address: {
                "@type": "PostalAddress",
                addressLocality: "מודיעין",
                addressCountry: "IL",
              },
              areaServed: { "@type": "Country", name: "Israel" },
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
              name: "יהלום לבית",
              inLanguage: "he-IL",
              publisher: { "@id": "https://yahalom-la-bait.com/#organization" },
              potentialAction: {
                "@type": "SearchAction",
                target: "https://yahalom-la-bait.com/shop?cat={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            },
          ],
        }),
      },
    ],
  }),
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
