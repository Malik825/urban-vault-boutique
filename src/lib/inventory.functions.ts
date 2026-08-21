import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { mapProduct, type ProductRow } from "@/lib/catalog";
import {
  adjustStockSchema,
  quickEditSchema,
  setStockSchema,
  statusSchema,
} from "@/lib/inventory-schemas";

const COLUMNS =
  "id, sku, slug, name, brand, category, price, compare_at, rating, reviews_count, stock, low_stock_threshold, condition, status, badge, views, blurb, specs";

/** Every listing, including drafts and archived ones. */
export const listInventory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("products")
      .select(COLUMNS)
      .order("name", { ascending: true });
    if (error) throw new Error(error.message);
    return (data as unknown as ProductRow[]).map(mapProduct);
  });

export const listStockMovements = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("stock_movements")
      .select("id, product_id, delta, resulting_stock, reason, note, created_at, products(name, sku)")
      .order("created_at", { ascending: false })
      .limit(40);
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as {
      id: string;
      product_id: string;
      delta: number;
      resulting_stock: number;
      reason: string;
      note: string | null;
      created_at: string;
      products: { name: string; sku: string } | null;
    }[];
  });

export const adjustStock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => adjustStockSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: current, error: readError } = await context.supabase
      .from("products")
      .select("stock")
      .eq("id", data.productId)
      .maybeSingle();
    if (readError) throw new Error(readError.message);
    if (!current) throw new Error("Product not found");

    const next = Math.max(0, current.stock + data.delta);

    const { error: updateError } = await context.supabase
      .from("products")
      .update({ stock: next })
      .eq("id", data.productId);
    if (updateError) throw new Error(updateError.message);

    const { error: logError } = await context.supabase.from("stock_movements").insert({
      product_id: data.productId,
      delta: next - current.stock,
      resulting_stock: next,
      reason: data.reason,
      note: data.note ?? null,
      created_by: context.userId,
    });
    if (logError) throw new Error(logError.message);

    return { stock: next };
  });

export const setStockLevel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => setStockSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: current, error: readError } = await context.supabase
      .from("products")
      .select("stock")
      .eq("id", data.productId)
      .maybeSingle();
    if (readError) throw new Error(readError.message);
    if (!current) throw new Error("Product not found");

    const { error } = await context.supabase
      .from("products")
      .update({ stock: data.stock, low_stock_threshold: data.lowStockThreshold })
      .eq("id", data.productId);
    if (error) throw new Error(error.message);

    if (data.stock !== current.stock) {
      await context.supabase.from("stock_movements").insert({
        product_id: data.productId,
        delta: data.stock - current.stock,
        resulting_stock: data.stock,
        reason: "correction",
        note: "Stock level set manually",
        created_by: context.userId,
      });
    }

    return { stock: data.stock };
  });

export const quickEditProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => quickEditSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("products")
      .update({ price: data.price, stock: data.stock })
      .eq("id", data.productId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setProductStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => statusSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("products")
      .update({ status: data.status })
      .in("id", data.productIds);
    if (error) throw new Error(error.message);
    return { count: data.productIds.length };
  });

