import laptopImg from "@/assets/laptop.jpg";
import phoneImg from "@/assets/phone.jpg";
import tabletImg from "@/assets/tablet.jpg";
import accessoriesImg from "@/assets/accessories.jpg";

export const STORE = {
  name: "GadgetHaus",
  secondaryName: "Voltix Tech",
  tagline: "Modern online shopping for electronics and technology",
  whatsapp: "+233 25 782 5866",
  whatsappRaw: "233257825866",
  email: "hello@gadgethaus.store",
  city: "Accra, Ghana",
  address: "Osu, Ringway Estates, Accra",
  pickupLocation: "GadgetHaus Hub, Oxford Street, Osu, Accra",
  currencyCode: "GHS",
  currencySymbol: "GH₵",
};

export const CURRENCY = STORE.currencySymbol;

export function formatPrice(value: number) {
  return `${CURRENCY} ${value.toLocaleString("en-GH")}`;
}

export function whatsappLink(message: string) {
  return `https://wa.me/${STORE.whatsappRaw}?text=${encodeURIComponent(message)}`;
}

/** Pre-filled WhatsApp message for product enquiries */
export function createProductEnquiry(product: { name: string; price: number; slug?: string; id?: string }) {
  const url = typeof window !== "undefined" && window.location.origin
    ? `${window.location.origin}/product/${product.slug || product.id}`
    : `https://gadgethaus.store/product/${product.slug || product.id}`;
  return `Hello, I'm interested in the ${product.name} listed at ${formatPrice(product.price)}. Is it available? View link: ${url}`;
}

/** Pre-filled WhatsApp message for entire cart checkout */
export function createCartWhatsAppMessage(
  items: Array<{ product: { name: string; price: number; condition?: string }; qty: number }>,
  subtotal: number,
  deliveryArea: string = "Accra, Ghana"
) {
  let text = `Hello ${STORE.name}! I would like to place an order for the following items:\n\n`;
  items.forEach((item, index) => {
    text += `${index + 1}. *${item.product.name}* (${item.product.condition || "Verified"}) × ${item.qty} = ${formatPrice(item.product.price * item.qty)}\n`;
  });
  text += `\n*Cart Subtotal:* ${formatPrice(subtotal)}`;
  text += `\n*Delivery Location:* ${deliveryArea}`;
  text += `\n\nPlease confirm device availability, delivery fee, and payment instructions.`;
  return text;
}

export type Condition = "New" | "Open box" | "Refurbished";

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  compareAt?: number | undefined;
  rating: number;
  reviews: number;
  stock: number;
  condition: Condition;
  images: string[];
  status: "Published" | "Draft" | "Archived";
  badge?: "Flash deal" | "New" | "Best seller" | undefined;
  views: number;
  blurb: string;
  specs: Record<string, string>;
};

export const GHANA_REGIONS = [
  { name: "Greater Accra", deliveryFee: 40, eta: "Same-day / 24 hours" },
  { name: "Ashanti (Kumasi)", deliveryFee: 65, eta: "24–48 hours" },
  { name: "Central (Cape Coast / Kasoa)", deliveryFee: 55, eta: "24–48 hours" },
  { name: "Western (Takoradi)", deliveryFee: 70, eta: "48 hours" },
  { name: "Eastern (Koforidua)", deliveryFee: 55, eta: "24–48 hours" },
  { name: "Northern (Tamale)", deliveryFee: 85, eta: "2–3 days" },
  { name: "Volta (Ho)", deliveryFee: 65, eta: "24–48 hours" },
  { name: "Bono (Sunyani)", deliveryFee: 75, eta: "2–3 days" },
  { name: "Upper East (Bolgatanga)", deliveryFee: 90, eta: "3–4 days" },
  { name: "Upper West (Wa)", deliveryFee: 90, eta: "3–4 days" },
  { name: "Oti", deliveryFee: 75, eta: "2–3 days" },
  { name: "Bono East (Techiman)", deliveryFee: 75, eta: "2–3 days" },
  { name: "Ahafo", deliveryFee: 75, eta: "2–3 days" },
  { name: "North East", deliveryFee: 90, eta: "3–4 days" },
  { name: "Savannah", deliveryFee: 90, eta: "3–4 days" },
  { name: "Western North", deliveryFee: 75, eta: "2–3 days" },
];

export const brands = [
  { name: "Apple", products: 42, share: 34 },
  { name: "HP", products: 31, share: 19 },
  { name: "Dell", products: 27, share: 16 },
  { name: "Lenovo", products: 24, share: 13 },
  { name: "Samsung", products: 22, share: 8 },
  { name: "ASUS", products: 18, share: 10 },
  { name: "Sony", products: 14, share: 7 },
  { name: "Google", products: 10, share: 5 },
];

export const categories = [
  { name: "Smartphones", count: 96, image: phoneImg, blurb: "Flagship and budget devices" },
  { name: "Laptops", count: 128, image: laptopImg, blurb: "Ultrabooks, workstations & business PCs" },
  { name: "Tablets", count: 41, image: tabletImg, blurb: "Productivity, reading and creative slates" },
  { name: "Smartwatches", count: 32, image: accessoriesImg, blurb: "Health tracking & cellular wearables" },
  { name: "Audio", count: 48, image: accessoriesImg, blurb: "Wireless noise-cancelling headphones" },
  { name: "Gaming", count: 26, image: laptopImg, blurb: "Consoles, high-refresh displays & rigs" },
  { name: "Accessories", count: 173, image: accessoriesImg, blurb: "Fast chargers, cables & protective sleeves" },
  { name: "Networking", count: 19, image: laptopImg, blurb: "4G/5G mobile WiFi routers & switches" },
  { name: "Computer Accessories", count: 54, image: accessoriesImg, blurb: "Keyboards, mice & USB-C docks" },
];

const img = {
  Smartphones: phoneImg,
  Phones: phoneImg,
  Laptops: laptopImg,
  Tablets: tabletImg,
  Smartwatches: accessoriesImg,
  Audio: accessoriesImg,
  Gaming: laptopImg,
  Accessories: accessoriesImg,
  Networking: laptopImg,
  "Computer Accessories": accessoriesImg,
};

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
  badge?: Product["badge"] | undefined,
  status: Product["status"] = "Published"
): Product {
  const cover = img[category] ?? laptopImg;
  return {
    id: `PRD-${1000 + i}`,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    name,
    brand,
    category,
    price,
    compareAt,
    rating: 4.5 + ((i * 13) % 5) / 10,
    reviews: 8 + ((i * 17) % 35),
    stock,
    condition,
    images: [cover, accessoriesImg, tabletImg].slice(0, 3),
    status,
    badge,
    views: 320 + ((i * 411) % 2400),
    blurb:
      "Verified specs, honest condition grading, 12-month warranty support. Enquire directly on WhatsApp for instant confirmation or bulk quotes.",
    specs,
  };
}

export const products: Product[] = [
  make(1, "MacBook Pro 14 M3 Pro", "Apple", "Laptops", 24499, 27900, 6, "New", { RAM: "18GB", Storage: "512GB SSD", Processor: "Apple M3 Pro", "Screen Size": '14.2"', Display: "Liquid Retina XDR", Battery: "70Wh", Weight: "1.6kg", Warranty: "12 months" }, "Best seller"),
  make(2, "iPhone 15 Pro Max 256GB", "Apple", "Smartphones", 15499, 17500, 11, "New", { RAM: "8GB", Storage: "256GB", Processor: "A17 Pro", "Screen Size": '6.7"', Camera: "48MP triple", Battery: "4441mAh", Weight: "221g", Warranty: "12 months" }, "Flash deal"),
  make(3, "Dell XPS 15 9530 Core i7", "Dell", "Laptops", 17999, 19800, 4, "New", { RAM: "16GB", Storage: "1TB SSD", Processor: "Intel Core i7-13700H", "Screen Size": '15.6"', Display: "FHD+ 500 nits", Battery: "86Wh", Weight: "1.86kg", Warranty: "12 months" }, "Flash deal"),
  make(4, "HP Spectre x360 14 2-in-1", "HP", "Laptops", 12499, undefined, 9, "New", { RAM: "16GB", Storage: "512GB SSD", Processor: "Intel Core i7-1355U", "Screen Size": '13.5"', Display: "OLED touch", Battery: "66Wh", Weight: "1.34kg", Warranty: "12 months" }, "New"),
  make(5, "Lenovo ThinkPad X1 Carbon Gen 11", "Lenovo", "Laptops", 16500, 18200, 5, "Open box", { RAM: "32GB", Storage: "1TB SSD", Processor: "Intel Core i7-1365U", "Screen Size": '14"', Display: "WUXGA IPS", Battery: "57Wh", Weight: "1.12kg", Warranty: "6 months" }),
  make(6, "ASUS ROG Zephyrus G14 RTX 4060", "ASUS", "Gaming", 19499, 21500, 5, "New", { RAM: "16GB", Storage: "1TB SSD", Processor: "AMD Ryzen 9 7940HS", "Screen Size": '14"', GPU: "RTX 4060", Battery: "76Wh", Weight: "1.65kg", Warranty: "12 months" }, "Best seller"),
  make(7, "Samsung Galaxy S24 Ultra 512GB", "Samsung", "Smartphones", 14999, 16500, 14, "New", { RAM: "12GB", Storage: "512GB", Processor: "Snapdragon 8 Gen 3", "Screen Size": '6.8"', Camera: "200MP quad", Battery: "5000mAh", Weight: "232g", Warranty: "12 months" }, "New"),
  make(8, "iPad Pro 11-inch M2 256GB WiFi", "Apple", "Tablets", 11200, 12400, 8, "New", { RAM: "8GB", Storage: "256GB", Processor: "Apple M2", "Screen Size": '11"', Display: "Liquid Retina", Battery: "28.6Wh", Weight: "466g", Warranty: "12 months" }, "Flash deal"),
  make(9, "Samsung Galaxy Tab S9+ 5G", "Samsung", "Tablets", 8900, 9800, 7, "New", { RAM: "12GB", Storage: "256GB", Processor: "Snapdragon 8 Gen 2", "Screen Size": '12.4"', Display: "AMOLED 120Hz", Battery: "10090mAh", Weight: "581g", Warranty: "12 months" }),
  make(10, "MacBook Air 13 M2 8GB/256GB", "Apple", "Laptops", 11499, 12900, 12, "Refurbished", { RAM: "8GB", Storage: "256GB SSD", Processor: "Apple M2", "Screen Size": '13.6"', Display: "Liquid Retina", Battery: "52.6Wh", Weight: "1.24kg", Warranty: "6 months" }, "Best seller"),
  make(11, "HP EliteBook 840 G10 Business", "HP", "Laptops", 8500, 9800, 7, "Open box", { RAM: "16GB", Storage: "512GB SSD", Processor: "Intel Core i5-1335U", "Screen Size": '14"', Display: "WUXGA", Battery: "51Wh", Weight: "1.36kg", Warranty: "6 months" }),
  make(12, "Sony WH-1000XM5 ANC Headphones", "Sony", "Audio", 3850, 4300, 22, "New", { Type: "Over-ear ANC", Battery: "30 hours", Connectivity: "Bluetooth 5.2", Weight: "250g", Warranty: "12 months" }, "Flash deal"),
  make(13, "Apple Watch Series 9 45mm GPS", "Apple", "Smartwatches", 4999, 5600, 16, "New", { Display: "Always-on Retina", Battery: "18 hours", Connectivity: "GPS + Bluetooth", Weight: "51g", Warranty: "12 months" }, "New"),
  make(14, "Lenovo Yoga Slim 7i EVO", "Lenovo", "Laptops", 8600, 9400, 4, "New", { RAM: "16GB", Storage: "512GB SSD", Processor: "Intel Core i5-1340P", "Screen Size": '14"', Display: "2.8K OLED", Battery: "61Wh", Weight: "1.4kg", Warranty: "12 months" }),
  make(15, "Google Pixel 8 Pro 128GB", "Google", "Smartphones", 9999, 11500, 6, "New", { RAM: "12GB", Storage: "128GB", Processor: "Tensor G3", "Screen Size": '6.7"', Camera: "50MP triple", Battery: "5050mAh", Weight: "213g", Warranty: "12 months" }),
  make(16, "iPhone 13 128GB Midnight", "Apple", "Smartphones", 5499, 6500, 18, "Refurbished", { RAM: "4GB", Storage: "128GB", Processor: "A15 Bionic", "Screen Size": '6.1"', Camera: "12MP dual", Battery: "3240mAh", Weight: "174g", Warranty: "6 months" }, "Best seller"),
  make(17, "Huawei 5G Mobile WiFi Pro Router", "Huawei", "Networking", 1850, 2200, 15, "New", { Connectivity: "5G / 4G LTE SIM", Battery: "8000mAh Powerbank", Speed: "Up to 1.65 Gbps", Devices: "Up to 32 users" }),
  make(18, "Logitech MX Master 3S Wireless Mouse", "Logitech", "Computer Accessories", 1450, 1700, 20, "New", { Connectivity: "Bluetooth + Logi Bolt", Sensor: "8000 DPI Darkfield", Battery: "70 days per charge" }),
  make(19, "Anker 737 Power Bank 24,000mAh 140W", "Accessories", "Accessories", 1850, 2100, 25, "New", { Capacity: "24,000mAh", Output: "140W Dual USB-C", Display: "Smart Digital Screen", Warranty: "12 months" }),
  make(20, "Samsung Galaxy Watch 6 Classic 47mm", "Samsung", "Smartwatches", 3999, 4500, 10, "New", { Display: "Super AMOLED", Battery: "425mAh", Health: "ECG, BIA, Blood Pressure", Warranty: "12 months" }),
];

export const filterOptions = {
  brand: brands.map((b) => b.name),
  category: categories.map((c) => c.name),
  condition: ["New", "Open box", "Refurbished"],
  ram: ["4GB", "8GB", "12GB", "16GB", "18GB", "32GB"],
  storage: ["128GB", "256GB", "512GB", "512GB SSD", "1TB SSD"],
  processor: ["Apple M2", "Apple M3 Pro", "Intel Core i5", "Intel Core i7", "AMD Ryzen 9", "Snapdragon", "A17 Pro", "Tensor G3"],
  screen: ['6.1"', '6.7"', '6.8"', '11"', '13.5"', '14"', '14.2"', '15.6"'],
};

export const popularSearches = [
  "MacBook Pro M3",
  "iPhone 15 Pro",
  "Gaming laptop",
  "Refurbished laptops",
  "Galaxy S24 Ultra",
  "Sony WH-1000XM5",
  "Smartwatch",
  "Fast charger",
];

export const reviews = [
  {
    name: "Kwesi Appiah",
    role: "Tech Lead, Accra",
    text: "Filtered down to an open-box ThinkPad, tapped the WhatsApp button to enquire, and had instant answers. This is exactly the kind of seamless experience retail customers in Ghana deserve.",
    rating: 5,
  },
  {
    name: "Akosua Mensah",
    role: "Creative Director, Osu",
    text: "Instead of DMing back and forth on Instagram asking 'how much?', I got transparent GH₵ pricing, full specifications, and mobile money options upfront. Buying was completely seamless.",
    rating: 5,
  },
  {
    name: "Emmanuel Osei",
    role: "Logistics Manager, Kumasi",
    text: "The regional delivery options with clear turnaround times and order tracking via WhatsApp gave me total confidence before making payment. Highly recommended.",
    rating: 5,
  },
];

/* ---------- Dashboard analytics demo data ---------- */

export const revenueSeries = [
  { month: "Feb", revenue: 42000, orders: 68 },
  { month: "Mar", revenue: 51000, orders: 81 },
  { month: "Apr", revenue: 48000, orders: 76 },
  { month: "May", revenue: 64000, orders: 98 },
  { month: "Jun", revenue: 79000, orders: 121 },
  { month: "Jul", revenue: 96000, orders: 143 },
  { month: "Aug", revenue: 112000, orders: 167 },
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

export const searchTerms = [
  { term: "macbook pro m3", count: 1284, trend: 18 },
  { term: "iphone 15 pro max", count: 1103, trend: 24 },
  { term: "gaming laptop rtx", count: 872, trend: -6 },
  { term: "refurbished laptops accra", count: 741, trend: 31 },
  { term: "galaxy s24 ultra", count: 690, trend: 12 },
  { term: "16gb ram laptop", count: 512, trend: 4 },
];

export const activity = [
  { who: "Kwesi Appiah", what: "sent a WhatsApp enquiry for MacBook Pro 14 M3 Pro", when: "2 min ago", kind: "enquiry" },
  { who: "Order #GH-4821", what: "marked as dispatched to Kumasi", when: "26 min ago", kind: "order" },
  { who: "Akosua Mensah", what: "added Galaxy S24 Ultra to wishlist", when: "1 hr ago", kind: "wishlist" },
  { who: "iPad Pro 11 M2", what: "stock alert: 8 units remaining", when: "3 hrs ago", kind: "stock" },
  { who: "Order #GH-4818", what: "payment confirmed via MTN MoMo — GH₵ 15,499", when: "5 hrs ago", kind: "payment" },
];

export const orders = [
  { id: "#GH-4821", customer: "Kwesi Appiah", item: "MacBook Pro 14 M3 Pro", total: 24499, status: "Shipped", date: "Aug 1" },
  { id: "#GH-4820", customer: "Tunde Bakare", item: "ThinkPad X1 Carbon ×4", total: 66000, status: "Processing", date: "Aug 1" },
  { id: "#GH-4819", customer: "Grace Mensah", item: "iPhone 13 128GB", total: 5499, status: "Delivered", date: "Jul 31" },
  { id: "#GH-4818", customer: "Kojo Boateng", item: "iPhone 15 Pro Max", total: 15499, status: "Paid", date: "Jul 31" },
  { id: "#GH-4817", customer: "Fatima Sule", item: "Sony WH-1000XM5 ×2", total: 7700, status: "Pending", date: "Jul 30" },
  { id: "#GH-4816", customer: "Emeka Nwosu", item: "Dell XPS 15 9530", total: 17999, status: "Cancelled", date: "Jul 29" },
];

export const customers = [
  { name: "Kwesi Appiah", email: "kwesi@studio.com", city: "Accra", orders: 4, spend: 52400, enquiries: 7, wishlist: 3 },
  { name: "Tunde Bakare", email: "tunde@paystack.dev", city: "Accra", orders: 2, spend: 81000, enquiries: 3, wishlist: 1 },
  { name: "Grace Mensah", email: "grace.m@gmail.com", city: "Kumasi", orders: 3, spend: 14200, enquiries: 5, wishlist: 6 },
  { name: "Kojo Boateng", email: "kojo.b@outlook.com", city: "Takoradi", orders: 1, spend: 15499, enquiries: 2, wishlist: 2 },
  { name: "Fatima Sule", email: "fatima@sule.com", city: "Tamale", orders: 5, spend: 28900, enquiries: 9, wishlist: 4 },
];
