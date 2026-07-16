import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Mail, Phone, MapPin } from "lucide-react";
import logo from "@/assets/logo.png.asset.json";

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/50 bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-5 md:px-8">
        <div className="space-y-3 md:col-span-2">
          <img src={logo.url} alt="לוגו יהלום לבית" width={56} height={56} className="rounded-full ring-1 ring-rose-gold/40" />
          <div className="font-serif text-xl text-gradient-rose">יהלום לבית</div>
          <p className="text-sm text-muted-foreground max-w-sm">
            מותג פרימיום ישראלי לתמונות לבית ואמנות זכוכית יוקרתית בעיצוב אישי. הדפסה דיגיטלית ברמת גלריה — מודיעין, ישראל.
          </p>
          <ul className="space-y-1.5 pt-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-rose-gold" /><a href="tel:0533206500" className="hover:text-primary link-underline">053-320-6500</a></li>
            <li className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-rose-gold" /><a href="mailto:moshemalkaa@gmail.com" className="hover:text-primary link-underline">moshemalkaa@gmail.com</a></li>
            <li className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-rose-gold" /><span>מודיעין, ישראל</span></li>
          </ul>
          <div className="flex gap-2 pt-2">
            {[
              { i: Instagram, href: "https://www.instagram.com/yahalomlabait", label: "אינסטגרם" },
              { i: Facebook, href: "https://www.facebook.com/share/18re8TBvB9/?mibextid=wwXIfr", label: "פייסבוק" },
              { i: TikTokIcon, href: "https://www.tiktok.com/@yahalom_la_bait?_r=1&_t=ZS-97yzFuVFgB8", label: "טיקטוק" },
            ].map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                className="grid h-10 w-10 place-items-center rounded-full glass border border-border/60 text-rose-gold transition hover:scale-105 hover:border-rose-gold hover:bg-rose-gold/10">
                <s.i className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-3 font-serif text-lg">קולקציות</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/shop" className="hover:text-primary link-underline">כל התמונות לבית</Link></li>
            <li><Link to="/shop" search={{ cat: "modern" }} className="hover:text-primary link-underline">אמנות מודרנית</Link></li>
            <li><Link to="/shop" search={{ cat: "kodesh" }} className="hover:text-primary link-underline">אמנות יהודית</Link></li>
            <li><Link to="/custom" className="hover:text-primary link-underline">עיצוב אישי</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-serif text-lg">שירות לקוחות</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/shipping" className="hover:text-primary link-underline">משלוחים</Link></li>
            <li><Link to="/returns" className="hover:text-primary link-underline">החזרות</Link></li>
            <li><Link to="/faq" className="hover:text-primary link-underline">שאלות נפוצות</Link></li>
            <li><Link to="/contact" className="hover:text-primary link-underline">צור קשר</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-serif text-lg">אודות ומידע</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-primary link-underline">אודות</Link></li>
            <li><Link to="/privacy" className="hover:text-primary link-underline">מדיניות פרטיות</Link></li>
            <li><Link to="/terms" className="hover:text-primary link-underline">תקנון האתר</Link></li>
            <li><Link to="/contact" className="hover:text-primary link-underline">שיתופי פעולה</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/40 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} יהלום לבית · כל הזכויות שמורות
      </div>
    </footer>
  );
}
