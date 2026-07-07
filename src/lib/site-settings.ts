import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SiteSettings = {
  // Meta / social
  site_title: string;
  site_description: string;
  social_image_url: string;
  // Business
  company_name: string;
  logo_url: string;
  contact_email: string;
  contact_phone: string;
  whatsapp_number: string;
  address: string;
  google_maps_url: string;
  google_business_url: string;
  // Socials
  facebook_url: string;
  instagram_url: string;
  tiktok_url: string;
  youtube_url: string;
  // Marketing / verification
  ga4_measurement_id: string;
  gtm_container_id: string;
  facebook_pixel_id: string;
  gsc_verification: string;
  business_hours: unknown;
};

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  site_title: "יהלום לבית | תמונות זכוכית יוקרתית ואמנות פרימיום לבית",
  site_description:
    "שדרגו את החלל עם קולקציית תמונות זכוכית מחוסמת אקסטרה קליר בהדפסה דיגיטלית ברמת גלריה. אמנות מודרנית, נופים, יודאיקה ועיצוב אישי תוצרת ישראל.",
  social_image_url: "",
  company_name: "יהלום לבית",
  logo_url: "",
  contact_email: "moshemalkaa@gmail.com",
  contact_phone: "+972-53-320-6500",
  whatsapp_number: "972533206500",
  address: "מודיעין, ישראל",
  google_maps_url: "",
  google_business_url: "",
  facebook_url: "",
  instagram_url: "",
  tiktok_url: "",
  youtube_url: "",
  ga4_measurement_id: "",
  gtm_container_id: "",
  facebook_pixel_id: "",
  gsc_verification: "",
  business_hours: [],
};

export async function fetchSiteSettings(): Promise<SiteSettings> {
  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .maybeSingle();
    if (error || !data) return DEFAULT_SITE_SETTINGS;
    return {
      ...DEFAULT_SITE_SETTINGS,
      ...Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== null && v !== undefined),
      ),
    } as SiteSettings;
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}

export const siteSettingsQuery = queryOptions({
  queryKey: ["site_settings"],
  queryFn: fetchSiteSettings,
  staleTime: 60_000,
});

const SOCIAL_IMAGE_EXPIRY = 60 * 60 * 24 * 365 * 10; // 10 years

export async function uploadSocialImage(file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "png").toLowerCase();
  const path = `social/og-${Date.now()}.${ext}`;
  const up = await supabase.storage.from("site-assets").upload(path, file, {
    cacheControl: "3600",
    upsert: true,
    contentType: file.type || undefined,
  });
  if (up.error) throw up.error;
  const signed = await supabase.storage
    .from("site-assets")
    .createSignedUrl(path, SOCIAL_IMAGE_EXPIRY);
  if (signed.error || !signed.data?.signedUrl) throw signed.error ?? new Error("signed url failed");
  return signed.data.signedUrl;
}

export async function saveSiteSettings(patch: Partial<SiteSettings>) {
  const { error } = await supabase
    .from("site_settings")
    .update({ ...patch })
    .eq("id", true);
  if (error) throw error;
}
