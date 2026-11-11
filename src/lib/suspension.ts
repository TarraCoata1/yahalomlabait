/** Set false and redeploy to restore the original website. No URL/storage bypass. */
export const SITE_SUSPENDED: boolean = true;

export const SUSPENSION_CONTACT = {
  brand: "https://www.tarracoata.com",
  email: "support@tarracoata.com",
  emailHref: `mailto:support@tarracoata.com?subject=${encodeURIComponent("פנייה בנושא זמינות אתר")}`,
  whatsappHref: `https://wa.me/972546969367?text=${encodeURIComponent("שלום, אני פונה בעקבות הודעת השהיית האתר ואשמח לקבל פרטים נוספים.")}`,
  instagram: "https://www.instagram.com/tarracoata/",
  facebook: "https://www.facebook.com/tarracoata/",
} as const;