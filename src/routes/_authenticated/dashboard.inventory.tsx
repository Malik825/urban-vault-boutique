import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, ArrowDown, ArrowUp, History, PackageCheck, Search } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { adjustStock, listInventory, listStockMovements, setStockLevel } from "@/lib/inventory.functions";
import { stockReasons } from "@/lib/inventory-schemas";
import type { CatalogProduct } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/dashboard/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory & stock control — Voltix" },
      {
        name: "description",
        content:
          "Adjust stock levels, set low-stock thresholds and review an audited history of every inventory movement in your store.",
      },
      { property: "og:title", content: "Inventory & stock control — Voltix" },
      { property: "og:description", content: "Audited stock adjustments for every listing." },
    ],
  }),
  component: InventoryPage,
});

function InventoryPage() {
  const queryClient = useQueryClient();
  const fetchInventory = useServerFn(listInventory);
  const fetchMovements = useServerFn(listStockMovements);
  const adjust = useServerFn(adjustStock);
  const setLevel = useServerFn(setStockLevel);

  const [q, setQ] = useState("");
  const [reason, setReason] = useState<(typeof stockReasons)[number]>("restock");
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const inventory = useQuery({ queryKey: ["inventory"], queryFn: () => fetchInventory({}) });
  const movements = useQuery({ queryKey: ["stock-movements"], queryFn: () => fetchMovements({}) });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["inventory"] });
    void queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
    void queryClient.invalidateQueries({ queryKey: ["catalog"] });
  };

  const adjustMutation = useMutation({
    mutationFn: (vars: { productId: string; delta: number }) =>
      adjust({ data: { ...vars, reason } }),
    onSuccess: (res) => {
      toast.success(`Stock updated — ${res.stock} units on hand`);
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const levelMutation = useMutation({
    mutationFn: (vars: { productId: string; stock: number; lowStockThreshold: number }) =>
      setLevel({ data: vars }),
    onSuccess: () => {
      toast.success("Stock level saved");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = useMemo(() => {
    const list = inventory.data ?? [];
    const needle = q.trim().toLowerCase();
    const filtered = needle
      ? list.filter(
          (p) =>
            p.name.toLowerCase().includes(needle) ||
            p.brand.toLowerCase().includes(needle) ||
            p.id.toLowerCase().includes(needle),
        )
      : list;
    return [...filtered].sort((a, b) => a.stock - b.stock);
  }, [inventory.data, q]);

  const all = inventory.data ?? [];
  const outOfStock = all.filter((p) => p.stock === 0).length;
  const lowStock = all.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold).length;
  const totalUnits = all.reduce((sum, p) => sum + p.stock, 0);

  return (
    <DashboardShell
      title="Inventory"
      subtitle="Live stock levels, thresholds and an audit trail of every movement"
      actions={
        <div className="flex items-center gap-2">
          <Label htmlFor="reason" className="hidden text-xs text-muted-foreground sm:block">
            Movement reason
          </Label>
          <Select value={reason} onValueChange={(v) => setReason(v as typeof reason)}>
            <SelectTrigger id="reason" size="sm" className="w-[140px] capitalize">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {stockReasons.map((r) => (
                <SelectItem key={r} value={r} className="capitalize">
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Units on hand" value={totalUnits.toLocaleString()} icon={PackageCheck} />
        <Stat label="Low stock" value={String(lowStock)} icon={AlertTriangle} tone="warning" />
        <Stat label="Out of stock" value={String(outOfStock)} icon={ArrowDown} tone="destructive" />
      </div>

      <div className="mt-6 rounded-lg border border-border bg-card">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search listings…"
              className="pl-9"
              aria-label="Search inventory"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Adjustments are logged as <span className="font-medium capitalize">{reason}</span>
          </p>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Listing</TableHead>
                <TableHead>Stock health</TableHead>
                <TableHead className="text-center">Adjust</TableHead>
                <TableHead className="w-[220px]">Set exact level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.isLoading && (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                    Loading inventory…
                  </TableCell>
                </TableRow>
              )}
              {rows.map((p) => (
                <InventoryRow
                  key={p.dbId}
                  product={p}
                  draft={drafts[p.dbId] ?? ""}
                  onDraft={(v) => setDrafts((d) => ({ ...d, [p.dbId]: v }))}
                  onAdjust={(delta) => adjustMutation.mutate({ productId: p.dbId, delta })}
                  onSave={(stock, threshold) =>
                    levelMutation.mutate({
                      productId: p.dbId,
                      stock,
                      lowStockThreshold: threshold,
                    })
                  }
                  busy={adjustMutation.isPending || levelMutation.isPending}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border p-4">
          <History className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Movement history</h2>
        </div>
        <ul className="divide-y divide-border">
          {(movements.data ?? []).map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-surface-muted"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{m.products?.name ?? "Listing"}</p>
                <p className="truncate text-xs capitalize text-muted-foreground">
                  {m.reason}
                  {m.note ? ` · ${m.note}` : ""} · {new Date(m.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span
                  className={`flex items-center gap-1 text-sm font-semibold ${
                    m.delta > 0 ? "text-primary" : "text-destructive"
                  }`}
                >
                  {m.delta > 0 ? (
                    <ArrowUp className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowDown className="h-3.5 w-3.5" />
                  )}
                  {Math.abs(m.delta)}
                </span>
                <span className="text-xs text-muted-foreground">→ {m.resulting_stock}</span>
              </div>
            </li>
          ))}
          {(movements.data ?? []).length === 0 && !movements.isLoading && (
            <li className="px-4 py-10 text-center text-sm text-muted-foreground">
              No stock movements recorded yet.
            </li>
          )}
        </ul>
      </div>
    </DashboardShell>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: typeof PackageCheck;
  tone?: "warning" | "destructive";
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 transition-transform duration-300 hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <Icon
          className={`h-4 w-4 ${
            tone === "warning"
              ? "text-warning-foreground"
              : tone === "destructive"
                ? "text-destructive"
                : "text-primary"
          }`}
        />
      </div>
      <p className="mt-2 text-2xl font-extrabold">{value}</p>
    </div>
  );
}

function InventoryRow({
  product,
  draft,
  onDraft,
  onAdjust,
  onSave,
  busy,
}: {
  product: CatalogProduct;
  draft: string;
  onDraft: (v: string) => void;
  onAdjust: (delta: number) => void;
  onSave: (stock: number, threshold: number) => void;
  busy: boolean;
}) {
  const [threshold, setThreshold] = useState(String(product.lowStockThreshold));
  const health =
    product.stock === 0 ? "Out of stock" : product.stock <= product.lowStockThreshold ? "Low" : "Healthy";
  const pct = Math.min(100, Math.round((product.stock / Math.max(1, product.lowStockThreshold * 4)) * 100));

  return (
    <TableRow className="transition-colors hover:bg-surface-muted">
      <TableCell>
        <div className="flex min-w-0 items-center gap-3">
          <img
            src={product.images[0]}
            alt=""
            loading="lazy"
            className="h-10 w-10 shrink-0 rounded-md object-cover"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{product.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {product.brand} · {product.id}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="w-40">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold">{product.stock} units</span>
            <Badge
              variant="secondary"
              className={
                health === "Healthy"
                  ? "border-transparent bg-primary-soft text-accent-foreground"
                  : health === "Low"
                    ? "border-transparent bg-warning/20 text-warning-foreground"
                    : "border-transparent bg-destructive/10 text-destructive"
              }
            >
              {health}
            </Badge>
          </div>
          <Progress value={pct} className="mt-2 h-1.5" />
          <p className="mt-1 text-[11px] text-muted-foreground">
            Alert below {product.lowStockThreshold}
          </p>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-center gap-1.5">
          <Button
            size="icon-sm"
            variant="outline"
            aria-label={`Remove one ${product.name}`}
            disabled={busy || product.stock === 0}
            onClick={() => onAdjust(-1)}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
          <Input
            value={draft}
            onChange={(e) => onDraft(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="Qty"
            className="h-8 w-16 text-center"
            aria-label={`Quantity to move for ${product.name}`}
          />
          <Button
            size="sm"
            variant="soft"
            disabled={busy || !draft}
            onClick={() => onAdjust(Number(draft))}
          >
            Add
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={busy || !draft}
            onClick={() => onAdjust(-Number(draft))}
          >
            Remove
          </Button>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          <Input
            defaultValue={String(product.stock)}
            id={`stock-${product.dbId}`}
            className="h-8 w-16"
            aria-label={`Exact stock for ${product.name}`}
          />
          <Input
            value={threshold}
            onChange={(e) => setThreshold(e.target.value.replace(/[^0-9]/g, ""))}
            className="h-8 w-16"
            aria-label={`Low stock threshold for ${product.name}`}
          />
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => {
              const el = document.getElementById(`stock-${product.dbId}`) as HTMLInputElement | null;
              const next = Number(el?.value ?? product.stock);
              if (!Number.isFinite(next) || next < 0) {
                toast.error("Enter a valid stock number");
                return;
              }
              onSave(next, Number(threshold || 0));
            }}
          >
            Save
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
