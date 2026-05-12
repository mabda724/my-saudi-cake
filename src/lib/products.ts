import p1 from "@/assets/product-1.jpg";
import p2 from "@/assets/product-2.jpg";
import p3 from "@/assets/product-3.jpg";
import p4 from "@/assets/product-4.jpg";
import p5 from "@/assets/product-5.jpg";
import p6 from "@/assets/product-6.jpg";
import p7 from "@/assets/product-7.jpg";
import p8 from "@/assets/product-8.jpg";

export interface Product {
  id: string;
  ar: { name: string; sub: string };
  en: { name: string; sub: string };
  price: number;
  category: "cakes" | "tarts" | "mini";
  image: string;
}

export const PRODUCTS: Product[] = [
  { id: "1", ar: { name: "غروب الرياض", sub: "زعفران وهيل بلمسة عصرية" }, en: { name: "Riyadh Sunset", sub: "Modern saffron & cardamom" }, price: 180, category: "cakes", image: p1 },
  { id: "2", ar: { name: "مكعب الأصالة", sub: "شوكولاتة داكنة بالتمر" }, en: { name: "Heritage Cube", sub: "Dark chocolate & dates" }, price: 210, category: "cakes", image: p2 },
  { id: "3", ar: { name: "قمر الصحراء", sub: "بيستاشيو وقرص عقيلي" }, en: { name: "Desert Moon", sub: "Pistachio & honeycomb" }, price: 230, category: "cakes", image: p3 },
  { id: "4", ar: { name: "نيون فيجن", sub: "توت أزرق وكريمة باردة" }, en: { name: "Neon Vision", sub: "Blueberry cold cream" }, price: 195, category: "cakes", image: p4 },
  { id: "5", ar: { name: "تارت التمر والفستق", sub: "خلاص فاخر وحلبي مقرمش" }, en: { name: "Date & Pistachio Tart", sub: "Premium khalas & aleppo" }, price: 145, category: "tarts", image: p5 },
  { id: "6", ar: { name: "ميني الليمون والمستكة", sub: "حامض منعش بنكهة المستكة" }, en: { name: "Lemon Mastic Mini", sub: "Refreshing citrus & mastic" }, price: 95, category: "mini", image: p6 },
  { id: "7", ar: { name: "تورتة الورد الجوري", sub: "ورد دمشقي وفانيلا" }, en: { name: "Damask Rose Torte", sub: "Damask rose & vanilla" }, price: 290, category: "cakes", image: p7 },
  { id: "8", ar: { name: "صندوق شوكولاتة الهيل", sub: "شوكولاتة بلجيكية بالقهوة العربية" }, en: { name: "Cardamom Chocolate Box", sub: "Belgian truffles + Arabic coffee" }, price: 150, category: "mini", image: p8 },
];
