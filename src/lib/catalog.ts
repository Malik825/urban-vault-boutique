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
  Shirts: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
  Footwear: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80",
  Men: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80",
  Women: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
  Kids: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&w=800&q=80",
  Accessories: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80",
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
      ? (row.specs as Record<string, string>)
      : {};

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
    images: [cover, alt1, alt2],
    status: row.status as Product["status"],
    badge: (row.badge ?? undefined) as Product["badge"],
    views: row.views,
    blurb: row.blurb,
    specs,
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

