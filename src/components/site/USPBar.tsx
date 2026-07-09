import { ShieldCheck, Sparkles, Truck, MapPin } from "lucide-react";

const items = [
  { icon: Sparkles, title: "זכוכית מחוסמת אקסטרה קלירית", sub: "צלילות מקסימלית, ברק עמוק" },
  { icon: ShieldCheck, title: "הדפסה דיגיטלית מתקדמת", sub: "חדות וצבעים שלא נדהים" },
  { icon: Truck, title: "משלוח מבוטח עד הבית", sub: "משלוח והתקנה מבוטחים" },
  { icon: MapPin, title: "תוצרת ישראל", sub: "ייצור איכותי במודיעין" },
];

export function USPBar() {
  return (
    <section className="border-y border-border/40 bg-card/30">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:grid-cols-2 md:px-8 lg:grid-cols-4">
        {items.map((it) => (
          <div key={it.title} className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full glass">
              <it.icon className="h-5 w-5 text-rose-gold" />
            </div>
            <div className="min-w-0">
              <div className="font-medium leading-tight">{it.title}</div>
              <div className="text-xs text-muted-foreground">{it.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
