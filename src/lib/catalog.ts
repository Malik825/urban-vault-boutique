import type { Product, Condition } from "@/lib/store-data";

/** Shape of a row coming back from the products table. */
export type ProductRow = {
  id: string;
  sku: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  compare_at: number | null;
  rating: number;
  reviews_count: number;
  stock: number;
  low_stock_threshold: number;
  condition: string;
  status: string;
  badge: string | null;
  views: number;
  blurb: string;
  specs: unknown;
};

export type CatalogProduct = Product & {
  dbId: string;
  sku: string;
  lowStockThreshold: number;
};

/* ── Fashion category cover images ───────────────────────── */
const categoryImages: Record<string, string> = {
  "Tops & Shirts": "/boutique/category_shirts_1792394774964.jpg",
  Shirts: "/boutique/category_shirts_1792394774964.jpg",
  "African & Traditional Wear": "https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=800&q=80",
  "Bottoms & Trousers": "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80",
  "Dresses & Skirts": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
  "Suits & Tailoring": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
  Footwear: "/boutique/category_footwear_1792394799875.jpg",
  "Bags & Luggage": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
  "Jewelry & Timepieces": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
  "Accessories & Headwear": "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80",
  Accessories: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80",
  "Fragrance & Grooming": "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80",
  Men: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80",
  Women: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
};

const defaultCover = "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=800&q=80";

export function categoryImage(category: string) {
  return categoryImages[category] ?? defaultCover;
}

export function mapProduct(row: ProductRow): CatalogProduct {
  const cover = categoryImage(row.category);
  const alt1 = "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80";
  const alt2 = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80";

  const specs =
    row.specs && typeof row.specs === "object" && !Array.isArray(row.specs)
      ? (row.specs as Record<string, any>)
      : {};

  const customImages: string[] = Array.isArray(specs["images"]) && specs["images"].length > 0
    ? specs["images"]
    : typeof specs["image_url"] === "string" && specs["image_url"]
    ? [specs["image_url"]]
    : typeof specs["image"] === "string" && specs["image"]
    ? [specs["image"]]
    : [];

  return {
    dbId: row.id,
    id: row.sku,
    sku: row.sku,
    slug: row.slug,
    name: row.name,
    brand: row.brand,
    category: row.category,
    price: Number(row.price),
    compareAt: row.compare_at === null ? undefined : Number(row.compare_at),
    rating: Number(row.rating),
    reviews: row.reviews_count,
    stock: row.stock,
    lowStockThreshold: row.low_stock_threshold,
    condition: row.condition as Condition,
    images: customImages.length > 0 ? customImages : [cover, alt1, alt2],
    status: row.status as Product["status"],
    badge: (row.badge ?? undefined) as Product["badge"],
    views: row.views,
    blurb: row.blurb,
    specs: specs as Record<string, string>,
  };
}

export const SPEC_GROUPS: { label: string; keys: string[] }[] = [
  { label: "Material & Fabric", keys: ["Material", "Fabric", "Weight", "Upper", "Sole"] },
  { label: "Fit & Sizing", keys: ["Fit", "Gender", "Sizes", "Ages", "Neckline", "Waist", "Ankle"] },
  { label: "Design Details", keys: ["Collar", "Hood", "Print", "Hardware", "Pockets", "Closure", "Buttons", "Wash", "Brim", "Style"] },
  { label: "More Info", keys: ["Occasion", "Care", "Origin", "Set", "Pack", "Compartments", "Strap", "Capacity", "Includes", "Frame", "Lens"] },
];

export function groupSpecs(specs: Record<string, string>) {
  const used = new Set<string>();
  const groups = SPEC_GROUPS.map((g) => {
    const rows = g.keys
      .filter((k) => specs[k] !== undefined)
      .map((k) => {
        used.add(k);
        return { key: k, value: specs[k] as string };
      });
    return { label: g.label, rows };
  }).filter((g) => g.rows.length > 0);

  const rest = Object.entries(specs)
    .filter(([k]) => !used.has(k))
    .map(([key, value]) => ({ key, value }));

  if (rest.length > 0) groups.push({ label: "More details", rows: rest });
  return groups;
}

