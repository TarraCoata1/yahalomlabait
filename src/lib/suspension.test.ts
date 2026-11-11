import { describe, expect, it } from "bun:test";
import { SITE_SUSPENDED, SUSPENSION_CONTACT } from "./suspension";

describe("suspension rules", () => {
  it("enables the centralized suspension", () => expect(SITE_SUSPENDED).toBe(true));
  it("uses the requested brand destination", () => expect(SUSPENSION_CONTACT.brand).toBe("https://www.tarracoata.com"));
  it("addresses the support mailbox with the requested subject", () => {
    const url = new URL(SUSPENSION_CONTACT.emailHref);
    expect(url.pathname).toBe("support@tarracoata.com");
    expect(url.searchParams.get("subject")).toBe("פנייה בנושא זמינות אתר");
  });
  it("uses the requested WhatsApp conversation and message", () => {
    const url = new URL(SUSPENSION_CONTACT.whatsappHref);
    expect(url.origin + url.pathname).toBe("https://wa.me/972546969367");
    expect(url.searchParams.get("text")).toBe("שלום, אני פונה בעקבות הודעת השהיית האתר ואשמח לקבל פרטים נוספים.");
  });
  it("uses the requested social destinations", () => {
    expect(SUSPENSION_CONTACT.instagram).toBe("https://www.instagram.com/tarracoata/");
    expect(SUSPENSION_CONTACT.facebook).toBe("https://www.facebook.com/tarracoata/");
  });
});