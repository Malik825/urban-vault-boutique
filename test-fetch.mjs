import { createClient } from "@supabase/supabase-js";

const url = "https://hxgenatrlhjdthirmgii.supabase.co";
const key = "sb_publishable_F6mpy5Qv3KgkeuMcOOntEg_28yKxazb";

async function check(name, customFetch) {
  const supabase = createClient(url, key, customFetch ? { global: { fetch: customFetch } } : {});
  const { data, error } = await supabase.from("products").select("id").eq("status", "Published");
  if (error) {
    console.error(`[${name}] Error:`, error.message);
  } else {
    console.log(`[${name}] Fetched ${data.length} products`);
  }
}

async function run() {
  await check("Default Fetch", undefined);
  
  await check("Custom Fetch (No Auth Header)", (input, init) => {
    const headers = new Headers(init?.headers);
    if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
      headers.delete("Authorization");
    }
    headers.set("apikey", key);
    return fetch(input, { ...init, headers });
  });
}

run();
