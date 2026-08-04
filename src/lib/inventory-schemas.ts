import { z } from "zod";

export const stockReasons = [
  "restock",
  "sale",
  "return",
  "damaged",
  "correction",
  "transfer",
] as const;

export const adjustStockSchema = z.object({
  productId: z.string().uuid(),
  delta: z.number().int().min(-10000).max(10000).refine((v) => v !== 0, "Enter a non-zero amount"),
  reason: z.enum(stockReasons),
  note: z.string().trim().max(200).optional(),
});

export const setStockSchema = z.object({
  productId: z.string().uuid(),
  stock: z.number().int().min(0).max(100000),
  lowStockThreshold: z.number().int().min(0).max(1000),
});

export const quickEditSchema = z.object({
  productId: z.string().uuid(),
  price: z.number().int().min(0).max(1_000_000_000),
  stock: z.number().int().min(0).max(100000),
});

export const statusSchema = z.object({
  productIds: z.array(z.string().uuid()).min(1).max(200),
  status: z.enum(["Published", "Draft", "Archived"]),
});

export type AdjustStockInput = z.infer<typeof adjustStockSchema>;
export type SetStockInput = z.infer<typeof setStockSchema>;
export type QuickEditInput = z.infer<typeof quickEditSchema>;
export type StatusInput = z.infer<typeof statusSchema>;
