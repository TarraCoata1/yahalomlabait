// TarraCoata credit — easy to remove: delete this file and the <TarraCoataCredit /> line in Footer.tsx
import logo from "@/assets/tarracoata-logo.png.asset.json";

export function TarraCoataCredit() {
  return (
    <a
      href="https://www.tarracoata.com"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="עוצב ונבנה על ידי TarraCoata"
      className="group mt-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-4 py-2 text-xs text-muted-foreground backdrop-blur-sm transition hover:border-rose-gold/60 hover:text-foreground"
    >
      <span>עוצב ונבנה על ידי</span>
      <img
        src={logo.url}
        alt="TarraCoata"
        width={20}
        height={20}
        className="h-5 w-5 object-contain transition group-hover:scale-110"
      />
      <span className="font-semibold tracking-wide" style={{ background: "linear-gradient(135deg,#c084fc,#a855f7,#ec4899)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
        TarraCoata
      </span>
    </a>
  );
}
