import { Link } from "@tanstack/react-router";
import { ShoppingBag, Menu, X, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import logo from "@/assets/logo.png.asset.json";
import { useCart, cartCount } from "@/lib/cart";
import { ThemeToggle } from "./ThemeToggle";
import { useSession, useIsAdmin } from "@/hooks/use-auth";

const nav = [
  { to: "/", label: "בית" },
  { to: "/shop", label: "חנות" },
  { to: "/custom", label: "עיצוב אישי" },
  { to: "/about", label: "אודות" },
  { to: "/contact", label: "צור קשר" },
];

export function Header() {
  const items = useCart((s) => s.items);
  const setOpen = useCart((s) => s.setOpen);
  const [mobile, setMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const count = cartCount(items);
  const { user } = useSession();
  const { data: isAdmin } = useIsAdmin(user);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-header glass-strong sticky top-0 z-40 ${scrolled ? "is-scrolled" : ""}`}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:right-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-background focus:px-4 focus:py-2">דלג לתוכן</a>
      <div className="site-header-inner mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:h-20 md:px-8">
        <Link to="/" aria-label="יהלום לבית - דף הבית" className="flex items-center gap-3 shrink-0">
          <img src={logo.url} alt="לוגו יהלום לבית - תמונות זכוכית ואמנות קיר יוקרתית לבית" width={44} height={44} className="rounded-full ring-1 ring-rose-gold/40" />
          <div className="hidden sm:block leading-tight">
            <div className="font-serif text-lg tracking-wide text-gradient-rose">יהלום לבית</div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Glass Art Prints</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="text-foreground/80 hover:text-primary transition-colors"
              activeProps={{ className: "text-primary" }} activeOptions={{ exact: n.to === "/" }}>
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link to="/admin-portal" aria-label="פאנל ניהול"
              className="grid h-11 w-11 place-items-center rounded-full glass hover:border-rose-gold/60 transition" title="פאנל ניהול">
              <ShieldCheck className="h-5 w-5 text-rose-gold" />
            </Link>
          )}
          <ThemeToggle />
          <button onClick={() => setOpen(true)} aria-label="עגלה"
            className="relative grid h-11 w-11 place-items-center rounded-full glass hover:border-rose-gold/60 transition">
            <ShoppingBag className="h-5 w-5 text-rose-gold" />
            {count > 0 && (
              <span className="absolute -top-1 -left-1 grid h-5 min-w-5 place-items-center rounded-full bg-rose-gold px-1 text-[11px] font-semibold text-primary-foreground">
                {count}
              </span>
            )}
          </button>
          <button onClick={() => setMobile((v) => !v)} aria-label={mobile ? "סגור תפריט" : "פתח תפריט"}
            aria-expanded={mobile} aria-controls="mobile-nav"
            className="md:hidden grid h-11 w-11 place-items-center rounded-full glass">
            {mobile ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>

        </div>
      </div>

      {mobile && (
        <div id="mobile-nav" className="md:hidden border-t border-border/50 glass-strong">
          <div className="flex flex-col px-6 py-4 gap-1">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setMobile(false)}
                className="py-3 text-base text-foreground/80 hover:text-primary"
                activeProps={{ className: "text-primary" }} activeOptions={{ exact: n.to === "/" }}>
                {n.label}
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin-portal" onClick={() => setMobile(false)} className="py-3 text-base text-rose-gold">
                פאנל ניהול
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
