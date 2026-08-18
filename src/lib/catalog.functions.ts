import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { mapProduct, type ProductRow } from "@/lib/catalog";

/** Public catalogue read — anon policy allows published rows only. */
export const listPublishedProducts = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"] || process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY!;
    const url = process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"] || import.meta.env.VITE_SUPABASE_URL!;

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

    const { data, error } = await supabase
      .from("products")
      .select(
        "id, sku, slug, name, brand, category, price, compare_at, rating, reviews_count, stock, low_stock_threshold, condition, status, badge, views, blurb, specs",
      )
      .eq("status", "Published")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[ServerFn] Supabase Error:", error.message);
      throw new Error(error.message);
    }
    
    return (data as unknown as ProductRow[]).map(mapProduct);
  } catch (err: any) {
    console.error("[ServerFn] Fatal Error:", err.stack || err.message || err);
    throw err;
  }
});
