import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://hxgenatrlhjdthirmgii.supabase.co",
  "sb_publishable_F6mpy5Qv3KgkeuMcOOntEg_28yKxazb"
);

async function check() {
  const { data, error } = await supabase
    .from("products")
    .select("id, sku, slug, name, brand, category, price, compare_at, rating, reviews_count, stock, low_stock_threshold, condition, status, badge, views, blurb, specs")
    .eq("status", "Published")
    .order("created_at", { ascending: true });
  if (error) {
    console.error("Database error:", error);
  } else {
    console.log(`Successfully fetched ${data.length} products.`);
  }
}

check();
