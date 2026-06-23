import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p4 from "@/assets/p4.jpg";
import p5 from "@/assets/p5.jpg";
import p6 from "@/assets/p6.jpg";
import p7 from "@/assets/p7.jpg";
import p8 from "@/assets/p8.jpg";
import catModern from "@/assets/cat-modern.jpg";
import catLandscape from "@/assets/cat-landscape.jpg";
import catAbstract from "@/assets/cat-abstract.jpg";
import catKodesh from "@/assets/cat-kodesh.jpg";
import catCustom from "@/assets/cat-custom.jpg";

export type CategoryId = "abstract" | "nature" | "popart" | "kodesh" | "premium";

export const categories: { id: CategoryId; name: string; tagline: string; image: string }[] = [
  { id: "abstract", name: "מודרני ומופשט", tagline: "קווים נקיים ועוצמה עכשווית", image: catModern },
  { id: "nature", name: "טבע ונופים", tagline: "נופים שעוצרים את הנשימה", image: catLandscape },
  { id: "popart", name: "פופ ארט ואופנה", tagline: "אופנה, יוקרה וצבע", image: catAbstract },
  { id: "kodesh", name: "פסוקים וקודש", tagline: "מורשת בעיצוב יוקרתי", image: catKodesh },
  { id: "premium", name: "קולקציית ענק פרימיום", tagline: "הדפסים בקנה מידה גדול לחללים מרשימים", image: catCustom },
];

export type Size = { id: string; label: string; price: number; w: number; h: number };

/** Rectangular sizes — absolute price in NIS */
export const RECT_SIZES: Size[] = [
  { id: "15x20", label: "15×20 ס\"מ", price: 250, w: 15, h: 20 },
  { id: "20x30", label: "20×30 ס\"מ", price: 350, w: 20, h: 30 },
  { id: "30x40", label: "30×40 ס\"מ", price: 400, w: 30, h: 40 },
  { id: "30x45", label: "30×45 ס\"מ", price: 400, w: 30, h: 45 },
  { id: "40x60", label: "40×60 ס\"מ", price: 450, w: 40, h: 60 },
  { id: "40x80", label: "40×80 ס\"מ", price: 500, w: 40, h: 80 },
  { id: "50x70", label: "50×70 ס\"מ", price: 500, w: 50, h: 70 },
  { id: "50x100", label: "50×100 ס\"מ", price: 600, w: 50, h: 100 },
  { id: "60x90", label: "60×90 ס\"מ", price: 600, w: 60, h: 90 },
  { id: "60x120", label: "60×120 ס\"מ", price: 750, w: 60, h: 120 },
  { id: "70x100", label: "70×100 ס\"מ", price: 750, w: 70, h: 100 },
  { id: "80x120", label: "80×120 ס\"מ", price: 850, w: 80, h: 120 },
  { id: "70x140", label: "70×140 ס\"מ", price: 950, w: 70, h: 140 },
  { id: "100x150", label: "100×150 ס\"מ", price: 1300, w: 100, h: 150 },
  { id: "80x160", label: "80×160 ס\"מ", price: 1500, w: 80, h: 160 },
  { id: "100x200", label: "100×200 ס\"מ", price: 2000, w: 100, h: 200 },
];

/** Square sizes — absolute price in NIS */
export const SQUARE_SIZES: Size[] = [
  { id: "30x30", label: "30×30 ס\"מ", price: 350, w: 30, h: 30 },
  { id: "40x40", label: "40×40 ס\"מ", price: 350, w: 40, h: 40 },
  { id: "50x50", label: "50×50 ס\"מ", price: 400, w: 50, h: 50 },
  { id: "60x60", label: "60×60 ס\"מ", price: 500, w: 60, h: 60 },
  { id: "70x70", label: "70×70 ס\"מ", price: 600, w: 70, h: 70 },
  { id: "80x80", label: "80×80 ס\"מ", price: 700, w: 80, h: 80 },
  { id: "90x90", label: "90×90 ס\"מ", price: 800, w: 90, h: 90 },
  { id: "100x100", label: "100×100 ס\"מ", price: 900, w: 100, h: 100 },
];

/** Backward compat — used in shop / footnote. */
export const SIZES: Size[] = RECT_SIZES;

/** Minimum price across all available sizes — starting price for catalog tiles. */
export const FROM_PRICE = 250;

/**
 * Professional installation fee in NIS.
 * Sizes up to and including 70×100 → 250 ₪.
 * Anything larger → 350 ₪.
 */
export const installationFee = (size: Size): number => {
  const maxDim = Math.max(size.w, size.h);
  const minDim = Math.min(size.w, size.h);
  // "up to 70x100" means both dimensions fit within 70 and 100.
  if (minDim <= 70 && maxDim <= 100) return 250;
  return 350;
};

export type Product = {
  id: string;
  name: string;
  category: CategoryId;
  colors: string[];
  style: string;
  image: string;
  description: string;
  bestSeller?: boolean;
};

export const products: Product[] = [
  { id: "golden-leaves", name: "עלי זהב", category: "abstract", colors: ["זהב", "קרם"], style: "בוטני", image: p1,
    description: "יצירת אמנות בוטנית עדינה בגווני זהב חמים על רקע קרם. מוסיפה אור ונוכחות שקטה לכל חלל.", bestSeller: true },
  { id: "noir-circle", name: "מעגל נואר", category: "abstract", colors: ["שחור", "זהב"], style: "מינימליסטי", image: p2,
    description: "קומפוזיציה מינימליסטית בשחור עם מסגרת זהב. אמירה עיצובית חדה ובוטחת.", bestSeller: true },
  { id: "kotel-doves", name: "הכותל ויונים", category: "kodesh", colors: ["זהב", "תכלת"], style: "יהודי", image: p3,
    description: "הכותל המערבי באור בוקר, יונים מרחפות. חיבור עמוק לירושלים ולמורשת.", bestSeller: true },
  { id: "ocean-rose", name: "גל הזריחה", category: "nature", colors: ["כתום", "ורוד", "כחול"], style: "טבע", image: p4,
    description: "גל אוקיינוס בזריחה ורודה. תנועה, אור והשתקפויות שמחיים את החלל." },
  { id: "marble-rose", name: "שיש ורוד וזהב", category: "abstract", colors: ["ורוד", "זהב"], style: "אבסטרקט", image: p5,
    description: "טקסטורת שיש בגווני ורוד ענוג עם זרימות זהב. יוקרה רכה ונשית.", bestSeller: true },
  { id: "femme-line", name: "פורטרט קו", category: "popart", colors: ["שחור", "לבן"], style: "מינימליסטי", image: p6,
    description: "ציור קו מינימליסטי של דמות אישה. אלגנטיות תמציתית." },
  { id: "lion-judah", name: "אריה יהודה", category: "kodesh", colors: ["זהב", "שחור"], style: "יהודי", image: p7,
    description: "אריה יהודה המפואר בזהב על רקע שחור עמוק. הוד והדר ביצירה אחת.", bestSeller: true },
  { id: "dolomites", name: "פסגות הדולומיטים", category: "premium", colors: ["ורוד", "אפור"], style: "טבע", image: p8,
    description: "פסגות אלפיניות בערפל ורוד עדין. שלווה גרנדיוזית בקנה מידה גדול." },
];

export const getProduct = (id: string) => products.find((p) => p.id === id);
