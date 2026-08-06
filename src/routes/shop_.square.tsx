import { createFileRoute } from "@tanstack/react-router";
import { productsQuery } from "@/lib/catalog";
import { OrientationCollection } from "@/components/site/OrientationCollection";
import { breadcrumbSchema } from "@/lib/seo";
import { pageSeoQuery, buildSeoHead } from "@/lib/page-seo";

export const Route = createFileRoute("/shop_/square")({
  head: ({ loaderData }) =>
    buildSeoHead({
      routePath: "/shop/square",
      seo: loaderData?.[0] ?? null,
      extraScripts: [
        breadcrumbSchema([
          { name: "בית", path: "/" },
          { name: "חנות", path: "/shop" },
          { name: "יצירות מרובעות", path: "/shop/square" },
        ]),
      ],
    }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(pageSeoQuery("/shop/square")),
      context.queryClient.ensureQueryData(productsQuery),
    ]),
  component: () => <OrientationCollection orientation="square" />,
});
