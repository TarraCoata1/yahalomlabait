import { createFileRoute } from "@tanstack/react-router";
import { productsQuery } from "@/lib/catalog";
import { OrientationCollection } from "@/components/site/OrientationCollection";
import { breadcrumbSchema } from "@/lib/seo";
import { pageSeoQuery, buildSeoHead } from "@/lib/page-seo";

export const Route = createFileRoute("/shop_/rectangle")({
  head: ({ loaderData }) =>
    buildSeoHead({
      routePath: "/shop/rectangle",
      seo: loaderData?.[0] ?? null,
      extraScripts: [
        breadcrumbSchema([
          { name: "בית", path: "/" },
          { name: "חנות", path: "/shop" },
          { name: "יצירות מלבניות", path: "/shop/rectangle" },
        ]),
      ],
    }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(pageSeoQuery("/shop/rectangle")),
      context.queryClient.ensureQueryData(productsQuery),
    ]),
  component: () => <OrientationCollection orientation="rectangle" />,
});
