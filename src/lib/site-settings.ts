import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SiteSettings = {
  site_title: string;
  site_description: string;
  social_image_url: string;
};

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  site_title: "יהלום לבית | תמונות זכוכית יוקרתית ואמנות פרימיום לבית",
  site_description:
    "שדרגו את החלל עם קולקציית תמונות זכוכית מחוסמת אקסטרה קליר בהדפסה דיגיטלית ברמת גלריה. אמנות מודרנית, נופים, יודאיקה ועיצוב אישי תוצרת ישראל.",
  social_image_url: "",
};

export async function fetchSiteSettings(): Promise<SiteSettings> {
  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("site_title, site_description, social_image_url")
      .maybeSingle();
    if (error || !data) return DEFAULT_SITE_SETTINGS;
    return {
      site_title: data.site_title || DEFAULT_SITE_SETTINGS.site_title,
      site_description: data.site_description || DEFAULT_SITE_SETTINGS.site_description,
      social_image_url: data.social_image_url || "",
    };
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
