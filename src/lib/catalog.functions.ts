import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { mapProduct, type ProductRow } from "@/lib/catalog";

import { products as fallbackProducts } from "@/lib/store-data";

/** Public catalogue read — anon policy allows published rows only, with fallback. */
export const listPublishedProducts = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"] || process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] || import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
    const url = process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"] || import.meta.env["VITE_SUPABASE_URL"];

    if (!key || !url) {
      return fallbackProducts.map((p) => ({ ...p, dbId: p.id, sku: p.id, lowStockThreshold: 3 }));
    }

    const supabase = createClient<Database>(url, key, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const headers = new Headers(init?.headers);
          if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
            headers.delete("Authorization");
          }
          headers.set("apikey", key);
          return fetch(input, { ...init, headers, signal: AbortSignal.timeout(4000) });
        },
      },
    });

    const { data, error } = await supabase
      .from("products")
      .select(
        "id, sku, slug, name, brand, category, price, compare_at, rating, reviews_count, stock, low_stock_threshold, condition, status, badge, views, blurb, specs",
      )
      .eq("status", "Published")
      .order("created_at", { ascending: false })
      .order("name", { ascending: true });

    if (error || !data || data.length === 0) {
      return fallbackProducts.map((p) => ({ ...p, dbId: p.id, sku: p.id, lowStockThreshold: 3 }));
    }
    
    return (data as unknown as ProductRow[]).map(mapProduct);
  } catch (err: any) {
    console.warn("[ServerFn] Using demo fallback catalogue due to fetch issue:", err?.message || err);
    return fallbackProducts.map((p) => ({ ...p, dbId: p.id, sku: p.id, lowStockThreshold: 3 }));
  }
});

/** Increment product views when viewed on storefront. */
export const recordProductView = createServerFn({ method: "POST" })
  .validator((data: { slug?: string; id?: string }) => data)
  .handler(async ({ data }) => {
    try {
      const key =
        process.env["SUPABASE_SERVICE_ROLE_KEY"] ||
        process.env["SUPABASE_PUBLISHABLE_KEY"] ||
        process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
        import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"]!;
      const url =
        process.env["SUPABASE_URL"] ||
        process.env["VITE_SUPABASE_URL"] ||
        import.meta.env["VITE_SUPABASE_URL"]!;

      const supabase = createClient<Database>(url, key, {
        auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
        global: {
          fetch: (input, init) => {
            const headers = new Headers(init?.headers);
            if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
              headers.delete("Authorization");
            }
            headers.set("apikey", key);
            return fetch(input, { ...init, headers });
          },
        },
      });

      const identifier = data.slug || data.id;
      if (!identifier) return { ok: false };

      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
      let query = supabase.from("products").select("id, views");
      if (isUuid) {
        query = query.eq("id", identifier);
      } else if (data.slug) {
        query = query.eq("slug", data.slug);
      } else {
        query = query.eq("sku", identifier);
      }

      const { data: row } = await query.maybeSingle();
      if (row) {
        await supabase
          .from("products")
          .update({ views: (row.views ?? 0) + 1 })
          .eq("id", row.id);
      }
      return { ok: true };
    } catch (err: any) {
      console.error("[recordProductView] Error:", err?.message || err);
      return { ok: false };
    }
  });
