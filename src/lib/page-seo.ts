import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  schema_jsonld: unknown;
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

export const allPageSeoQuery = queryOptions({
  queryKey: ["page_seo", "all"],
  queryFn: fetchAllPageSeo,
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
