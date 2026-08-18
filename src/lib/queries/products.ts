import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters: object) => [...productKeys.lists(), filters] as const,
  detail: (slug: string) => [...productKeys.all, "detail", slug] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

/** Admin: fetch all products (all statuses) */
export function useAdminProducts() {
  return useQuery({
    queryKey: productKeys.lists(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ProductRow[];
    },
  });
}

/** Public: fetch a single product by slug */
export function useProduct(slug: string) {
  return useQuery({
    queryKey: productKeys.detail(slug),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .eq("status", "Published")
        .single();
      if (error) throw error;
      return data as ProductRow;
    },
  });
}

/** Admin: create a new product */
export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (product: ProductInsert) => {
      const { data, error } = await supabase
        .from("products")
        .insert(product)
        .select()
        .single();
      if (error) throw error;
      return data as ProductRow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

/** Admin: update an existing product */
export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...update }: ProductUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("products")
        .update(update)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as ProductRow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

/** Admin: delete a product */
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}
