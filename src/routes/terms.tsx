import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { LegalPage } from "@/components/site/LegalDoc";
import { pageSeoQuery, buildSeoHead } from "@/lib/page-seo";
import { legalDocQuery } from "@/lib/legal";

export const Route = createFileRoute("/terms")({
  loader: async ({ context }) => {
    const [seo] = await Promise.all([
      context.queryClient.ensureQueryData(pageSeoQuery("/terms")),
      context.queryClient.ensureQueryData(legalDocQuery("terms")),
    ]);
    return seo;
  },
  head: ({ loaderData }) => buildSeoHead({ routePath: "/terms", seo: loaderData ?? null }),
  component: TermsPage,
});

function TermsPage() {
  const { data: doc } = useSuspenseQuery(legalDocQuery("terms"));
  return (
    <LegalPage
      eyebrow={doc?.eyebrow || "תנאי שימוש"}
      title={doc?.title || "תקנון ותנאי שימוש"}
      intro={doc?.intro || "השימוש באתר ורכישה דרכו כפופים לתנאים המפורטים בתקנון זה."}
      content={doc?.published_content ?? ""}
      updatedAt={doc?.published_at ?? doc?.updated_at ?? null}
    />
  );
}
