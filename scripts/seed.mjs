/**
 * Seed script — clears products table and inserts all demo products.
 * Prices stored in pesewas (× 100). Run once:
 *   node scripts/seed.mjs
 *
 * Reads SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY from .env
 */

import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

// ── Load .env manually (no dotenv dep needed) ────────────────────────────────
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
// Service role key bypasses RLS — required for seed writes
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

console.log("Using key type:", SUPABASE_KEY.startsWith("sb_secret") ? "service_role (RLS bypass)" : "publishable (may be blocked by RLS)");

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
  global: {
    fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      // New-style sb_publishable keys are opaque — strip the bearer and set apikey instead
      if (
        SUPABASE_KEY.startsWith("sb_publishable") &&
        headers.get("Authorization") === `Bearer ${SUPABASE_KEY}`
      ) {
        headers.delete("Authorization");
      }
      headers.set("apikey", SUPABASE_KEY);
      return fetch(input, { ...init, headers });
    },
  },
});

// ── Product seed data (prices in GH₵, script x100 before insert) ─────────────
const products = [
  {
    slug: "macbook-pro-14-m3-pro",
    name: "MacBook Pro 14 M3 Pro",
    brand: "Apple",
    category: "Laptops",
    price: 24500,
    compare_at: 27900,
    stock: 6,
    condition: "New",
    status: "Published",
    badge: "Best seller",
    sku: "PRD-1001",
    rating: 4.7,
    reviews_count: 89,
    views: 4933,
    blurb: "Verified stock, 12-month warranty and same-day dispatch in Accra. Enquire on WhatsApp for bulk pricing.",
    specs: { RAM: "18GB", Storage: "512GB SSD", Processor: "Apple M3 Pro", "Screen Size": '14.2"', Display: "Liquid Retina XDR", Battery: "70Wh", Weight: "1.6kg", Warranty: "12 months" },
  },
  {
    slug: "iphone-15-pro-max-256gb",
    name: "iPhone 15 Pro Max 256GB",
    brand: "Apple",
    category: "Phones",
    price: 15900,
    compare_at: 17500,
    stock: 11,
    condition: "New",
    status: "Published",
    badge: "Flash Deal",
    sku: "PRD-1002",
    rating: 4.8,
    reviews_count: 63,
    views: 4600,
    blurb: "Verified stock, 12-month warranty and same-day dispatch in Accra. Enquire on WhatsApp for bulk pricing.",
    specs: { RAM: "8GB", Storage: "256GB", Processor: "A17 Pro", "Screen Size": '6.7"', Camera: "48MP triple", Battery: "4441mAh", Weight: "221g", Warranty: "12 months" },
  },
  {
    slug: "dell-xps-15-9530",
    name: "Dell XPS 15 9530",
    brand: "Dell",
    category: "Laptops",
    price: 17800,
    compare_at: 19800,
    stock: 4,
    condition: "New",
    status: "Published",
    badge: "Flash Deal",
    sku: "PRD-1003",
    rating: 4.5,
    reviews_count: 42,
    views: 3181,
    blurb: "Verified stock, 12-month warranty and same-day dispatch in Accra. Enquire on WhatsApp for bulk pricing.",
    specs: { RAM: "16GB", Storage: "1TB SSD", Processor: "Intel Core i7-13700H", "Screen Size": '15.6"', Display: "FHD+ 500 nits", Battery: "86Wh", Weight: "1.86kg", Warranty: "12 months" },
  },
  {
    slug: "hp-spectre-x360-14",
    name: "HP Spectre x360 14",
    brand: "HP",
    category: "Laptops",
    price: 12900,
    compare_at: null,
    stock: 9,
    condition: "New",
    status: "Published",
    badge: "New",
    sku: "PRD-1004",
    rating: 4.6,
    reviews_count: 55,
    views: 2466,
    blurb: "Verified stock, 12-month warranty and same-day dispatch in Accra. Enquire on WhatsApp for bulk pricing.",
    specs: { RAM: "16GB", Storage: "512GB SSD", Processor: "Intel Core i7-1355U", "Screen Size": '13.5"', Display: "OLED touch", Battery: "66Wh", Weight: "1.34kg", Warranty: "12 months" },
  },
  {
    slug: "lenovo-thinkpad-x1-carbon-g11",
    name: "Lenovo ThinkPad X1 Carbon G11",
    brand: "Lenovo",
    category: "Laptops",
    price: 16500,
    compare_at: 18200,
    stock: 3,
    condition: "Open box",
    status: "Published",
    badge: null,
    sku: "PRD-1005",
    rating: 4.5,
    reviews_count: 37,
    views: 1866,
    blurb: "Verified stock, 12-month warranty and same-day dispatch in Accra. Enquire on WhatsApp for bulk pricing.",
    specs: { RAM: "32GB", Storage: "1TB SSD", Processor: "Intel Core i7-1365U", "Screen Size": '14"', Display: "WUXGA IPS", Battery: "57Wh", Weight: "1.12kg", Warranty: "6 months" },
  },
  {
    slug: "asus-rog-zephyrus-g14",
    name: "ASUS ROG Zephyrus G14",
    brand: "ASUS",
    category: "Laptops",
    price: 19900,
    compare_at: 21500,
    stock: 5,
    condition: "New",
    status: "Published",
    badge: "Best seller",
    sku: "PRD-1006",
    rating: 4.8,
    reviews_count: 71,
    views: 4733,
    blurb: "Verified stock, 12-month warranty and same-day dispatch in Accra. Enquire on WhatsApp for bulk pricing.",
    specs: { RAM: "16GB", Storage: "1TB SSD", Processor: "AMD Ryzen 9 7940HS", "Screen Size": '14"', GPU: "RTX 4060", Battery: "76Wh", Weight: "1.65kg", Warranty: "12 months" },
  },
  {
    slug: "samsung-galaxy-s24-ultra",
    name: "Samsung Galaxy S24 Ultra",
    brand: "Samsung",
    category: "Phones",
    price: 14800,
    compare_at: 16200,
    stock: 14,
    condition: "New",
    status: "Published",
    badge: "New",
    sku: "PRD-1007",
    rating: 4.7,
    reviews_count: 58,
    views: 3799,
    blurb: "Verified stock, 12-month warranty and same-day dispatch in Accra. Enquire on WhatsApp for bulk pricing.",
    specs: { RAM: "12GB", Storage: "256GB", Processor: "Snapdragon 8 Gen 3", "Screen Size": '6.8"', Camera: "200MP quad", Battery: "5000mAh", Weight: "232g", Warranty: "12 months" },
  },
  {
    slug: "ipad-pro-11-m2",
    name: "iPad Pro 11 M2",
    brand: "Apple",
    category: "Tablets",
    price: 11200,
    compare_at: 12400,
    stock: 8,
    condition: "New",
    status: "Published",
    badge: "Flash Deal",
    sku: "PRD-1008",
    rating: 4.7,
    reviews_count: 66,
    views: 3332,
    blurb: "Verified stock, 12-month warranty and same-day dispatch in Accra. Enquire on WhatsApp for bulk pricing.",
    specs: { RAM: "8GB", Storage: "256GB", Processor: "Apple M2", "Screen Size": '11"', Display: "Liquid Retina", Battery: "28.6Wh", Weight: "466g", Warranty: "12 months" },
  },
  {
    slug: "galaxy-tab-s9-plus",
    name: "Galaxy Tab S9+",
    brand: "Samsung",
    category: "Tablets",
    price: 8900,
    compare_at: null,
    stock: 0,
    condition: "New",
    status: "Published",
    badge: null,
    sku: "PRD-1009",
    rating: 4.5,
    reviews_count: 29,
    views: 1866,
    blurb: "Verified stock, 12-month warranty and same-day dispatch in Accra. Enquire on WhatsApp for bulk pricing.",
    specs: { RAM: "12GB", Storage: "256GB", Processor: "Snapdragon 8 Gen 2", "Screen Size": '12.4"', Display: "AMOLED 120Hz", Battery: "10090mAh", Weight: "581g", Warranty: "12 months" },
  },
  {
    slug: "macbook-air-13-m2",
    name: "MacBook Air 13 M2",
    brand: "Apple",
    category: "Laptops",
    price: 11800,
    compare_at: 13200,
    stock: 12,
    condition: "Refurbished",
    status: "Published",
    badge: "Best seller",
    sku: "PRD-1010",
    rating: 4.9,
    reviews_count: 102,
    views: 5266,
    blurb: "Verified stock, 12-month warranty and same-day dispatch in Accra. Enquire on WhatsApp for bulk pricing.",
    specs: { RAM: "8GB", Storage: "256GB SSD", Processor: "Apple M2", "Screen Size": '13.6"', Display: "Liquid Retina", Battery: "52.6Wh", Weight: "1.24kg", Warranty: "6 months" },
  },
  {
    slug: "hp-elitebook-840-g10",
    name: "HP EliteBook 840 G10",
    brand: "HP",
    category: "Laptops",
    price: 9800,
    compare_at: 10900,
    stock: 7,
    condition: "Open box",
    status: "Published",
    badge: null,
    sku: "PRD-1011",
    rating: 4.4,
    reviews_count: 23,
    views: 1533,
    blurb: "Verified stock, 12-month warranty and same-day dispatch in Accra. Enquire on WhatsApp for bulk pricing.",
    specs: { RAM: "16GB", Storage: "512GB SSD", Processor: "Intel Core i5-1335U", "Screen Size": '14"', Display: "WUXGA", Battery: "51Wh", Weight: "1.36kg", Warranty: "6 months" },
  },
  {
    slug: "sony-wh-1000xm5",
    name: "Sony WH-1000XM5",
    brand: "Samsung",
    category: "Accessories",
    price: 3850,
    compare_at: 4300,
    stock: 22,
    condition: "New",
    status: "Published",
    badge: "Flash Deal",
    sku: "PRD-1012",
    rating: 4.8,
    reviews_count: 134,
    views: 4399,
    blurb: "Verified stock, 12-month warranty and same-day dispatch in Accra. Enquire on WhatsApp for bulk pricing.",
    specs: { Type: "Over-ear ANC", Battery: "30 hours", Connectivity: "Bluetooth 5.2", Weight: "250g", Warranty: "12 months" },
  },
  {
    slug: "apple-watch-series-9-45mm",
    name: "Apple Watch Series 9 45mm",
    brand: "Apple",
    category: "Accessories",
    price: 5200,
    compare_at: null,
    stock: 16,
    condition: "New",
    status: "Published",
    badge: "New",
    sku: "PRD-1013",
    rating: 4.6,
    reviews_count: 48,
    views: 2932,
    blurb: "Verified stock, 12-month warranty and same-day dispatch in Accra. Enquire on WhatsApp for bulk pricing.",
    specs: { Display: "Always-on Retina", Battery: "18 hours", Connectivity: "GPS + Cellular", Weight: "51g", Warranty: "12 months" },
  },
  {
    slug: "lenovo-yoga-slim-7i",
    name: "Lenovo Yoga Slim 7i",
    brand: "Lenovo",
    category: "Laptops",
    price: 8600,
    compare_at: 9400,
    stock: 2,
    condition: "New",
    status: "Published",
    badge: null,
    sku: "PRD-1014",
    rating: 4.5,
    reviews_count: 31,
    views: 1866,
    blurb: "Verified stock, 12-month warranty and same-day dispatch in Accra. Enquire on WhatsApp for bulk pricing.",
    specs: { RAM: "16GB", Storage: "512GB SSD", Processor: "Intel Core i5-1340P", "Screen Size": '14"', Display: "2.8K OLED", Battery: "61Wh", Weight: "1.4kg", Warranty: "12 months" },
  },
  {
    slug: "asus-zenbook-14-oled",
    name: "ASUS Zenbook 14 OLED",
    brand: "ASUS",
    category: "Laptops",
    price: 9200,
    compare_at: null,
    stock: 5,
    condition: "New",
    status: "Draft",
    badge: null,
    sku: "PRD-1015",
    rating: 4.5,
    reviews_count: 17,
    views: 933,
    blurb: "Verified stock, 12-month warranty and same-day dispatch in Accra. Enquire on WhatsApp for bulk pricing.",
    specs: { RAM: "16GB", Storage: "1TB SSD", Processor: "AMD Ryzen 7 7730U", "Screen Size": '14"', Display: "2.8K OLED", Battery: "75Wh", Weight: "1.39kg", Warranty: "12 months" },
  },
  {
    slug: "google-pixel-8-pro",
    name: "Google Pixel 8 Pro",
    brand: "Samsung",
    category: "Phones",
    price: 11800,
    compare_at: 12900,
    stock: 6,
    condition: "New",
    status: "Published",
    badge: null,
    sku: "PRD-1016",
    rating: 4.6,
    reviews_count: 44,
    views: 2666,
    blurb: "Verified stock, 12-month warranty and same-day dispatch in Accra. Enquire on WhatsApp for bulk pricing.",
    specs: { RAM: "12GB", Storage: "256GB", Processor: "Tensor G3", "Screen Size": '6.7"', Camera: "50MP triple", Battery: "5050mAh", Weight: "213g", Warranty: "12 months" },
  },
  {
    slug: "iphone-13-128gb",
    name: "iPhone 13 128GB",
    brand: "Apple",
    category: "Phones",
    price: 6900,
    compare_at: 7800,
    stock: 18,
    condition: "Refurbished",
    status: "Published",
    badge: "Best seller",
    sku: "PRD-1017",
    rating: 4.7,
    reviews_count: 88,
    views: 4999,
    blurb: "Verified stock, 12-month warranty and same-day dispatch in Accra. Enquire on WhatsApp for bulk pricing.",
    specs: { RAM: "4GB", Storage: "128GB", Processor: "A15 Bionic", "Screen Size": '6.1"', Camera: "12MP dual", Battery: "3240mAh", Weight: "174g", Warranty: "6 months" },
  },
];

// ── Run ───────────────────────────────────────────────────────────────────────
async function seed() {
  console.log("Deleting all existing products...");

  // Delete everything — use a condition that always matches
  const { error: delError } = await supabase
    .from("products")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (delError) {
    console.error("Delete failed:", delError.message);
    process.exit(1);
  }
  console.log("Products table cleared.");

  console.log(`\nInserting ${products.length} products...`);

  const rows = products.map((p) => ({
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    category: p.category,
    price: p.price,
    compare_at: p.compare_at != null ? p.compare_at : null,
    stock: p.stock,
    low_stock_threshold: 5,
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
    .insert(rows)
    .select("id, sku, name, price");

  if (insError) {
    console.error("Insert failed:", insError.message);
    process.exit(1);
  }

  console.log("\nSeeded products:");
  data.forEach((r) =>
    console.log(`  ${r.sku}  ${r.name}  — GH₵${r.price}  (uuid: ${r.id})`)
  );
  console.log(`\nDone! ${data.length} products seeded with proper UUIDs.`);
}

seed();
