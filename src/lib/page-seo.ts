import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { SITE_NAME, SITE_URL, canonical } from "@/lib/seo";

export type PageSeo = {
  id: string;
  route_path: string;
  page_label: string;
  title: string;
  description: string;
  keywords: string;
  canonical_url: string;
  og_title: string;
  og_description: string;
  og_image: string;
  twitter_card: string;
  robots_index: boolean;
  robots_follow: boolean;
  breadcrumb_title: string;
  schema_jsonld: Json;
  is_active: boolean;
};

export async function fetchAllPageSeo(): Promise<PageSeo[]> {
  try {
    const { data, error } = await supabase
      .from("page_seo")
      .select("*")
      .order("route_path");
    if (error || !data) return [];
    return data as PageSeo[];
  } catch {
    return [];
  }
}

export async function fetchPageSeoByPath(routePath: string): Promise<PageSeo | null> {
  try {
    const { data, error } = await supabase
      .from("page_seo")
      .select("*")
      .eq("route_path", routePath)
      .maybeSingle();
    if (error || !data) return null;
    return data as PageSeo;
  } catch {
    return null;
  }
}

export const allPageSeoQuery = queryOptions({
  queryKey: ["page_seo", "all"],
  queryFn: fetchAllPageSeo,
  staleTime: 60_000,
});

export const pageSeoQuery = (routePath: string) =>
  queryOptions({
    queryKey: ["page_seo", "route", routePath],
    queryFn: () => fetchPageSeoByPath(routePath),
    staleTime: 60_000,
  });

export async function savePageSeo(id: string, patch: Partial<PageSeo>) {
  const { error } = await supabase.from("page_seo").update(patch).eq("id", id);
  if (error) throw error;
}

export async function createPageSeo(patch: Partial<PageSeo> & { route_path: string }) {
  const { data, error } = await supabase.from("page_seo").insert(patch).select().single();
  if (error) throw error;
  return data as PageSeo;
}

export async function deletePageSeo(id: string) {
  const { error } = await supabase.from("page_seo").delete().eq("id", id);
  if (error) throw error;
}

// ---------- head() builder — DB is the single source of truth ----------

type HeadScript = { type: "application/ld+json"; children: string };
type HeadLink = { rel: string; href: string; [k: string]: unknown };
type HeadMeta = Record<string, string>;

export interface BuildSeoHeadOptions {
  /** Route path fallback if page_seo row is missing (used only for canonical url). */
  routePath: string;
  /** The page_seo record loaded from the DB (may be null if row missing). */
  seo: PageSeo | null;
  /** OG type — "website" | "article" | "product". Defaults to "website". */
  type?: "website" | "article" | "product";
  /** Extra JSON-LD structured data (BreadcrumbList, FAQ, HowTo, etc.). */
  extraScripts?: HeadScript[];
  /** Extra <link> tags (preload, prefetch). */
  extraLinks?: HeadLink[];
}

/**
 * Builds meta/links/scripts for a route's head() from a `page_seo` row.
 * The DB is the single source of truth — edit values in the admin panel.
 */
export function buildSeoHead(opts: BuildSeoHeadOptions): {
  meta: HeadMeta[];
  links: HeadLink[];
  scripts: HeadScript[];
} {
  const { seo, routePath, type = "website", extraScripts = [], extraLinks = [] } = opts;

  const title = seo?.title || SITE_NAME;
  const description = seo?.description || "";
  const ogTitle = seo?.og_title || title;
  const ogDesc = seo?.og_description || description;
  const ogImage = seo?.og_image || "";
  const twitterCard = seo?.twitter_card || (ogImage ? "summary_large_image" : "summary");
  const canonicalUrl = seo?.canonical_url || canonical(routePath);
  const robotsIdx = seo?.robots_index ?? true;
  const robotsFollow = seo?.robots_follow ?? true;
  const robots = `${robotsIdx ? "index" : "noindex"}, ${robotsFollow ? "follow" : "nofollow"}`;

  const meta: HeadMeta[] = [
    { title },
    { name: "description", content: description },
    { name: "robots", content: robots },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:type", content: type },
    { property: "og:locale", content: "he_IL" },
    { property: "og:url", content: canonicalUrl },
    { property: "og:title", content: ogTitle },
    { property: "og:description", content: ogDesc },
    { name: "twitter:card", content: twitterCard },
    { name: "twitter:title", content: ogTitle },
    { name: "twitter:description", content: ogDesc },
  ];
  if (seo?.keywords) meta.push({ name: "keywords", content: seo.keywords });
  if (ogImage) {
    meta.push({ property: "og:image", content: ogImage });
    meta.push({ name: "twitter:image", content: ogImage });
  }

  const links: HeadLink[] = [
    { rel: "canonical", href: canonicalUrl },
    ...extraLinks,
  ];

  const scripts: HeadScript[] = [...extraScripts];
  // Include per-page JSON-LD stored in DB, if any.
  if (seo?.schema_jsonld && typeof seo.schema_jsonld === "object") {
    const raw = seo.schema_jsonld as Record<string, unknown> | Record<string, unknown>[];
    const isEmpty =
      (Array.isArray(raw) && raw.length === 0) ||
      (!Array.isArray(raw) && Object.keys(raw).length === 0);
    if (!isEmpty) {
      scripts.push({ type: "application/ld+json", children: JSON.stringify(raw) });
    }
  }

  // Suppress unused import warning — SITE_URL kept in module for other consumers.
  void SITE_URL;

  return { meta, links, scripts };
}
