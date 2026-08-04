import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { mapProduct, type ProductRow } from "@/lib/catalog";

/** Public catalogue read — anon policy allows published rows only. */
export const listPublishedProducts = createServerFn({ method: "GET" }).handler(async () => {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const url = process.env["SUPABASE_URL"]!;

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

  if (error) throw new Error(error.message);
  return (data as unknown as ProductRow[]).map(mapProduct);
});
