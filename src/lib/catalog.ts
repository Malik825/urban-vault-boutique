import laptopImg from "@/assets/laptop.jpg";
import phoneImg from "@/assets/phone.jpg";
import tabletImg from "@/assets/tablet.jpg";
import accessoriesImg from "@/assets/accessories.jpg";

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

const categoryImages: Record<string, string> = {
  Laptops: laptopImg,
  Phones: phoneImg,
  Tablets: tabletImg,
  Accessories: accessoriesImg,
};

export function categoryImage(category: string) {
  return categoryImages[category] ?? laptopImg;
}

export function mapProduct(row: ProductRow): CatalogProduct {
  const cover = categoryImage(row.category);
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
    images: [cover, accessoriesImg, tabletImg],
    status: row.status as Product["status"],
    badge: (row.badge ?? undefined) as Product["badge"],
    views: row.views,
    blurb: row.blurb,
    specs,
  };
}

export const SPEC_GROUPS: { label: string; keys: string[] }[] = [
  { label: "Performance", keys: ["Processor", "GPU", "RAM", "Storage"] },
  { label: "Display", keys: ["Screen Size", "Display", "Camera"] },
  { label: "Power & build", keys: ["Battery", "Weight", "Type", "Connectivity"] },
  { label: "Cover", keys: ["Warranty"] },
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
