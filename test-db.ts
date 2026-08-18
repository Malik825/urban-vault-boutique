import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

async function run() {
  console.log("URL:", process.env.SUPABASE_URL);
  console.log("KEY length:", process.env.SUPABASE_PUBLISHABLE_KEY?.length);

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!
  );

  const { data, error } = await supabase.from("products").select("*");
  if (error) {
    console.error("DB Error:", error);
  } else {
    console.log(`Found ${data?.length} products`);
  }
}

run();
