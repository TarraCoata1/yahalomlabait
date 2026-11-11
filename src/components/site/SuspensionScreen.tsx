import { ArrowUpLeft, Facebook, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SUSPENSION_CONTACT as contact } from "@/lib/suspension";
import logo from "@/assets/tarracoata-logo.asset.json";

export function SuspensionScreen() {
  return (
    <main className="suspension-screen" dir="rtl" id="main">
      <div className="suspension-composition">
        <header className="suspension-brand suspension-enter">
          <a className="suspension-logo-link" href={contact.brand} target="_blank" rel="noopener noreferrer" aria-label="Visit TarraCoata">
            <img src={logo.url} alt="TarraCoata" width={112} height={112} fetchPriority="high" className="suspension-logo" />
          </a>
          <span className="suspension-wordmark" dir="ltr">TarraCoata</span>
        </header>

        <section className="suspension-message suspension-enter" aria-labelledby="suspension-title">
          <p className="suspension-status"><span aria-hidden="true" />האתר מושהה זמנית</p>
          <h1 id="suspension-title">האתר אינו זמין<br />באופן זמני.</h1>
          <p className="suspension-explanation">הגישה לאתר הושהתה באופן זמני.<br />לפרטים נוספים, אנחנו כאן לרשותכם.</p>
          <div className="suspension-contact">
            <Button asChild variant="suspension" size="lg">
              <a href={contact.whatsappHref} target="_blank" rel="noopener noreferrer" aria-label="יצירת קשר ב־WhatsApp">
                יצירת קשר<ArrowUpLeft aria-hidden="true" strokeWidth={1.5} />
              </a>
            </Button>
            <a href={contact.emailHref} className="suspension-email" dir="ltr">{contact.email}</a>
          </div>
        </section>

        <nav className="suspension-social suspension-enter" aria-label="TarraCoata social media">
          <a href={contact.instagram} target="_blank" rel="noopener noreferrer" aria-label="TarraCoata on Instagram" title="Instagram"><Instagram size={18} strokeWidth={1.5} aria-hidden="true" /></a>
          <a href={contact.facebook} target="_blank" rel="noopener noreferrer" aria-label="TarraCoata on Facebook" title="Facebook"><Facebook size={18} strokeWidth={1.5} aria-hidden="true" /></a>
        </nav>
      </div>
    </main>
  );
}