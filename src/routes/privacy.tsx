import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { LegalPage } from "@/components/site/LegalDoc";
import { pageSeoQuery, buildSeoHead } from "@/lib/page-seo";
import { legalDocQuery } from "@/lib/legal";

export const Route = createFileRoute("/privacy")({
  loader: async ({ context }) => {
    const [seo] = await Promise.all([
      context.queryClient.ensureQueryData(pageSeoQuery("/privacy")),
      context.queryClient.ensureQueryData(legalDocQuery("privacy")),
    ]);
    return seo;
  },
  head: ({ loaderData }) => buildSeoHead({ routePath: "/privacy", seo: loaderData ?? null }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const { data: doc } = useSuspenseQuery(legalDocQuery("privacy"));
  return (
    <LegalPage
      eyebrow={doc?.eyebrow || "פרטיות"}
      title={doc?.title || "מדיניות פרטיות"}
      intro={doc?.intro || "אנו מכבדים את פרטיותכם ופועלים לפי חוק הגנת הפרטיות בישראל."}
      content={doc?.published_content ?? ""}
      updatedAt={doc?.published_at ?? doc?.updated_at ?? null}
    />
  );
}
