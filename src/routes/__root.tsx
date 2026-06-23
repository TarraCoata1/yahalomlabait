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
      { title: "Yahalom La Bait | אמנות זכוכית יוקרתית" },
      { name: "description", content: "Yahalom La Bait — תמונות זכוכית יוקרתיות בעיצוב אישי. הדפסה דיגיטלית מתקדמת על זכוכית מחוסמת לעיצוב הבית." },
      { name: "author", content: "Yahalom La Bait" },
      { property: "og:title", content: "Yahalom La Bait | אמנות זכוכית יוקרתית" },
      { property: "og:description", content: "אמנות זכוכית פרימיום בעיצוב אישי לעיצוב הבית." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Heebo:wght@300;400;500;600;700&family=Frank+Ruhl+Libre:wght@500;700&display=swap" },
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
        <main className="flex-1"><Outlet /></main>
        <Footer />
      </div>
      <MiniCart />
      <FloatingWidgets />
    </QueryClientProvider>
  );
}
