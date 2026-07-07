-- Create has_role helper if missing (idempotent)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Expand site_settings with global business + marketing fields
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS company_name TEXT NOT NULL DEFAULT 'יהלום לבית',
  ADD COLUMN IF NOT EXISTS logo_url TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS contact_email TEXT NOT NULL DEFAULT 'moshemalkaa@gmail.com',
  ADD COLUMN IF NOT EXISTS contact_phone TEXT NOT NULL DEFAULT '+972-53-320-6500',
  ADD COLUMN IF NOT EXISTS whatsapp_number TEXT NOT NULL DEFAULT '972533206500',
  ADD COLUMN IF NOT EXISTS address TEXT NOT NULL DEFAULT 'מודיעין, ישראל',
  ADD COLUMN IF NOT EXISTS google_maps_url TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS google_business_url TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS facebook_url TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS instagram_url TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS tiktok_url TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS youtube_url TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS ga4_measurement_id TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS gtm_container_id TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS facebook_pixel_id TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS gsc_verification TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS business_hours JSONB NOT NULL DEFAULT '[]'::jsonb;

CREATE TABLE IF NOT EXISTS public.page_seo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_path TEXT NOT NULL UNIQUE,
  page_label TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  keywords TEXT NOT NULL DEFAULT '',
  canonical_url TEXT NOT NULL DEFAULT '',
  og_title TEXT NOT NULL DEFAULT '',
  og_description TEXT NOT NULL DEFAULT '',
  og_image TEXT NOT NULL DEFAULT '',
  twitter_card TEXT NOT NULL DEFAULT 'summary_large_image',
  robots_index BOOLEAN NOT NULL DEFAULT true,
  robots_follow BOOLEAN NOT NULL DEFAULT true,
  breadcrumb_title TEXT NOT NULL DEFAULT '',
  schema_jsonld JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.page_seo TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_seo TO authenticated;
GRANT ALL ON public.page_seo TO service_role;

ALTER TABLE public.page_seo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view page SEO"
  ON public.page_seo FOR SELECT USING (true);

CREATE POLICY "Admins can insert page SEO"
  ON public.page_seo FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update page SEO"
  ON public.page_seo FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete page SEO"
  ON public.page_seo FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER page_seo_touch_updated_at
  BEFORE UPDATE ON public.page_seo
  FOR EACH ROW EXECUTE FUNCTION public.site_settings_touch_updated_at();

INSERT INTO public.page_seo (route_path, page_label, title, description, breadcrumb_title) VALUES
  ('/',        'דף הבית',    'יהלום לבית | תמונות זכוכית יוקרתית ואמנות פרימיום לבית', 'קולקציית תמונות זכוכית מחוסמת בהדפסה דיגיטלית ברמת גלריה. אמנות מודרנית, נופים, יודאיקה ועיצוב אישי — תוצרת ישראל.', 'בית'),
  ('/shop',    'חנות',       'חנות תמונות זכוכית — יהלום לבית', 'עיינו בקולקציית תמונות הזכוכית המחוסמת שלנו: אמנות מודרנית, טבע, יודאיקה, פופ ארט ועוד.', 'חנות'),
  ('/custom',  'עיצוב אישי', 'עיצוב תמונה אישית על זכוכית | יהלום לבית', 'הזמינו תמונת זכוכית מחוסמת בעיצוב אישי — התמונה שלכם, הסגנון שלכם, באיכות גלריה.', 'עיצוב אישי'),
  ('/about',   'אודות',      'אודות | יהלום לבית — אמנות זכוכית פרימיום', 'הכירו את יהלום לבית — מותג ישראלי לתמונות זכוכית ואמנות קיר יוקרתית.', 'אודות'),
  ('/contact', 'צור קשר',    'צור קשר | יהלום לבית', 'דברו איתנו — טלפון, וואטסאפ, אימייל וכתובת המפעל במודיעין.', 'צור קשר'),
  ('/faq',     'שאלות נפוצות','שאלות ותשובות | יהלום לבית', 'תשובות לשאלות הנפוצות ביותר על תמונות זכוכית מחוסמת, הזמנה, משלוח והתקנה.', 'שאלות נפוצות'),
  ('/shipping','משלוחים',    'מדיניות משלוחים | יהלום לבית', 'פרטי משלוח מבוטח לכל רחבי הארץ עבור תמונות זכוכית מחוסמת.', 'משלוחים'),
  ('/returns', 'החזרות',     'מדיניות החזרות | יהלום לבית', 'תנאי החזרה והחלפה של מוצרי יהלום לבית.', 'החזרות'),
  ('/privacy', 'פרטיות',     'מדיניות פרטיות | יהלום לבית', 'מדיניות הפרטיות של אתר יהלום לבית.', 'פרטיות'),
  ('/terms',   'תקנון',      'תקנון האתר | יהלום לבית', 'תנאי השימוש ותקנון אתר יהלום לבית.', 'תקנון')
ON CONFLICT (route_path) DO NOTHING;

UPDATE public.site_settings SET
  ga4_measurement_id = CASE WHEN COALESCE(ga4_measurement_id,'') = '' THEN 'G-DJNJS0PB2J' ELSE ga4_measurement_id END,
  gtm_container_id   = CASE WHEN COALESCE(gtm_container_id,'')   = '' THEN 'GTM-KM35PJR9'  ELSE gtm_container_id   END,
  gsc_verification   = CASE WHEN COALESCE(gsc_verification,'')   = '' THEN 'ih_LInCKz_Xs-Pe6Stx-wqNdEFOOTT4tlqYVdC1jNEo' ELSE gsc_verification END
WHERE id = true;
