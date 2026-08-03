import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type LegalSlug = "terms" | "privacy" | "cookies";

export const LEGAL_SLUGS: LegalSlug[] = ["terms", "privacy", "cookies"];

export const LEGAL_ROUTE: Record<LegalSlug, string> = {
  terms: "/terms",
  privacy: "/privacy",
  cookies: "/cookies",
};

export type LegalDocPublic = {
  id: string;
  slug: string;
  page_label: string;
  title: string;
  eyebrow: string;
  intro: string;
  published_content: string;
  published_at: string | null;
  updated_at: string;
};

export type LegalDocAdmin = LegalDocPublic & {
  draft_content: string;
  updated_by_email: string;
};

export type LegalVersion = {
  id: string;
  document_id: string;
  title: string;
  intro: string;
  content: string;
  published_by_email: string;
  created_at: string;
};

/** Columns readable by anonymous visitors (matches column-level grants). */
const PUBLIC_COLS =
  "id, slug, page_label, title, eyebrow, intro, published_content, published_at, updated_at";

export async function fetchLegalDoc(slug: LegalSlug): Promise<LegalDocPublic | null> {
  try {
    const { data, error } = await supabase
      .from("legal_documents")
      .select(PUBLIC_COLS)
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) return null;
    return data as LegalDocPublic;
  } catch {
    return null;
  }
}

export const legalDocQuery = (slug: LegalSlug) =>
  queryOptions({
    queryKey: ["legal_doc", slug],
    queryFn: () => fetchLegalDoc(slug),
    staleTime: 30_000,
  });

/** Admin-only: includes drafts. */
export const legalDocsAdminQuery = queryOptions({
  queryKey: ["legal_docs", "admin"],
  queryFn: async (): Promise<LegalDocAdmin[]> => {
    const { data, error } = await supabase
      .from("legal_documents")
      .select("*")
      .order("slug");
    if (error) throw error;
    return (data ?? []) as LegalDocAdmin[];
  },
});

export const legalVersionsQuery = (documentId: string) =>
  queryOptions({
    queryKey: ["legal_versions", documentId],
    queryFn: async (): Promise<LegalVersion[]> => {
      const { data, error } = await supabase
        .from("legal_document_versions")
        .select("*")
        .eq("document_id", documentId)
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return (data ?? []) as LegalVersion[];
    },
  });

type EditorMeta = { userId: string | null; email: string };

export async function saveLegalDraft(
  doc: LegalDocAdmin,
  patch: { title: string; eyebrow: string; intro: string; draft_content: string },
  by: EditorMeta,
) {
  const { error } = await supabase
    .from("legal_documents")
    .update({
      title: patch.title,
      eyebrow: patch.eyebrow,
      intro: patch.intro,
      draft_content: patch.draft_content,
      updated_by: by.userId,
      updated_by_email: by.email,
    })
    .eq("id", doc.id);
  if (error) throw error;
}

export async function publishLegalDoc(
  doc: LegalDocAdmin,
  patch: { title: string; eyebrow: string; intro: string; draft_content: string },
  by: EditorMeta,
) {
  const { error } = await supabase
    .from("legal_documents")
    .update({
      title: patch.title,
      eyebrow: patch.eyebrow,
      intro: patch.intro,
      draft_content: patch.draft_content,
      published_content: patch.draft_content,
      published_at: new Date().toISOString(),
      updated_by: by.userId,
      updated_by_email: by.email,
    })
    .eq("id", doc.id);
  if (error) throw error;

  // Version history entry (non-fatal if it fails).
  await supabase.from("legal_document_versions").insert({
    document_id: doc.id,
    title: patch.title,
    intro: patch.intro,
    content: patch.draft_content,
    published_by: by.userId,
    published_by_email: by.email,
  });
}

export function formatLegalDate(iso: string | null | undefined) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("he-IL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

/** Restore a previous published version into the draft (admin only). */
export async function restoreLegalVersion(
  doc: LegalDocAdmin,
  version: LegalVersion,
  by: EditorMeta,
) {
  const { error } = await supabase
    .from("legal_documents")
    .update({
      title: version.title,
      intro: version.intro,
      draft_content: version.content,
      updated_by: by.userId,
      updated_by_email: by.email,
    })
    .eq("id", doc.id);
  if (error) throw error;
}
