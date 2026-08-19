-- Restrict public/anonymous reads of legal_documents to published columns only.
REVOKE SELECT ON public.legal_documents FROM anon, authenticated;

GRANT SELECT (id, slug, page_label, title, eyebrow, intro, published_content, published_at, created_at, updated_at)
  ON public.legal_documents TO anon, authenticated;

-- Admins keep full access (including drafts) through a security-definer accessor.
CREATE OR REPLACE FUNCTION public.admin_legal_documents()
RETURNS TABLE (
  id uuid,
  slug text,
  page_label text,
  title text,
  eyebrow text,
  intro text,
  published_content text,
  draft_content text,
  published_at timestamptz,
  updated_by uuid,
  updated_by_email text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT d.id, d.slug, d.page_label, d.title, d.eyebrow, d.intro,
         d.published_content, d.draft_content, d.published_at,
         d.updated_by, d.updated_by_email, d.created_at, d.updated_at
  FROM public.legal_documents d
  WHERE app_private.has_role(auth.uid(), 'admin'::app_role)
  ORDER BY d.slug
$$;

REVOKE ALL ON FUNCTION public.admin_legal_documents() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_legal_documents() TO authenticated;