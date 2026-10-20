/**
 * Seed script — clears products table and inserts authentic Urban Vault Unisex Boutique products.
 * Run once:
 *   node scripts/seed.mjs
 */

import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

// Load .env
const env = Object.fromEntries(
  readFileSync(new URL("../.env", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.trim() && !l.startsWith("#"))
    .map((l) => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    })
    .filter(([k, v]) => k && v)
);

const SUPABASE_URL = env.SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

// ── Urban Vault Boutique Products ─────────────────────────────────────────────
// Covers all 10 taxonomy categories for full sidebar count accuracy
const boutiqueProducts = [
  // ── Tops & Shirts ──────────────────────────────────────────
  {
    sku: "UVB-1001",
    slug: "urban-vault-heavyweight-boxy-tee-washed-charcoal",
    name: "Urban Vault Heavyweight Boxy Tee — Washed Charcoal",
    brand: "Urban Vault Co.",
    category: "Tops & Shirts",
    price: 320, compare_at: 380, stock: 24,
    condition: "Brand New", status: "Published", badge: "New",
    rating: 4.8, reviews_count: 15, views: 1240,
    blurb: "280 GSM heavyweight cotton tee with a relaxed drop-shoulder cut and premium vintage wash drape.",
    specs: { Department: "Unisex", Sizes: "S, M, L, XL, XXL", Color: "Washed Charcoal", Material: "100% French Terry Cotton", Fit: "Boxy Oversized", Care: "Machine wash cold",
      images: ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80"] },
  },
  {
    sku: "UVB-1002",
    slug: "luxury-cuban-collar-linen-shirt-sand-dune",
    name: "Luxury Cuban Collar Linen Shirt — Sand Dune",
    brand: "Zara",
    category: "Tops & Shirts",
    price: 420, compare_at: 490, stock: 18,
    condition: "Brand New", status: "Published", badge: "New",
    rating: 4.8, reviews_count: 19, views: 1680,
    blurb: "100% breathable organic linen shirt tailored with a clean camp collar for luxury resort and evening style.",
    specs: { Department: "Men", Sizes: "M, L, XL, XXL", Color: "Sand Dune Beige", Material: "100% Pure Organic Linen", Fit: "Relaxed Fit", Collar: "Camp Cuban Collar",
      images: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80"] },
  },
  {
    sku: "UVB-1003",
    slug: "oversized-beige-hoodie-sweatpants-set",
    name: "Oversized Beige Hoodie & Sweatpants Set",
    brand: "Essentials FOG",
    category: "Tops & Shirts",
    price: 680, compare_at: 790, stock: 14,
    condition: "Brand New", status: "Published", badge: "-15%",
    rating: 4.9, reviews_count: 27, views: 2150,
    blurb: "Cozy 420 GSM fleece two-piece lounge and streetwear set featuring seamless hood and tapered cuffed pants.",
    specs: { Department: "Unisex", Sizes: "S, M, L, XL", Color: "Warm Beige", Material: "80% Cotton, 20% Polyester Fleece", Fit: "Oversized Silhouette",
      images: ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80"] },
  },
  {
    sku: "UVB-1013",
    slug: "acid-wash-graphic-oversized-tee-black",
    name: "Acid-Wash Oversized Graphic Tee — Black",
    brand: "Represent Clo",
    category: "Tops & Shirts",
    price: 280, compare_at: 340, stock: 30,
    condition: "Brand New", status: "Published", badge: "Best seller",
    rating: 4.7, reviews_count: 34, views: 1920,
    blurb: "Heavy 300 GSM acid-washed graphic tee with vintage plastisol screen print and dropped oversized silhouette.",
    specs: { Department: "Unisex", Sizes: "S, M, L, XL, XXL", Color: "Washed Black", Material: "300 GSM Cotton Jersey", Fit: "Oversized Drop-Shoulder",
      images: ["https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80"] },
  },
  {
    sku: "UVB-1014",
    slug: "womens-ribbed-cotton-crop-top-ivory",
    name: "Women's Ribbed Cotton Crop Top — Ivory",
    brand: "Zara",
    category: "Tops & Shirts",
    price: 180, compare_at: 220, stock: 25,
    condition: "Brand New", status: "Published", badge: "New",
    rating: 4.6, reviews_count: 22, views: 1050,
    blurb: "Soft ribbed stretch cotton crop top with a fitted silhouette, perfect for casual layering or high-waist styling.",
    specs: { Department: "Women", Sizes: "XS, S, M, L", Color: "Ivory White", Material: "95% Ribbed Cotton, 5% Elastane", Fit: "Fitted Crop",
      images: ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80"] },
  },

  // ── Bottoms & Trousers ────────────────────────────────────
  {
    sku: "UVB-1007",
    slug: "mens-slim-fit-stretch-chino-trousers-khaki",
    name: "Men's Slim Fit Stretch Chino Trousers — Khaki",
    brand: "Nike Sportswear",
    category: "Bottoms & Trousers",
    price: 360, compare_at: 420, stock: 20,
    condition: "Brand New", status: "Published", badge: "New",
    rating: 4.8, reviews_count: 35, views: 1890,
    blurb: "Tailored chinos woven with 98% combed cotton and 2% elastane for unrestricted stretch and sharp tailoring.",
    specs: { Department: "Men", Sizes: "30, 32, 34, 36, 38", Color: "Khaki Tan", Material: "98% Cotton, 2% Elastane", Fit: "Modern Slim Taper",
      images: ["https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80"] },
  },
  {
    sku: "UVB-1008",
    slug: "multi-pocket-tactical-cargo-joggers-olive",
    name: "Multi-Pocket Tactical Cargo Joggers — Olive Green",
    brand: "Represent Clo",
    category: "Bottoms & Trousers",
    price: 490, compare_at: 580, stock: 15,
    condition: "Brand New", status: "Published", badge: "Best seller",
    rating: 4.9, reviews_count: 38, views: 2450,
    blurb: "Heavy ripstop tactical joggers with 6 modular flap pockets, cinchable ankle cuffs, and matte black hardware.",
    specs: { Department: "Unisex", Sizes: "S, M, L, XL, XXL", Color: "Military Olive", Material: "Durable Ripstop Cotton", Fit: "Relaxed Taper with Ankle Cinch",
      images: ["https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80"] },
  },
  {
    sku: "UVB-1015",
    slug: "vintage-washed-denim-jeans-indigo-blue",
    name: "Vintage Washed Denim Jeans — Indigo Blue",
    brand: "Urban Vault Co.",
    category: "Bottoms & Trousers",
    price: 540, compare_at: 650, stock: 18,
    condition: "Brand New", status: "Published", badge: "New",
    rating: 4.8, reviews_count: 26, views: 1680,
    blurb: "Premium selvedge denim jeans with a vintage wash finish, tapered straight cut, and reinforced copper rivets.",
    specs: { Department: "Unisex", Sizes: "30, 32, 34, 36, 38", Color: "Indigo Blue", Material: "100% Selvedge Denim", Fit: "Slim Tapered",
      images: ["https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80"] },
  },

  // ── Dresses & Skirts ────────────────────────────────────
  {
    sku: "UVB-1016",
    slug: "womens-satin-slip-midi-dress-champagne",
    name: "Women's Satin Slip Midi Dress — Champagne",
    brand: "Zara",
    category: "Dresses & Skirts",
    price: 620, compare_at: 750, stock: 12,
    condition: "Brand New", status: "Published", badge: "New",
    rating: 4.9, reviews_count: 31, views: 2320,
    blurb: "Luxurious bias-cut satin slip midi dress with adjustable spaghetti straps and a fluid, elegant drape.",
    specs: { Department: "Women", Sizes: "XS, S, M, L, XL", Color: "Champagne Gold", Material: "100% Viscose Satin", Length: "Midi (knee to mid-calf)", Occasion: "Date night, Events, Parties",
      images: ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80"] },
  },
  {
    sku: "UVB-1017",
    slug: "ankara-printed-flare-midi-skirt",
    name: "Ankara Printed High-Waist Flare Skirt",
    brand: "Asante Tailors",
    category: "Dresses & Skirts",
    price: 380, compare_at: 440, stock: 15,
    condition: "Brand New", status: "Published", badge: "Exclusive",
    rating: 4.8, reviews_count: 23, views: 1540,
    blurb: "Vibrant hand-printed Ankara fabric flare midi skirt with an elasticated high waist — made in Ghana.",
    specs: { Department: "Women", Sizes: "S, M, L, XL", Color: "Multi (Ankara Print)", Material: "100% Cotton Ankara", Origin: "Ghana",
      images: ["https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80"] },
  },
  {
    sku: "UVB-1018",
    slug: "womens-bodycon-mini-dress-black",
    name: "Women's Bodycon Mini Dress — Black",
    brand: "Zara",
    category: "Dresses & Skirts",
    price: 310, compare_at: 380, stock: 20,
    condition: "Brand New", status: "Published", badge: "Best seller",
    rating: 4.7, reviews_count: 41, views: 2080,
    blurb: "Stretch-ribbed bodycon mini dress with a seamless, figure-hugging silhouette for a bold, confident look.",
    specs: { Department: "Women", Sizes: "XS, S, M, L", Color: "Jet Black", Material: "92% Polyester, 8% Spandex", Fit: "Bodycon / Figure Hugging",
      images: ["https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80"] },
  },

  // ── African & Traditional Wear ───────────────────────────
  {
    sku: "UVB-1004",
    slug: "asante-tailored-royal-kaftan-set-white-gold",
    name: "Asante Tailored Royal Kaftan Set — White & Gold",
    brand: "Asante Tailors",
    category: "African & Traditional Wear",
    price: 950, compare_at: 1150, stock: 9,
    condition: "Brand New", status: "Published", badge: "Best seller",
    rating: 4.9, reviews_count: 32, views: 2890,
    blurb: "Hand-tailored traditional Ghanaian kaftan two-piece with intricate gold neckline embroidery and matching trousers.",
    specs: { Department: "Men", Sizes: "M, L, XL, XXL, Custom", Color: "Crisp White / Gold Thread", Material: "Polished Cotton & Gold Embroidery", Origin: "Kumasi, Ghana", Occasion: "Weddings, Sunday Best, Celebrations",
      images: ["https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80"] },
  },
  {
    sku: "UVB-1019",
    slug: "ankara-mens-agbada-set-royal-blue",
    name: "Men's Premium Agbada 3-Piece Set — Royal Blue",
    brand: "Asante Tailors",
    category: "African & Traditional Wear",
    price: 1200, compare_at: 1450, stock: 8,
    condition: "Brand New", status: "Published", badge: "Exclusive",
    rating: 5.0, reviews_count: 18, views: 2200,
    blurb: "Premium Aso-oke agbada three-piece ensemble with flowing outer robe, inner kaftan, and matching trousers.",
    specs: { Department: "Men", Sizes: "M, L, XL, XXL, Custom", Color: "Royal Blue & Gold", Material: "Aso-oke Fabric", Origin: "Ghana", Occasion: "Funerals, Church, Weddings, Events",
      images: ["https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=800&q=80"] },
  },
  {
    sku: "UVB-1020",
    slug: "kente-cloth-womens-two-piece-set",
    name: "Women's Kente Two-Piece Fashion Set",
    brand: "Asante Tailors",
    category: "African & Traditional Wear",
    price: 780, compare_at: 950, stock: 11,
    condition: "Brand New", status: "Published", badge: "New",
    rating: 4.9, reviews_count: 24, views: 1750,
    blurb: "Authentic hand-woven Kente fabric fashioned into a modern two-piece co-ord set with structured blazer top.",
    specs: { Department: "Women", Sizes: "S, M, L, XL", Color: "Multi-colour Kente", Material: "Hand-woven Kente Fabric", Origin: "Ghana",
      images: ["https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80"] },
  },

  // ── Suits & Tailoring ─────────────────────────────────────
  {
    sku: "UVB-1009",
    slug: "luxury-double-breasted-wedding-suit-midnight-navy",
    name: "Luxury Double-Breasted Wedding Suit — Midnight Navy",
    brand: "Casablanca",
    category: "Suits & Tailoring",
    price: 1850, compare_at: 2200, stock: 7,
    condition: "Brand New", status: "Published", badge: "Exclusive",
    rating: 5.0, reviews_count: 18, views: 3200,
    blurb: "Bespoke double-breasted two-piece suit tailored in super 140s wool blend with peak lapels and horn buttons.",
    specs: { Department: "Men", Sizes: "38R, 40R, 42R, 44R, 46R", Color: "Midnight Navy", Material: "Super 140s Wool Blend", Set: "Jacket + Flat Front Trousers", Occasion: "Weddings, Galas, Black Tie",
      images: ["https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80"] },
  },
  {
    sku: "UVB-1021",
    slug: "womens-structured-power-blazer-set-cream",
    name: "Women's Structured Power Blazer Set — Cream",
    brand: "Zara",
    category: "Suits & Tailoring",
    price: 1250, compare_at: 1500, stock: 10,
    condition: "Brand New", status: "Published", badge: "New",
    rating: 4.9, reviews_count: 22, views: 1900,
    blurb: "Sharp structured two-piece blazer co-ord with wide-leg trousers in a premium Italian crepe blend — boardroom-ready.",
    specs: { Department: "Women", Sizes: "XS, S, M, L, XL", Color: "Ivory Cream", Material: "Italian Crepe Blend", Set: "Blazer + Wide-Leg Trousers", Occasion: "Corporate, Events",
      images: ["https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80"] },
  },
  {
    sku: "UVB-1022",
    slug: "premium-leather-biker-jacket-matte-black",
    name: "Premium Leather Biker Jacket — Matte Black",
    brand: "Represent Clo",
    category: "Suits & Tailoring",
    price: 1650, compare_at: 2000, stock: 6,
    condition: "Brand New", status: "Published", badge: "Exclusive",
    rating: 4.9, reviews_count: 29, views: 2650,
    blurb: "Full-grain genuine leather biker jacket with asymmetric zip, silver hardware, and quilted shoulder lining.",
    specs: { Department: "Unisex", Sizes: "S, M, L, XL", Color: "Matte Black", Material: "Full-Grain Genuine Leather", Lining: "Quilted Polyester", Hardware: "Antique Silver",
      images: ["https://images.unsplash.com/photo-1551537482-f2075a1d41f2?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80"] },
  },

  // ── Footwear ─────────────────────────────────────────────
  {
    sku: "UVB-1005",
    slug: "mens-handcrafted-leather-ahenema-sandals",
    name: "Men's Handcrafted Leather Ahenema Sandals",
    brand: "Asante Tailors",
    category: "Footwear",
    price: 480, compare_at: 550, stock: 16,
    condition: "Brand New", status: "Published", badge: "Exclusive",
    rating: 4.8, reviews_count: 21, views: 1450,
    blurb: "Authentic royal Akan traditional sandals crafted from genuine cowhide leather with royal motif embossing.",
    specs: { Department: "Men", Sizes: "EU 40, 41, 42, 43, 44, 45", Color: "Rich Brown & Gold", Material: "100% Genuine Leather", Origin: "Ghana",
      images: ["/boutique/category_footwear_1792394799875.jpg", "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80"] },
  },
  {
    sku: "UVB-1006",
    slug: "retro-chunky-runner-sneakers-cloud-white",
    name: "Retro Chunky Runner Sneakers — Cloud White / Bone",
    brand: "Urban Vault Co.",
    category: "Footwear",
    price: 850, compare_at: 1050, stock: 12,
    condition: "Brand New", status: "Published", badge: "Best seller",
    rating: 4.8, reviews_count: 44, views: 3100,
    blurb: "Premium streetwear chunky runner with layered suede, breathable mesh, and high-rebound cushioning.",
    specs: { Department: "Unisex", Sizes: "EU 39, 40, 41, 42, 43, 44, 45", Color: "Cloud White & Bone", Sole: "Lightweight High-Traction EVA", Upper: "Italian Suede & Mesh",
      images: ["https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80"] },
  },
  {
    sku: "UVB-1023",
    slug: "womens-platform-block-heel-mules-nude",
    name: "Women's Platform Block Heel Mules — Nude",
    brand: "Zara",
    category: "Footwear",
    price: 550, compare_at: 680, stock: 14,
    condition: "Brand New", status: "Published", badge: "New",
    rating: 4.7, reviews_count: 19, views: 1380,
    blurb: "Chic open-toe mule with a 9cm block platform heel, padded insole, and a sleek square-toe silhouette.",
    specs: { Department: "Women", Sizes: "EU 36, 37, 38, 39, 40, 41", Color: "Nude / Beige", Material: "Vegan Leather Upper", Heel: "9cm Block Platform",
      images: ["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80"] },
  },
  {
    sku: "UVB-1024",
    slug: "mens-classic-white-leather-low-top-sneakers",
    name: "Men's Classic White Leather Low-Top Sneakers",
    brand: "Nike Sportswear",
    category: "Footwear",
    price: 680, compare_at: 820, stock: 22,
    condition: "Brand New", status: "Published", badge: "Best seller",
    rating: 4.9, reviews_count: 52, views: 2900,
    blurb: "Clean minimal low-top sneaker in full-grain white leather with a cushioned rubber cupsole and tonal branding.",
    specs: { Department: "Unisex", Sizes: "EU 40, 41, 42, 43, 44, 45", Color: "Triple White", Material: "Full-Grain Leather", Sole: "Durable Rubber Cup Sole",
      images: ["https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80"] },
  },

  // ── Bags & Luggage ────────────────────────────────────────
  {
    sku: "UVB-1010",
    slug: "tactical-crossbody-sling-bag-matte-black",
    name: "Tactical Crossbody Sling Bag — Matte Black",
    brand: "Urban Vault Co.",
    category: "Bags & Luggage",
    price: 320, compare_at: 390, stock: 22,
    condition: "Brand New", status: "Published", badge: "New",
    rating: 4.8, reviews_count: 29, views: 1850,
    blurb: "Water-resistant Cordura sling bag with quick-release magnetic cobra buckle and internal organiser compartments.",
    specs: { Department: "Unisex", Sizes: "One Size", Color: "Matte Black", Material: "Cordura 500D Ballistic Nylon", Strap: "Adjustable with Cobra Buckle",
      images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80"] },
  },
  {
    sku: "UVB-1025",
    slug: "womens-structured-mini-top-handle-bag-cream",
    name: "Women's Structured Mini Top-Handle Bag — Cream",
    brand: "Daily Paper",
    category: "Bags & Luggage",
    price: 580, compare_at: 720, stock: 16,
    condition: "Brand New", status: "Published", badge: "New",
    rating: 4.8, reviews_count: 24, views: 1640,
    blurb: "Refined structured mini bag in smooth vegan leather with gold-tone chain strap, top handle, and detachable crossbody strap.",
    specs: { Department: "Women", Sizes: "20×14×8cm", Color: "Cream / Off-White", Material: "Premium Vegan Leather", Strap: "Chain + Adjustable Crossbody",
      images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80"] },
  },
  {
    sku: "UVB-1026",
    slug: "mens-executive-leather-briefcase-dark-brown",
    name: "Men's Executive Leather Briefcase — Dark Brown",
    brand: "Urban Vault Co.",
    category: "Bags & Luggage",
    price: 980, compare_at: 1200, stock: 9,
    condition: "Brand New", status: "Published", badge: "Exclusive",
    rating: 4.9, reviews_count: 16, views: 1280,
    blurb: "Full-grain leather executive briefcase with laptop compartment, brass lock, and hand-stitched handles.",
    specs: { Department: "Men", Sizes: "40×30×12cm", Color: "Cognac Brown", Material: "Full-Grain Genuine Leather", Strap: "Detachable Shoulder Strap",
      images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80"] },
  },

  // ── Jewelry & Timepieces ──────────────────────────────────
  {
    sku: "UVB-1011",
    slug: "gold-cuban-link-chain-necklace-18k-plated",
    name: "18K Gold Plated Cuban Link Chain Necklace (12mm)",
    brand: "Urban Vault Co.",
    category: "Jewelry & Timepieces",
    price: 450, compare_at: 550, stock: 19,
    condition: "Brand New", status: "Published", badge: "Best seller",
    rating: 4.9, reviews_count: 42, views: 2950,
    blurb: "Heavy solid 316L stainless steel chain with five-layer 18K real gold PVD electroplating that will never tarnish.",
    specs: { Department: "Unisex", Width: "12mm", Length: "20 inch / 22 inch", Material: "316L Stainless Steel & 18K Gold PVD", Closure: "Double Safety Box Clasp",
      images: ["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"] },
  },
  {
    sku: "UVB-1012",
    slug: "urban-vault-emerald-chronograph-timepiece",
    name: "Urban Vault Emerald Chronograph Timepiece",
    brand: "Urban Vault Co.",
    category: "Jewelry & Timepieces",
    price: 1250, compare_at: 1500, stock: 8,
    condition: "Brand New", status: "Published", badge: "Exclusive",
    rating: 5.0, reviews_count: 14, views: 2400,
    blurb: "Luxury stainless steel timepiece featuring sunray emerald green dial, functional chronograph, and sapphire glass.",
    specs: { Department: "Unisex", Movement: "Precision Japanese Quartz Chronograph", Glass: "Scratch-Resistant Sapphire Crystal", WaterResistance: "50 Meters (5 ATM)", CaseDiameter: "41mm",
      images: ["https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"] },
  },
  {
    sku: "UVB-1027",
    slug: "womens-gold-statement-hoop-earrings",
    name: "Women's Gold Statement Hoop Earrings (50mm)",
    brand: "Urban Vault Co.",
    category: "Jewelry & Timepieces",
    price: 180, compare_at: 240, stock: 30,
    condition: "Brand New", status: "Published", badge: "Best seller",
    rating: 4.7, reviews_count: 38, views: 1650,
    blurb: "Bold 50mm statement hoop earrings in 18K gold-plated stainless steel — lightweight and hypoallergenic.",
    specs: { Department: "Women", Size: "50mm Diameter", Material: "316L Stainless Steel, 18K Gold PVD", Closure: "Snap Closure Post", Hypoallergenic: "Yes",
      images: ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80"] },
  },

  // ── Accessories & Headwear ────────────────────────────────
  {
    sku: "UVB-1028",
    slug: "uv-sunglasses-retro-square-frame-black",
    name: "UV400 Retro Square Sunglasses — Matte Black",
    brand: "Urban Vault Co.",
    category: "Accessories & Headwear",
    price: 220, compare_at: 280, stock: 35,
    condition: "Brand New", status: "Published", badge: "Best seller",
    rating: 4.6, reviews_count: 47, views: 1840,
    blurb: "Retro square-frame sunglasses with UV400 polarised lenses, lightweight TR90 frame, and matte finish.",
    specs: { Department: "Unisex", Frame: "TR90 Lightweight", Lens: "UV400 Polarised", Color: "Matte Black Frame / Smoke Lens", Shape: "Square",
      images: ["https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80"] },
  },
  {
    sku: "UVB-1029",
    slug: "genuine-leather-slim-braided-belt-tan",
    name: "Genuine Leather Slim Braided Belt — Tan",
    brand: "Urban Vault Co.",
    category: "Accessories & Headwear",
    price: 160, compare_at: 200, stock: 40,
    condition: "Brand New", status: "Published", badge: "New",
    rating: 4.7, reviews_count: 33, views: 1120,
    blurb: "Hand-braided genuine leather belt with a brushed silver pin buckle — versatile for casual and smart casual.",
    specs: { Department: "Unisex", Width: "3.5cm", Material: "Full-Grain Leather", Buckle: "Brushed Silver Pin", Length: "90cm–130cm adjustable",
      images: ["https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80"] },
  },
  {
    sku: "UVB-1030",
    slug: "vintage-dad-cap-washed-cotton-sage-green",
    name: "Vintage Dad Cap — Washed Cotton, Sage Green",
    brand: "Urban Vault Co.",
    category: "Accessories & Headwear",
    price: 140, compare_at: 180, stock: 50,
    condition: "Brand New", status: "Published", badge: "New",
    rating: 4.5, reviews_count: 29, views: 940,
    blurb: "Relaxed low-profile dad cap in washed cotton canvas with embroidered UV logo and adjustable brass buckle.",
    specs: { Department: "Unisex", Material: "Washed Cotton Canvas", Color: "Sage Green", Closure: "Brass Buckle Adjustable", Fit: "Low Profile Unstructured",
      images: ["https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80"] },
  },

  // ── Fragrance & Grooming ─────────────────────────────────
  {
    sku: "UVB-1031",
    slug: "arabian-oud-eau-de-parfum-100ml",
    name: "Arabian Oud Eau de Parfum — 100ml",
    brand: "Urban Vault Co.",
    category: "Fragrance & Grooming",
    price: 380, compare_at: 480, stock: 25,
    condition: "Brand New", status: "Published", badge: "Best seller",
    rating: 4.9, reviews_count: 56, views: 3200,
    blurb: "Rich and long-lasting Arabian Oud EDP with notes of dark oud, amber resin, vetiver, and sandalwood. Lasts 12+ hours.",
    specs: { Department: "Unisex", Volume: "100ml EDP Spray", Notes: "Oud, Amber, Vetiver, Sandalwood", Longevity: "12+ Hours", Occasion: "Evening / Special Events",
      images: ["https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80"] },
  },
  {
    sku: "UVB-1032",
    slug: "rose-gold-floral-body-mist-women-250ml",
    name: "Rose Gold Floral Body Mist — Women's 250ml",
    brand: "Daily Paper",
    category: "Fragrance & Grooming",
    price: 160, compare_at: 200, stock: 40,
    condition: "Brand New", status: "Published", badge: "New",
    rating: 4.6, reviews_count: 31, views: 1100,
    blurb: "Light floral body mist with top notes of rose, peony, and freesia layered over a warm musk base.",
    specs: { Department: "Women", Volume: "250ml Body Mist", Notes: "Rose, Peony, Freesia, Musk", Longevity: "4–6 Hours", Occasion: "Everyday / Casual",
      images: ["https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=800&q=80"] },
  },
  {
    sku: "UVB-1033",
    slug: "mens-premium-grooming-kit-beard-care",
    name: "Men's Premium Beard Care Grooming Kit",
    brand: "Urban Vault Co.",
    category: "Fragrance & Grooming",
    price: 280, compare_at: 340, stock: 20,
    condition: "Brand New", status: "Published", badge: "New",
    rating: 4.8, reviews_count: 27, views: 1380,
    blurb: "Complete beard grooming kit: beard oil, balm, wooden comb, boar bristle brush, and precision scissors in a leather roll.",
    specs: { Department: "Men", Contents: "Beard Oil, Balm, Comb, Brush, Scissors", Scent: "Cedarwood & Peppermint", Material: "Genuine Leather Roll",
      images: ["https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80"] },
  },
];

async function seed() {
  console.log("⚡ Starting Urban Vault Boutique inventory seed...");

  // 1. Clear test order items, orders, and stock movements if any exist
  console.log("Clearing old test orders and movements...");
  await supabase.from("stock_movements").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("order_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("orders").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  // 2. Clear old products
  const { error: delError } = await supabase
    .from("products")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (delError) {
    console.warn("Delete products warning (falling back to upsert):", delError.message);
  } else {
    console.log("✅ Cleared old products table.");
  }

  // 3. Insert boutique products
  console.log(`Inserting/Upserting ${boutiqueProducts.length} authentic boutique products...`);

  const rows = boutiqueProducts.map((p) => ({
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    category: p.category,
    price: p.price,
    compare_at: p.compare_at ?? null,
    stock: p.stock,
    low_stock_threshold: 4,
    condition: p.condition,
    status: p.status,
    badge: p.badge ?? null,
    sku: p.sku,
    rating: p.rating,
    reviews_count: p.reviews_count,
    views: p.views,
    blurb: p.blurb,
    specs: p.specs,
  }));

  const { data, error: insError } = await supabase
    .from("products")
    .upsert(rows, { onConflict: "sku" })
    .select("id, sku, name, price, category");

  if (insError) {
    console.error("Insert/Upsert failed:", insError.message);
    process.exit(1);
  }

  console.log("\n🎉 Successfully seeded products in Supabase:");
  data.forEach((r) =>
    console.log(`  [${r.sku}] ${r.name} — GH₵${r.price} (${r.category})`)
  );
  console.log(`\nAll ${data.length} live boutique products are ready in Supabase!`);
}

seed();
