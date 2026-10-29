import { createServerFn } from "@tanstack/react-start";
import { getAdminClient } from "@/lib/admin.functions";
import { CATEGORIES_TAXONOMY, type CategoryTaxonomy } from "@/lib/store-data";

const CATEGORIES_STORAGE_PATH = "settings/categories.json";
const BUCKET_NAME = "product-images";

/** In-memory cache for public categories (30s TTL) */
let cachedCategories: CategoryTaxonomy[] | null = null;
let categoriesCacheTimestamp = 0;
const CACHE_TTL_MS = 30 * 1000;

export const getPublicCategories = createServerFn({ method: "GET" }).handler(
  async (): Promise<CategoryTaxonomy[]> => {
    if (cachedCategories && Date.now() - categoriesCacheTimestamp < CACHE_TTL_MS) {
      return cachedCategories;
    }

    try {
      const supabase = getAdminClient();
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .download(CATEGORIES_STORAGE_PATH);

      if (!error && data) {
        const text = await data.text();
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          cachedCategories = parsed;
          categoriesCacheTimestamp = Date.now();
          return parsed;
        }
      }
    } catch (err: any) {
      console.warn("[getPublicCategories] Falling back to default categories:", err?.message || err);
    }

    return CATEGORIES_TAXONOMY;
  },
);

export const adminGetCategories = createServerFn({ method: "GET" }).handler(
  async (): Promise<CategoryTaxonomy[]> => {
    try {
      const supabase = getAdminClient();
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .download(CATEGORIES_STORAGE_PATH);

      if (!error && data) {
        const text = await data.text();
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err: any) {
      console.warn("[adminGetCategories] Falling back to defaults:", err?.message || err);
    }

    return CATEGORIES_TAXONOMY;
  },
);

export const adminSaveCategories = createServerFn({ method: "POST" })
  .validator((data: { categories: CategoryTaxonomy[] }) => data)
  .handler(async ({ data }) => {
    try {
      const supabase = getAdminClient();
      const payload = Buffer.from(JSON.stringify(data.categories, null, 2));

      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(CATEGORIES_STORAGE_PATH, payload, {
          contentType: "application/json",
          upsert: true,
        });

      if (error) {
        throw new Error(error.message || "Failed to save categories to storage");
      }

      cachedCategories = data.categories;
      categoriesCacheTimestamp = Date.now();

      return { ok: true, count: data.categories.length };
    } catch (err: any) {
      console.error("[adminSaveCategories] Error:", err);
      throw new Error(err.message || "Failed to save categories");
    }
  });
