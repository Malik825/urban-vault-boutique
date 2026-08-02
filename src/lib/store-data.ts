import laptopImg from "@/assets/laptop.jpg";
import phoneImg from "@/assets/phone.jpg";
import tabletImg from "@/assets/tablet.jpg";
import accessoriesImg from "@/assets/accessories.jpg";

export const STORE = {
  name: "Voltix",
  tagline: "Electronics retail, beautifully online",
  whatsapp: "+234 801 234 5678",
  whatsappRaw: "2348012345678",
  email: "hello@voltix.store",
  city: "Lagos, Nigeria",
};

export const CURRENCY = "₦";

export function formatPrice(value: number) {
  return `${CURRENCY}${value.toLocaleString("en-NG")}`;
}

export function whatsappLink(message: string) {
  return `https://wa.me/${STORE.whatsappRaw}?text=${encodeURIComponent(message)}`;
}

export type Condition = "New" | "Open box" | "Refurbished";

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  stock: number;
  condition: Condition;
  images: string[];
  status: "Published" | "Draft" | "Archived";
  badge?: "Flash deal" | "New" | "Best seller";
  views: number;
  blurb: string;
  specs: Record<string, string>;
};

export const brands = [
  { name: "Apple", products: 42, share: 34 },
  { name: "HP", products: 31, share: 19 },
  { name: "Dell", products: 27, share: 16 },
  { name: "Lenovo", products: 24, share: 13 },
  { name: "ASUS", products: 18, share: 10 },
  { name: "Samsung", products: 22, share: 8 },
];

export const categories = [
  { name: "Laptops", count: 128, image: laptopImg, blurb: "Ultrabooks, workstations, gaming" },
  { name: "Phones", count: 96, image: phoneImg, blurb: "Flagships and budget champions" },
  { name: "Tablets", count: 41, image: tabletImg, blurb: "Draw, read, work anywhere" },
  { name: "Accessories", count: 173, image: accessoriesImg, blurb: "Audio, wearables, power" },
];

const img = { Laptops: laptopImg, Phones: phoneImg, Tablets: tabletImg, Accessories: accessoriesImg };

function make(
  i: number,
  name: string,
  brand: string,
  category: keyof typeof img,
  price: number,
  compareAt: number | undefined,
  stock: number,
  condition: Condition,
  specs: Record<string, string>,
  badge?: Product["badge"],
  status: Product["status"] = "Published",
): Product {
  const cover = img[category];
  return {
    id: `PRD-${1000 + i}`,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    name,
    brand,
    category,
    price,
    compareAt,
    rating: 4 + ((i * 17) % 10) / 10,
    reviews: 12 + ((i * 37) % 180),
    stock,
    condition,
    images: [cover, img.Accessories, img.Tablets].slice(0, 3),
    status,
    badge,
    views: 400 + ((i * 733) % 5200),
    blurb:
      "Verified stock, 12-month warranty and same-day dispatch in Lagos. Enquire on WhatsApp for bulk pricing.",
    specs,
  };
}

export const products: Product[] = [
  make(1, "MacBook Pro 14 M3 Pro", "Apple", "Laptops", 2450000, 2790000, 6, "New", { RAM: "18GB", Storage: "512GB SSD", Processor: "Apple M3 Pro", "Screen Size": '14.2"', Display: "Liquid Retina XDR", Battery: "70Wh", Weight: "1.6kg", Warranty: "12 months" }, "Best seller"),
  make(2, "iPhone 15 Pro Max 256GB", "Apple", "Phones", 1590000, 1750000, 11, "New", { RAM: "8GB", Storage: "256GB", Processor: "A17 Pro", "Screen Size": '6.7"', Camera: "48MP triple", Battery: "4441mAh", Weight: "221g", Warranty: "12 months" }, "Flash deal"),
  make(3, "Dell XPS 15 9530", "Dell", "Laptops", 1780000, 1980000, 4, "New", { RAM: "16GB", Storage: "1TB SSD", Processor: "Intel Core i7-13700H", "Screen Size": '15.6"', Display: "FHD+ 500 nits", Battery: "86Wh", Weight: "1.86kg", Warranty: "12 months" }, "Flash deal"),
  make(4, "HP Spectre x360 14", "HP", "Laptops", 1290000, undefined, 9, "New", { RAM: "16GB", Storage: "512GB SSD", Processor: "Intel Core i7-1355U", "Screen Size": '13.5"', Display: "OLED touch", Battery: "66Wh", Weight: "1.34kg", Warranty: "12 months" }, "New"),
  make(5, "Lenovo ThinkPad X1 Carbon G11", "Lenovo", "Laptops", 1650000, 1820000, 3, "Open box", { RAM: "32GB", Storage: "1TB SSD", Processor: "Intel Core i7-1365U", "Screen Size": '14"', Display: "WUXGA IPS", Battery: "57Wh", Weight: "1.12kg", Warranty: "6 months" }),
  make(6, "ASUS ROG Zephyrus G14", "ASUS", "Laptops", 1990000, 2150000, 5, "New", { RAM: "16GB", Storage: "1TB SSD", Processor: "AMD Ryzen 9 7940HS", "Screen Size": '14"', GPU: "RTX 4060", Battery: "76Wh", Weight: "1.65kg", Warranty: "12 months" }, "Best seller"),
  make(7, "Samsung Galaxy S24 Ultra", "Samsung", "Phones", 1480000, 1620000, 14, "New", { RAM: "12GB", Storage: "256GB", Processor: "Snapdragon 8 Gen 3", "Screen Size": '6.8"', Camera: "200MP quad", Battery: "5000mAh", Weight: "232g", Warranty: "12 months" }, "New"),
  make(8, "iPad Pro 11 M2", "Apple", "Tablets", 1120000, 1240000, 8, "New", { RAM: "8GB", Storage: "256GB", Processor: "Apple M2", "Screen Size": '11"', Display: "Liquid Retina", Battery: "28.6Wh", Weight: "466g", Warranty: "12 months" }, "Flash deal"),
  make(9, "Galaxy Tab S9+", "Samsung", "Tablets", 890000, undefined, 0, "New", { RAM: "12GB", Storage: "256GB", Processor: "Snapdragon 8 Gen 2", "Screen Size": '12.4"', Display: "AMOLED 120Hz", Battery: "10090mAh", Weight: "581g", Warranty: "12 months" }),
  make(10, "MacBook Air 13 M2", "Apple", "Laptops", 1180000, 1320000, 12, "Refurbished", { RAM: "8GB", Storage: "256GB SSD", Processor: "Apple M2", "Screen Size": '13.6"', Display: "Liquid Retina", Battery: "52.6Wh", Weight: "1.24kg", Warranty: "6 months" }, "Best seller"),
  make(11, "HP EliteBook 840 G10", "HP", "Laptops", 980000, 1090000, 7, "Open box", { RAM: "16GB", Storage: "512GB SSD", Processor: "Intel Core i5-1335U", "Screen Size": '14"', Display: "WUXGA", Battery: "51Wh", Weight: "1.36kg", Warranty: "6 months" }),
  make(12, "Sony WH-1000XM5", "Samsung", "Accessories", 385000, 430000, 22, "New", { Type: "Over-ear ANC", Battery: "30 hours", Connectivity: "Bluetooth 5.2", Weight: "250g", Warranty: "12 months" }, "Flash deal"),
  make(13, "Apple Watch Series 9 45mm", "Apple", "Accessories", 520000, undefined, 16, "New", { Display: "Always-on Retina", Battery: "18 hours", Connectivity: "GPS + Cellular", Weight: "51g", Warranty: "12 months" }, "New"),
  make(14, "Lenovo Yoga Slim 7i", "Lenovo", "Laptops", 860000, 940000, 2, "New", { RAM: "16GB", Storage: "512GB SSD", Processor: "Intel Core i5-1340P", "Screen Size": '14"', Display: "2.8K OLED", Battery: "61Wh", Weight: "1.4kg", Warranty: "12 months" }),
  make(15, "ASUS Zenbook 14 OLED", "ASUS", "Laptops", 920000, undefined, 5, "New", { RAM: "16GB", Storage: "1TB SSD", Processor: "AMD Ryzen 7 7730U", "Screen Size": '14"', Display: "2.8K OLED", Battery: "75Wh", Weight: "1.39kg", Warranty: "12 months" }, undefined, "Draft"),
  make(16, "Google Pixel 8 Pro", "Samsung", "Phones", 1180000, 1290000, 6, "New", { RAM: "12GB", Storage: "256GB", Processor: "Tensor G3", "Screen Size": '6.7"', Camera: "50MP triple", Battery: "5050mAh", Weight: "213g", Warranty: "12 months" }),
  make(17, "iPhone 13 128GB", "Apple", "Phones", 690000, 780000, 18, "Refurbished", { RAM: "4GB", Storage: "128GB", Processor: "A15 Bionic", "Screen Size": '6.1"', Camera: "12MP dual", Battery: "3240mAh", Weight: "174g", Warranty: "6 months" }, "Best seller"),
  make(18, "Dell Latitude 5440", "Dell", "Laptops", 740000, undefined, 0, "Open box", { RAM: "8GB", Storage: "256GB SSD", Processor: "Intel Core i5-1345U", "Screen Size": '14"', Display: "FHD", Battery: "54Wh", Weight: "1.48kg", Warranty: "6 months" }, undefined, "Archived"),
];

export const filterOptions = {
  brand: brands.map((b) => b.name),
  category: categories.map((c) => c.name),
  condition: ["New", "Open box", "Refurbished"],
  ram: ["4GB", "8GB", "12GB", "16GB", "18GB", "32GB"],
  storage: ["128GB", "256GB", "512GB SSD", "256GB SSD", "1TB SSD"],
  processor: ["Apple M2", "Apple M3 Pro", "Intel Core i5", "Intel Core i7", "AMD Ryzen 7", "AMD Ryzen 9", "Snapdragon"],
  screen: ['6.1"', '6.7"', '6.8"', '11"', '13.6"', '14"', '15.6"'],
};

export const popularSearches = [
  "MacBook Pro",
  "iPhone 15",
  "Gaming laptop",
  "Refurbished laptops",
  "Galaxy S24",
  "Noise cancelling",
];

export const reviews = [
  {
    name: "Amaka Obi",
    role: "Product designer, Lagos",
    text: "I compared four stores and Voltix was the only one that showed real stock levels. Enquired on WhatsApp at 9pm and had the MacBook by noon.",
    rating: 5,
  },
  {
    name: "Tunde Bakare",
    role: "IT lead, Fintech startup",
    text: "Bought 14 ThinkPads for our new team. Specs on the listing matched exactly what arrived, invoices were clean, zero back-and-forth.",
    rating: 5,
  },
  {
    name: "Grace Mensah",
    role: "Student, Accra",
    text: "The refurbished iPhone looked brand new. The filters made it easy to stay inside my budget without endless scrolling.",
    rating: 4.5,
  },
];

/* ---------- Dashboard data ---------- */

export const revenueSeries = [
  { month: "Feb", revenue: 4.2, orders: 68 },
  { month: "Mar", revenue: 5.1, orders: 81 },
  { month: "Apr", revenue: 4.8, orders: 76 },
  { month: "May", revenue: 6.4, orders: 98 },
  { month: "Jun", revenue: 7.9, orders: 121 },
  { month: "Jul", revenue: 9.6, orders: 143 },
  { month: "Aug", revenue: 11.2, orders: 167 },
];

export const trafficSeries = [
  { day: "Mon", visitors: 820, enquiries: 41 },
  { day: "Tue", visitors: 940, enquiries: 52 },
  { day: "Wed", visitors: 1120, enquiries: 63 },
  { day: "Thu", visitors: 1040, enquiries: 58 },
  { day: "Fri", visitors: 1380, enquiries: 79 },
  { day: "Sat", visitors: 1620, enquiries: 94 },
  { day: "Sun", visitors: 1210, enquiries: 66 },
];

export const activity = [
  { who: "Amaka Obi", what: "sent a WhatsApp enquiry for MacBook Pro 14 M3 Pro", when: "2 min ago", kind: "enquiry" },
  { who: "Order #4821", what: "marked as shipped to Victoria Island", when: "26 min ago", kind: "order" },
  { who: "Tunde Bakare", what: "added Galaxy S24 Ultra to wishlist", when: "1 hr ago", kind: "wishlist" },
  { who: "iPad Pro 11 M2", what: "stock dropped below 10 units", when: "3 hrs ago", kind: "stock" },
  { who: "Order #4818", what: "payment confirmed — ₦1,590,000", when: "5 hrs ago", kind: "payment" },
];

export const orders = [
  { id: "#4821", customer: "Amaka Obi", item: "MacBook Pro 14 M3 Pro", total: 2450000, status: "Shipped", date: "Aug 1" },
  { id: "#4820", customer: "Tunde Bakare", item: "ThinkPad X1 Carbon ×4", total: 6600000, status: "Processing", date: "Aug 1" },
  { id: "#4819", customer: "Grace Mensah", item: "iPhone 13 128GB", total: 690000, status: "Delivered", date: "Jul 31" },
  { id: "#4818", customer: "Chidi Okeke", item: "iPhone 15 Pro Max", total: 1590000, status: "Paid", date: "Jul 31" },
  { id: "#4817", customer: "Fatima Sule", item: "Sony WH-1000XM5 ×2", total: 770000, status: "Pending", date: "Jul 30" },
  { id: "#4816", customer: "Emeka Nwosu", item: "Dell XPS 15 9530", total: 1780000, status: "Cancelled", date: "Jul 29" },
];

export const customers = [
  { name: "Amaka Obi", email: "amaka@studio.co", city: "Lagos", orders: 4, spend: 5240000, enquiries: 7, wishlist: 3 },
  { name: "Tunde Bakare", email: "tunde@paystack.dev", city: "Lagos", orders: 2, spend: 8100000, enquiries: 3, wishlist: 1 },
  { name: "Grace Mensah", email: "grace.m@gmail.com", city: "Accra", orders: 3, spend: 1420000, enquiries: 5, wishlist: 6 },
  { name: "Chidi Okeke", email: "chidi.okeke@outlook.com", city: "Abuja", orders: 1, spend: 1590000, enquiries: 2, wishlist: 2 },
  { name: "Fatima Sule", email: "fatima@sule.ng", city: "Kano", orders: 5, spend: 2890000, enquiries: 9, wishlist: 4 },
];

export const searchTerms = [
  { term: "macbook pro", count: 1284, trend: 18 },
  { term: "iphone 15 pro max", count: 1103, trend: 24 },
  { term: "gaming laptop", count: 872, trend: -6 },
  { term: "refurbished iphone", count: 741, trend: 31 },
  { term: "galaxy s24", count: 690, trend: 12 },
  { term: "16gb ram laptop", count: 512, trend: 4 },
];
