import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { LegalPage } from "@/components/site/LegalDoc";
import { pageSeoQuery, buildSeoHead } from "@/lib/page-seo";
import { legalDocQuery } from "@/lib/legal";

export const Route = createFileRoute("/cookies")({
  loader: async ({ context }) => {
    const [seo] = await Promise.all([
      context.queryClient.ensureQueryData(pageSeoQuery("/cookies")),
      context.queryClient.ensureQueryData(legalDocQuery("cookies")),
    ]);
    return seo;
  },
  head: ({ loaderData }) => buildSeoHead({ routePath: "/cookies", seo: loaderData ?? null }),
  component: CookiesPage,
});

function CookiesPage() {
  const { data: doc } = useSuspenseQuery(legalDocQuery("cookies"));
  return (
    <LegalPage
      eyebrow={doc?.eyebrow || "עוגיות"}
      title={doc?.title || "מדיניות עוגיות (Cookies)"}
      intro={doc?.intro || "אילו עוגיות פועלות באתר, למה הן משמשות וכיצד ניתן לשלוט בהן."}
      content={doc?.published_content ?? ""}
      updatedAt={doc?.published_at ?? doc?.updated_at ?? null}
    />
  );
}
