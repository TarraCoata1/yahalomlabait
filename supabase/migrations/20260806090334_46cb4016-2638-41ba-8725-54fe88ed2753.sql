DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'artwork_orientation') THEN
    CREATE TYPE public.artwork_orientation AS ENUM ('square','rectangle');
  END IF;
END $$;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS orientation public.artwork_orientation NOT NULL DEFAULT 'rectangle';

UPDATE public.products SET orientation = 'square' WHERE display_mode = 'square';

INSERT INTO public.page_seo (route_path, page_label, title, description, og_title, og_description, breadcrumb_title)
VALUES
  ('/shop/square', 'תמונות זכוכית מרובעות',
   'תמונות זכוכית מרובעות | יהלום לבית',
   'קולקציית תמונות זכוכית מרובעות (1:1) בהדפסה דיגיטלית ברמת גלריה — לסלון, לחדר שינה, למשרד ולפינות עיצוב מודרניות.',
   'תמונות זכוכית מרובעות | יהלום לבית',
   'קולקציית תמונות זכוכית מרובעות בהדפסה דיגיטלית ברמת גלריה — פרופורציות מושלמות לקירות מודרניים.',
   'מרובעות'),
  ('/shop/rectangle', 'תמונות זכוכית מלבניות',
   'תמונות זכוכית מלבניות | יהלום לבית',
   'תמונות זכוכית מלבניות אלגנטיות לקירות גדולים, פינת אוכל, סלון ומסדרונות — הדפסה דיגיטלית על זכוכית מחוסמת אקסטרה קליר.',
   'תמונות זכוכית מלבניות | יהלום לבית',
   'תמונות זכוכית מלבניות אלגנטיות לקירות גדולים, סלון, פינת אוכל ומסדרונות.',
   'מלבניות')
ON CONFLICT DO NOTHING;