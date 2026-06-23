INSERT INTO public.categories (slug, name, tagline, image_key, is_active, sort_order)
VALUES ('import-new', 'ייבוא חדש - לא ממוין', 'תמונות שיובאו ועדיין לא מוינו לקטגוריה', '', true, 999)
ON CONFLICT (slug) DO NOTHING;