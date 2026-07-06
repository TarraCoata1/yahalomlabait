import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="חזרה למעלה"
      className={`fixed bottom-24 right-6 z-30 grid h-12 w-12 place-items-center rounded-full glass-strong text-rose-gold border border-rose-gold/40 shadow-elegant transition-all duration-300 hover:scale-110 hover:border-rose-gold ${
        show ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <ChevronUp className="h-5 w-5" />
    </button>
  );
}
