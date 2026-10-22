import { ACTIVE_STORE } from "@/config/store.config";

export const STORE = {
  name: ACTIVE_STORE.name,
  secondaryName: ACTIVE_STORE.displayName,
  tagline: ACTIVE_STORE.tagline,
  siteUrl: ACTIVE_STORE.siteUrl,
  whatsapp: ACTIVE_STORE.whatsapp,
  whatsappRaw: ACTIVE_STORE.whatsappRaw,
  email: ACTIVE_STORE.email,
  city: ACTIVE_STORE.city,
  address: ACTIVE_STORE.address,
  pickupLocation: ACTIVE_STORE.pickupLocation,
  currencyCode: ACTIVE_STORE.currencyCode,
  currencySymbol: ACTIVE_STORE.currencySymbol,
  logoUrl: ACTIVE_STORE.logoUrl,
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
    : `https://urbanvaultgh.com/product/${product.slug || product.id}`;
  return `Hello Urban Vault! I'm interested in the *${product.name}* (${formatPrice(product.price)}). Is this available in my size? View item: ${url}`;
}

/** Pre-filled WhatsApp message for entire cart checkout */
export function createCartWhatsAppMessage(
  items: Array<{ product: { name: string; price: number; condition?: string }; qty: number }>,
  subtotal: number,
  deliveryArea: string = "Accra, Ghana"
) {
  let text = `Hello ${STORE.name}! I would like to place an order for the following boutique items:\n\n`;
  items.forEach((item, index) => {
    text += `${index + 1}. *${item.product.name}* × ${item.qty} = ${formatPrice(item.product.price * item.qty)}\n`;
  });
  text += `\n*Order Subtotal:* ${formatPrice(subtotal)}`;
  text += `\n*Delivery Location:* ${deliveryArea}`;
  text += `\n\nPlease confirm size availability, delivery dispatch time, and payment instructions.`;
  return text;
}

export type Condition = "New" | "Limited Edition" | "Deadstock" | "Open box" | "Refurbished";

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
  { name: "Greater Accra (Within Accra)", deliveryFee: 35, eta: "Same-day (2–6 hours)" },
  { name: "Greater Accra (Tema / Kasoa)", deliveryFee: 45, eta: "Same-day / 24 hours" },
  { name: "Ashanti (Kumasi)", deliveryFee: 60, eta: "Next-day / 24–48 hours" },
  { name: "Central (Cape Coast / Winneba)", deliveryFee: 50, eta: "24–48 hours" },
  { name: "Western (Takoradi / Tarkwa)", deliveryFee: 65, eta: "24–48 hours" },
  { name: "Eastern (Koforidua)", deliveryFee: 50, eta: "24–48 hours" },
  { name: "Northern (Tamale)", deliveryFee: 75, eta: "2–3 days via VIP / FedEx" },
  { name: "Volta (Ho / Aflao)", deliveryFee: 55, eta: "24–48 hours" },
  { name: "Bono (Sunyani)", deliveryFee: 65, eta: "2–3 days" },
  { name: "Upper East (Bolgatanga)", deliveryFee: 80, eta: "2–3 days" },
  { name: "Upper West (Wa)", deliveryFee: 80, eta: "2–3 days" },
];

export const brands = [
  { name: "Urban Vault Co.", products: 48, share: 36 },
  { name: "Essentials FOG", products: 28, share: 22 },
  { name: "Represent Clo", products: 19, share: 15 },
  { name: "Nike Sportswear", products: 24, share: 18 },
  { name: "Daily Paper", products: 15, share: 12 },
  { name: "Trapstar London", products: 12, share: 10 },
  { name: "Zara Exclusive", products: 16, share: 11 },
];

export const DEPARTMENTS = ["All", "Men", "Women", "Unisex"] as const;
export type Department = (typeof DEPARTMENTS)[number];

export interface CategoryTaxonomy {
  id: string;
  name: string;
  department: "Men" | "Women" | "Unisex" | "All";
  image: string;
  blurb: string;
  count: number;
  subcategories: string[];
}

export const CATEGORIES_TAXONOMY: CategoryTaxonomy[] = [
  {
    id: "tops-shirts",
    name: "Tops & Shirts",
    department: "All",
    image: "/boutique/category_shirts_1792394774964.webp",
    blurb: "Heavyweight boxy tees, polo shirts, Cuban linen & long-sleeve luxury button-downs",
    count: 64,
    subcategories: [
      "T-shirts",
      "Polo shirts",
      "Shirts (long sleeve)",
      "Shirts (short sleeve)",
      "Hoodies & Sweatshirts",
      "Basic tops & Singlets",
    ],
  },
  {
    id: "african-traditional",
    name: "African & Traditional Wear",
    department: "All",
    image: "https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=800&q=80",
    blurb: "Handcrafted Asante-made clothing, luxury men's kaftan sets, Ankara fashion & two-piece sets",
    count: 38,
    subcategories: [
      "Men's kaftan sets",
      "Kaftans",
      "Asante-made clothing",
      "Traditional wear",
      "African wear",
      "Ankara clothings",
      "Top and down wear (two-piece sets)",
    ],
  },
  {
    id: "bottoms-trousers",
    name: "Bottoms & Trousers",
    department: "All",
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80",
    blurb: "Vintage wash denim jeans, heavyweight fleece joggers, cargo pants & loungewear",
    count: 45,
    subcategories: ["Jeans", "Joggers", "Skirts", "Boxers", "Underwear"],
  },
  {
    id: "dresses-skirts",
    name: "Dresses & Skirts",
    department: "Women",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
    blurb: "Straight dresses, mini dresses, high-waist skirts & chic statement pieces",
    count: 29,
    subcategories: ["Straight dresses", "Mini dresses", "Skirts", "Shein / unbranded", "Official wears"],
  },
  {
    id: "suits-tailoring",
    name: "Suits & Tailoring",
    department: "All",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
    blurb: "Bespoke wedding suits, executive official wear, blazers & premium leather jackets",
    count: 22,
    subcategories: [
      "Wedding suits",
      "Official wears",
      "Jackets",
      "Leather jackets",
      "Top and down wear (two-piece sets)",
    ],
  },
  {
    id: "footwear",
    name: "Footwear",
    department: "All",
    image: "/boutique/category_footwear_1792394799875.webp",
    blurb: "Designer sneakers, classic leather dress shoes, heels, slippers & traditional sandals",
    count: 56,
    subcategories: [
      "Sneakers",
      "Heels",
      "Leather shoes",
      "Sandals",
      "Men's traditional sandals",
      "Slippers",
      "Sports shoes",
      "Socks",
    ],
  },
  {
    id: "bags-luggage",
    name: "Bags & Luggage",
    department: "All",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
    blurb: "Structured crossbody bags, luxury tote bags, clutches, purses & weekend travel bags",
    count: 34,
    subcategories: [
      "Tote bags",
      "Crossbody bags",
      "Corporate bags",
      "Clutch bags",
      "Mini bags",
      "Purse",
      "Travel bags",
      "Shoe bags",
    ],
  },
  {
    id: "jewelry-timepieces",
    name: "Jewelry & Timepieces",
    department: "All",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
    blurb: "Luxury stainless & gold timepieces, cuban chain necklaces, bracelets, bangles & rings",
    count: 48,
    subcategories: [
      "Watches",
      "Necklaces",
      "Bracelets",
      "Bangles",
      "Mini bangles",
      "Rings",
      "Earrings",
    ],
  },
  {
    id: "accessories-headwear",
    name: "Accessories & Headwear",
    department: "All",
    image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80",
    blurb: "UV-protected shades, leather belts, slim wallets, vintage caps, hats, ties & bow ties",
    count: 40,
    subcategories: [
      "Sunglasses / Shades",
      "Belts",
      "Wallets",
      "Caps",
      "Hats",
      "Ties",
      "Bow ties",
      "Handkerchiefs",
    ],
  },
  {
    id: "fragrance-grooming",
    name: "Fragrance & Grooming",
    department: "All",
    image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80",
    blurb: "Signature Arabian perfumes, long-lasting body sprays, roll-ons & hair styling essentials",
    count: 26,
    subcategories: [
      "Perfumes",
      "Body sprays",
      "Deodorants",
      "Roll-on",
      "Hair styling products",
    ],
  },
];

export const categories = CATEGORIES_TAXONOMY.map((c) => ({
  name: c.name,
  count: c.count,
  image: c.image,
  blurb: c.blurb,
}));


function makeBoutiqueProduct(
  i: number,
  name: string,
  brand: string,
  category: string,
  price: number,
  compareAt: number | undefined,
  stock: number,
  images: string[],
  specs: Record<string, string>,
  badge?: Product["badge"] | undefined,
  condition: Condition = "New"
): Product {
  return {
    id: `UVB-${2000 + i}`,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    name,
    brand,
    category,
    price,
    compareAt,
    rating: 4.8 + ((i * 7) % 3) / 10,
    reviews: 12 + ((i * 19) % 40),
    stock,
    condition,
    images,
    status: "Published",
    badge,
    views: 450 + ((i * 320) % 2100),
    blurb: "100% authentic designer apparel tailored for modern comfort, premium drape, and high street aesthetic. Available for instant delivery or boutique pickup.",
    specs,
  };
}

export const products: Product[] = [
  makeBoutiqueProduct(
    1,
    "Urban Vault Heavyweight Boxy Tee — Washed Charcoal",
    "Urban Vault Co.",
    "Shirts",
    380,
    450,
    18,
    [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80",
    ],
    { Fabric: "280 GSM 100% French Terry Cotton", Fit: "Boxy / Relaxed Drop Shoulder", Gender: "Unisex", Care: "Machine wash cold", Origin: "Imported" },
    "Best seller"
  ),
  makeBoutiqueProduct(
    2,
    "Retro Chunky Runner Sneakers — Cloud White / Bone",
    "Urban Vault Co.",
    "Footwear",
    850,
    1100,
    12,
    [
      "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80",
    ],
    { Sole: "Cushioned EVA Midsole", Upper: "Layered Suede & Breathable Mesh", Fit: "True to Size", Sizes: "EU 40 - 45" },
    "Flash deal"
  ),
  makeBoutiqueProduct(
    3,
    "Luxury Cuban Collar Linen Shirt — Sand Dune",
    "Zara Exclusive",
    "Shirts",
    420,
    490,
    15,
    [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80",
    ],
    { Material: "100% Pure Organic Linen", Collar: "Open Camp Collar", Fit: "Relaxed Fit", Occasion: "Resort / Smart Casual" },
    "New"
  ),
  makeBoutiqueProduct(
    4,
    "Multi-Pocket Utility Tactical Cargo Pants — Olive",
    "Represent Clo",
    "Men",
    650,
    780,
    9,
    [
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=80",
    ],
    { Material: "Heavy-duty Ripstop Cotton", Hardware: "Matte Black YKK Zippers", Pockets: "6 Functional Pockets", Ankle: "Adjustable Cinch Ties" },
    "Best seller"
  ),
  makeBoutiqueProduct(
    5,
    "Oversized Acid-Wash Graphic Band Hoodie",
    "Essentials FOG",
    "Men",
    750,
    890,
    14,
    [
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80",
    ],
    { Weight: "450 GSM Heavy Fleece", Hood: "Double-layered Seamless Hood", Fit: "Custom Streetwear Slouch", Print: "Vintage Plastisol Graphic" },
    "Flash deal"
  ),
  makeBoutiqueProduct(
    6,
    "Women's Minimalist Structured Blazer & Trouser Set",
    "Zara Exclusive",
    "Women",
    1250,
    1450,
    7,
    [
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
    ],
    { Set: "2-Piece (Blazer + Wide Leg Trousers)", Fabric: "Premium Crepe Blend", Lining: "Silky Satin", Silhouette: "High-waist Clean Drape" },
    "New"
  ),
  makeBoutiqueProduct(
    7,
    "Monochrome Leather Platform Loafers — Obsidian",
    "Urban Vault Co.",
    "Footwear",
    950,
    1200,
    8,
    [
      "https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80",
    ],
    { Leather: "Full-Grain Italian Calfskin", Sole: "Chunky Commando Lug Sole", Hardware: "Brushed Gunmetal Penny Bar", Insole: "Orthopedic Memory Foam" },
    "Best seller"
  ),
  makeBoutiqueProduct(
    8,
    "Women's Ribbed Seamless Bodysuit & Cargo Combo",
    "Urban Vault Co.",
    "Women",
    580,
    690,
    16,
    [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80",
    ],
    { Fabric: "Soft-Sculpt Nylon Elastane", Stretch: "4-Way Hyper-Flex", Neckline: "Square Cut", Colorways: "Espresso Brown / Obsidian Black" },
    "New"
  ),
  makeBoutiqueProduct(
    9,
    "Junior Streetwear Essentials Tracksuit Set",
    "Kids Vault",
    "Kids",
    480,
    580,
    11,
    [
      "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=800&q=80",
    ],
    { Material: "100% Breathable Cotton Fleece", Age: "4 - 14 Years", Features: "Elastic Drawstring Waist, Ribbed Cuffs", Color: "Heather Grey" },
    "Best seller"
  ),
  makeBoutiqueProduct(
    10,
    "Tactical Nylon Crossbody Sling Bag — Matte Black",
    "Urban Vault Co.",
    "Accessories",
    320,
    390,
    22,
    [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    ],
    { Material: "Water-Resistant Cordura 500D", Strap: "Quick-Release Magnetic Cobra Buckle", Compartments: "3 Zippered Sections + Key Fob" }
  ),
  makeBoutiqueProduct(
    11,
    "Vintage Distressed Trucker Denim Jacket",
    "Daily Paper",
    "Men",
    890,
    1050,
    6,
    [
      "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80",
    ],
    { Denim: "13.5 oz Rigid Selvedge Denim", Wash: "Sun-Bleached Stone Wash", Fit: "Structured Regular Cut", Hardware: "Antique Brass Buttons" },
    "Flash deal"
  ),
  makeBoutiqueProduct(
    12,
    "Air Flow Mesh Street Slides — Olive / Bone",
    "Nike Sportswear",
    "Footwear",
    450,
    550,
    19,
    [
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80",
    ],
    { Footbed: "Ergonomic Textured Footbed", Strap: "Padded Neoprene Forefoot", Traction: "Grooved Rubber Outsole" }
  ),
];

export const filterOptions = {
  department: ["All", "Men", "Women", "Unisex"],
  category: categories.map((c) => c.name),
  brand: brands.map((b) => b.name),
  condition: ["New", "Limited Edition", "Deadstock"],
  size: [
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "XXL",
    "3XL",
    "EU 38",
    "EU 39",
    "EU 40",
    "EU 41",
    "EU 42",
    "EU 43",
    "EU 44",
    "EU 45",
  ],
  gender: ["Unisex", "Men", "Women"],
};

export const popularSearches = [
  "Boxy Tee",
  "Chunky Sneakers",
  "Linen Shirt",
  "Cargo Pants",
  "Oversized Hoodie",
  "Crossbody Bag",
  "Unisex Streetwear",
  "Tracksuit",
];

export const reviews = [
  {
    name: "Kweku Boateng",
    role: "Content Creator, East Legon",
    text: "Urban Vault has the cleanest streetwear cuts in Accra. Ordered the boxy tee and cargo pants via WhatsApp, received them same-day at my doorstep. Fabric quality is incredible.",
    rating: 5,
  },
  {
    name: "Naa Ashorkor",
    role: "Stylist & Creative, Osu",
    text: "Finally an online boutique in Ghana where the images match exactly what gets delivered! The platform loafers fit true to size and the Paystack checkout was completely effortless.",
    rating: 5,
  },
  {
    name: "Michael Danso",
    role: "Entrepreneur, Kumasi",
    text: "I was skeptical about delivery to Kumasi, but my sneakers arrived within 24 hours neatly packaged. Top tier customer care on WhatsApp 0597489841. Will definitely order again.",
    rating: 5,
  },
];

/* Demo data for dashboard */
export const revenueSeries = [
  { month: "Feb", revenue: 24000, orders: 48 },
  { month: "Mar", revenue: 38000, orders: 72 },
  { month: "Apr", revenue: 46000, orders: 89 },
  { month: "May", revenue: 59000, orders: 112 },
  { month: "Jun", revenue: 74000, orders: 138 },
  { month: "Jul", revenue: 88000, orders: 165 },
  { month: "Aug", revenue: 104000, orders: 194 },
];

export const trafficSeries = [
  { day: "Mon", visitors: 940, enquiries: 38 },
  { day: "Tue", visitors: 1120, enquiries: 49 },
  { day: "Wed", visitors: 1350, enquiries: 64 },
  { day: "Thu", visitors: 1280, enquiries: 58 },
  { day: "Fri", visitors: 1720, enquiries: 92 },
  { day: "Sat", visitors: 2150, enquiries: 124 },
  { day: "Sun", visitors: 1640, enquiries: 85 },
];

export const searchTerms = [
  { term: "heavyweight boxy tee", count: 840, trend: 22 },
  { term: "chunky platform sneakers", count: 710, trend: 18 },
  { term: "utility cargo pants", count: 620, trend: 15 },
  { term: "oversized hoodie accra", count: 540, trend: 30 },
  { term: "linen shirt men", count: 480, trend: 10 },
];

export const activity = [
  { who: "Kweku Boateng", what: "enquired via WhatsApp about Boxy Tee in XL", when: "2 min ago", kind: "enquiry" },
  { who: "Order #UV-1042", what: "dispatched via rider to East Legon", when: "15 min ago", kind: "order" },
  { who: "Naa Ashorkor", what: "added Platform Loafers to cart", when: "35 min ago", kind: "wishlist" },
  { who: "Order #UV-1040", what: "paid GH₵ 850 via Paystack / MoMo", when: "1 hr ago", kind: "payment" },
];

export const orders = [
  { id: "#UV-1042", customer: "Kweku Boateng", item: "Boxy Tee Charcoal + Cargo", total: 1030, status: "Shipped", date: "Today" },
  { id: "#UV-1041", customer: "Ama Serwaa", item: "Chunky Sneakers Bone EU 39", total: 850, status: "Processing", date: "Today" },
  { id: "#UV-1040", customer: "Kojo Mensah", item: "Cuban Collar Linen Shirt", total: 420, status: "Delivered", date: "Yesterday" },
  { id: "#UV-1039", customer: "Farida Alhassan", item: "Structured Blazer Set", total: 1250, status: "Paid", date: "Yesterday" },
];

export const customers = [
  { name: "Kweku Boateng", email: "kweku@creative.gh", city: "Accra", orders: 3, spend: 2850, enquiries: 5, wishlist: 2 },
  { name: "Naa Ashorkor", email: "naa@studio.gh", city: "Accra", orders: 4, spend: 3900, enquiries: 4, wishlist: 5 },
  { name: "Michael Danso", email: "michael@danso.com", city: "Kumasi", orders: 2, spend: 1700, enquiries: 3, wishlist: 1 },
];
