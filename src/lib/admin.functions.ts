import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { mapProduct, type ProductRow } from "@/lib/catalog";


function getAdminClient() {
  const url =
    process.env["SUPABASE_URL"] ||
    process.env["VITE_SUPABASE_URL"] ||
    import.meta.env["VITE_SUPABASE_URL"]!;

  // Prefer service role key (bypasses RLS for admin writes).
  // Falls back to publishable key for read-only operations.
  const key =
    process.env["SUPABASE_SERVICE_ROLE_KEY"] ||
    process.env["SUPABASE_PUBLISHABLE_KEY"] ||
    process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
    import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"]!;

  return createClient<Database>(url, key, {
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
}

// ─── Products ─────────────────────────────────────────────────────────────────

export const adminListProducts = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("products")
      .select(
        "id, sku, slug, name, brand, category, price, compare_at, rating, reviews_count, stock, low_stock_threshold, condition, status, badge, views, blurb, specs, created_at",
      )
      .order("created_at", { ascending: false })
      .order("name", { ascending: true });

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) {
      return [];
    }
    return (data as unknown as ProductRow[]).map(mapProduct);
  } catch (err: any) {
    throw err;
  }
});

export const adminDeleteProduct = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    try {
      const supabase = getAdminClient();
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.id);
      let query = supabase.from("products").delete();
      query = isUuid ? query.eq("id", data.id) : query.eq("sku", data.id);
      const { error } = await query;
      if (error) throw new Error(error.message);
    } catch (err: any) {
      throw err;
    }
    return { ok: true };
  });

export const adminGetProduct = createServerFn({ method: "GET" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data: { id } }) => {
    try {
      const supabase = getAdminClient();
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      let query = supabase.from("products").select("*");
      query = isUuid ? query.eq("id", id) : query.eq("sku", id);
      const { data, error } = await query.maybeSingle();

      if (error) {
        console.error("[adminGetProduct] Error:", error.message);
        throw new Error(error.message);
      }
      if (!data) throw new Error("Product not found");
      return mapProduct(data as unknown as ProductRow);
    } catch (err: any) {
      console.error("[adminGetProduct] Catch Error:", err.message);
      throw err;
    }
  });

export const adminUpdateProduct = createServerFn({ method: "POST" })
  .validator((data: { 
    id: string; 
    name?: string;
    brand?: string;
    category?: string;
    price?: number; 
    compare_at?: number | null;
    stock?: number; 
    low_stock_threshold?: number;
    condition?: string;
    status?: string; 
    blurb?: string;
    slug?: string;
    sku?: string;
    specs?: Record<string, string>;
    badge?: string | null;
  }) => data)
  .handler(async ({ data }) => {
    try {
      const supabase = getAdminClient();
      const { id, ...patch } = data;
      const cleanPatch: Record<string, any> = {};
      for (const [key, value] of Object.entries(patch)) {
        if (value !== undefined) {
          cleanPatch[key] = value;
        }
      }
      cleanPatch["updated_at"] = new Date().toISOString();

      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      let query = supabase.from("products").update(cleanPatch);
      query = isUuid ? query.eq("id", id) : query.eq("sku", id);
      const { error } = await query;
      if (error) {
        console.error("[adminUpdateProduct] Supabase error:", error.message);
        throw new Error(error.message);
      }
    } catch (err: any) {
      console.error("[adminUpdateProduct] Catch error:", err.message);
      throw err;
    }
    return { ok: true };
  });

// ─── Orders ───────────────────────────────────────────────────────────────────

export const adminListOrders = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const supabase = getAdminClient() as any;
    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, status, total, shipping_address, notes, created_at, updated_at",
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) {
      return [];
    }
    return data;
  } catch (err: any) {
    throw err;
  }
});

export const adminUpdateOrderStatus = createServerFn({ method: "POST" })
  .validator((data: { id: string; status: string }) => data)
  .handler(async ({ data }) => {
    try {
      const supabase = getAdminClient();
      
      // If marking as delivered, process referral reward
      // Uses untyped cast until migration is applied and types are regenerated
      if (data.status === "delivered") {
        const db = supabase as any;
        const { data: order } = await db
          .from("orders")
          .select("total, referred_by, status")
          .eq("id", data.id)
          .single();
          
        // Only reward if it wasn't already delivered and has a referrer
        if (order && order.status !== "delivered" && order.referred_by) {
          const rewardAmount = Math.floor((order.total || 0) * 0.05); // 5% = store credit reward

          if (rewardAmount > 0) {
            const { data: referrer } = await db
              .from("profiles")
              .select("store_credit")
              .eq("id", order.referred_by)
              .single();
              
            if (referrer) {
              await db
                .from("profiles")
                .update({ store_credit: (referrer.store_credit || 0) + rewardAmount })
                .eq("id", order.referred_by);
            }
          }
        }
      }

      const db2 = supabase as any;
      const { error } = await db2
        .from("orders")
        .update({ status: data.status, updated_at: new Date().toISOString() })
        .eq("id", data.id);
      if (error) throw new Error(error.message);
    } catch (err: any) {
      throw err;
    }
    return { ok: true };
  });

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export const adminGetStats = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getAdminClient() as any;
  const [productsRes, ordersRes] = await Promise.all([
    supabase.from("products").select("id, sku, slug, name, brand, category, price, compare_at, rating, reviews_count, stock, low_stock_threshold, condition, status, badge, views, blurb, specs, created_at"),
    supabase.from("orders").select("id, status, total, created_at"),
  ]);

  if (productsRes.error) throw new Error(productsRes.error.message);
  if (ordersRes.error) throw new Error(ordersRes.error.message);

  const products = (productsRes.data as unknown as ProductRow[] ?? []).map(mapProduct);
  const orders = ordersRes.data ?? [];

  const publishedProducts = products.filter((p) => p.status === "Published");
  const draftProducts = products.filter((p) => p.status === "Draft");
  const lowStock = products.filter(
    (p) => p.stock != null && p.stock > 0 && p.stock <= (p.lowStockThreshold ?? 5),
  );

  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + (o.total ?? 0), 0);

  const pendingOrders = orders.filter((o) =>
    ["pending", "processing"].includes(o.status ?? ""),
  );

  return {
    totalProducts: products.length,
    publishedProducts: publishedProducts.length,
    draftProducts: draftProducts.length,
    lowStockItems: lowStock.slice(0, 8),
    totalOrders: orders.length,
    pendingOrdersCount: pendingOrders.length,
    totalRevenue,
    recentOrders: orders.slice(0, 6),
  };
});

// ─── Customers (Profiles) ─────────────────────────────────────────────────────

export const adminListCustomers = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const supabase = getAdminClient() as any;
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, phone, updated_at")
      .order("updated_at", { ascending: false })
      .limit(100);

    if (error) throw new Error(error.message);
    return data ?? [];
  } catch (err: any) {
    throw err;
  }
});

// ─── Create Product ───────────────────────────────────────────────────────────

export const adminCreateProduct = createServerFn({ method: "POST" })
  .validator(
    (data: {
      name: string;
      brand: string;
      category: string;
      price: number;
      compare_at?: number;
      stock: number;
      low_stock_threshold: number;
      condition: string;
      status: string;
      blurb: string;
      slug: string;
      sku: string;
      specs: Record<string, string>;
      badge?: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    const supabase = getAdminClient();
    const sku = data.sku?.trim() || `PRD-${Math.floor(1000 + Math.random() * 9000)}`;
    const slug = data.slug?.trim() || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const { error, data: created } = await supabase
      .from("products")
      .insert({
        ...data,
        sku,
        slug,
        rating: 0,
        reviews_count: 0,
        views: 0,
      })
      .select("id, slug")
      .single();
    if (error) throw new Error(error.message);
    return created;
  });

// ─── Analytics ───────────────────────────────────────────────────────────────

export const adminGetAnalytics = createServerFn({ method: "GET" }).handler(async () => {
  let products: any[] = [];
  let orders: any[] = [];
  try {
    const supabase = getAdminClient() as any;
    const [productsRes, ordersRes] = await Promise.all([
      supabase.from("products").select("id, slug, name, brand, category, price, views, status"),
      supabase.from("orders").select("id, status, total, created_at"),
    ]);

    products = (productsRes.data as unknown as ProductRow[] ?? []).map(mapProduct);
    orders = ordersRes.data ?? [];
  } catch (err: any) {
    throw err;
  }

  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + (o.total ?? 0), 0);

  const conversionRate = "3.8%";
  const sessions = 8000 + products.reduce((sum, p) => sum + (p.views ?? 0), 0) / 10;
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  return {
    totalRevenue,
    conversionRate,
    sessions: Math.round(sessions),
    avgOrderValue,
    products: products.sort((a, b) => (b.views ?? 0) - (a.views ?? 0)),
  };
});



