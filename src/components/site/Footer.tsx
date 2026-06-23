import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.png.asset.json";
import { TarraCoataCredit } from "./TarraCoataCredit";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/50 bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4 md:px-8">
        <div className="space-y-3">
          <img src={logo.url} alt="" width={56} height={56} className="rounded-full ring-1 ring-rose-gold/40" />
          <div className="font-serif text-xl text-gradient-rose">Yahalom La Bait</div>
          <p className="text-sm text-muted-foreground">אמנות זכוכית יוקרתית בעיצוב אישי. מודיעין, ישראל.</p>
        </div>
        <div>
          <h4 className="mb-3 font-serif text-lg">חנות</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/shop" className="hover:text-primary">כל המוצרים</Link></li>
            <li><Link to="/shop" search={{ cat: "modern" }} className="hover:text-primary">אמנות מודרנית</Link></li>
            <li><Link to="/shop" search={{ cat: "kodesh" }} className="hover:text-primary">אמנות יהודית</Link></li>
            <li><Link to="/custom" className="hover:text-primary">עיצוב אישי</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-serif text-lg">מידע</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-primary">אודות</Link></li>
            <li><Link to="/contact" className="hover:text-primary">צור קשר</Link></li>
            <li><a href="#" className="hover:text-primary">משלוחים והחזרות</a></li>
            <li><a href="#" className="hover:text-primary">מדיניות פרטיות</a></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-serif text-lg">צרו קשר</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="tel:0533206500" className="hover:text-primary">053-320-6500</a></li>
            <li>moshemalkaa@gmail.com</li>
            <li>ראשון–חמישי · 10:00–18:00</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/40 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Yahalom La Bait · כל הזכויות שמורות
        <div className="mt-2 flex justify-center"><TarraCoataCredit /></div>
      </div>
    </footer>
  );
}
