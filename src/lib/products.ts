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

export type CategoryId = "modern" | "landscape" | "abstract" | "kodesh" | "custom";

export const categories: { id: CategoryId; name: string; tagline: string; image: string }[] = [
  { id: "modern", name: "אמנות מודרנית", tagline: "קווים נקיים ועוצמה עכשווית", image: catModern },
  { id: "landscape", name: "נופים", tagline: "טבע שעוצר את הנשימה", image: catLandscape },
  { id: "abstract", name: "אבסטרקט", tagline: "צבע, תנועה ורגש", image: catAbstract },
  { id: "kodesh", name: "אמנות יהודית וקודש", tagline: "מורשת בעיצוב יוקרתי", image: catKodesh },
  { id: "custom", name: "הדפסה בעיצוב אישי", tagline: "התמונה שלך, ברמת גימור גלריה", image: catCustom },
];

export type Size = { id: string; label: string; price: number };

export const SIZES: Size[] = [
  { id: "s", label: "60×90 ס\"מ", price: 0 },
  { id: "m", label: "80×120 ס\"מ", price: 280 },
  { id: "l", label: "100×150 ס\"מ", price: 540 },
  { id: "xl", label: "120×180 ס\"מ", price: 880 },
];

export type Product = {
  id: string;
  name: string;
  category: CategoryId;
  basePrice: number;
  colors: string[];
  style: string;
  image: string;
  description: string;
  bestSeller?: boolean;
};

export const products: Product[] = [
  { id: "golden-leaves", name: "עלי זהב", category: "modern", basePrice: 690, colors: ["זהב", "קרם"], style: "בוטני", image: p1,
    description: "יצירת אמנות בוטנית עדינה בגווני זהב חמים על רקע קרם. מוסיפה אור ונוכחות שקטה לכל חלל.", bestSeller: true },
  { id: "noir-circle", name: "מעגל נואר", category: "modern", basePrice: 720, colors: ["שחור", "זהב"], style: "מינימליסטי", image: p2,
    description: "קומפוזיציה מינימליסטית בשחור עם מסגרת זהב. אמירה עיצובית חדה ובוטחת.", bestSeller: true },
  { id: "kotel-doves", name: "הכותל ויונים", category: "kodesh", basePrice: 850, colors: ["זהב", "תכלת"], style: "יהודי", image: p3,
    description: "הכותל המערבי באור בוקר, יונים מרחפות. חיבור עמוק לירושלים ולמורשת.", bestSeller: true },
  { id: "ocean-rose", name: "גל הזריחה", category: "landscape", basePrice: 780, colors: ["כתום", "ורוד", "כחול"], style: "טבע", image: p4,
    description: "גל אוקיינוס בזריחה ורודה. תנועה, אור והשתקפויות שמחיים את החלל." },
  { id: "marble-rose", name: "שיש ורוד וזהב", category: "abstract", basePrice: 690, colors: ["ורוד", "זהב"], style: "אבסטרקט", image: p5,
    description: "טקסטורת שיש בגווני ורוד ענוג עם זרימות זהב. יוקרה רכה ונשית.", bestSeller: true },
  { id: "femme-line", name: "פורטרט קו", category: "modern", basePrice: 640, colors: ["שחור", "לבן"], style: "מינימליסטי", image: p6,
    description: "ציור קו מינימליסטי של דמות אישה. אלגנטיות תמציתית." },
  { id: "lion-judah", name: "אריה יהודה", category: "kodesh", basePrice: 920, colors: ["זהב", "שחור"], style: "יהודי", image: p7,
    description: "אריה יהודה המפואר בזהב על רקע שחור עמוק. הוד והדר ביצירה אחת.", bestSeller: true },
  { id: "dolomites", name: "פסגות הדולומיטים", category: "landscape", basePrice: 760, colors: ["ורוד", "אפור"], style: "טבע", image: p8,
    description: "פסגות אלפיניות בערפל ורוד עדין. שלווה גרנדיוזית." },
];

export const getProduct = (id: string) => products.find((p) => p.id === id);
