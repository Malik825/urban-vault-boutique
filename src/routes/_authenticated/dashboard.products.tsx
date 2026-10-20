import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Download,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  FileEdit,
  ChevronLeft,
  ChevronRight,
  Search,
  Tag,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { formatPrice } from "@/lib/store-data";
import {
  adminListProducts,
  adminDeleteProduct,
  adminUpdateProduct,
} from "@/lib/admin.functions";

type AdminProduct = Awaited<ReturnType<typeof adminListProducts>>[number];

export const Route = createFileRoute("/_authenticated/dashboard/products")({
  head: () => ({
    meta: [
      { title: "Boutique Products — Urban Vault Admin" },
      {
        name: "description",
        content:
          "Manage your boutique fashion catalogue: bulk actions, quick edits, stock status, drafts and live inventory.",
      },
      { property: "og:title", content: "Boutique Products — Urban Vault Admin" },
      {
        property: "og:description",
        content: "Manage boutique inventory and live fashion listings.",
      },
    ],
  }),
  loader: async () => {
    try {
      return await adminListProducts();
    } catch (e) {
      console.error("[ProductsLoader] Error loading products:", e);
      return [];
    }
  },
  component: ProductsAdmin,
});

const tabs = ["All", "Published", "Draft", "Archived"] as const;

/** Map a product status to badge colours */
function StatusBadge({ status }: { status: string }) {
  if (status === "Published")
    return (
      <Badge className="border-transparent bg-primary/15 text-primary font-semibold">
        Published
      </Badge>
    );
  if (status === "Draft")
    return (
      <Badge className="border-transparent bg-amber-400/15 text-amber-700 dark:text-amber-400 font-semibold">
        Draft
      </Badge>
    );
  return (
    <Badge variant="secondary" className="font-semibold">
      {status}
    </Badge>
  );
}

/** Stock indicator with colour-coded urgency */
function StockCell({ stock }: { stock: number }) {
  if (stock === 0)
    return <span className="text-sm font-medium text-muted-foreground">Out of stock</span>;
  if (stock <= 4)
    return (
      <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
        {stock} left!
      </span>
    );
  return <span className="text-sm font-medium">{stock} units</span>;
}

function ProductsAdmin() {
  const allProducts = Route.useLoaderData() as AdminProduct[];
  const [tab, setTab] = useState<"All" | "Published" | "Draft" | "Archived">("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [products, setProducts] = useState<AdminProduct[]>(allProducts);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [saving, setSaving] = useState(false);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [tab, search]);

  const rows = products.filter((p) => {
    const matchTab = tab === "All" || p.status === tab;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      p.name?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  const allChecked = rows.length > 0 && rows.every((r) => selected.includes(r.id));
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const paginatedRows = rows.slice((safePage - 1) * pageSize, safePage * pageSize);

  function openQuickEdit(p: AdminProduct) {
    setEditing(p);
    setEditPrice(String(p.price ?? ""));
    setEditStock(String(p.stock ?? ""));
    setEditStatus(p.status ?? "Published");
  }

  async function handleSaveQuickEdit() {
    if (!editing) return;
    setSaving(true);
    try {
      await adminUpdateProduct({
        data: {
          id: editing.dbId || editing.id,
          price: editPrice ? Number(editPrice) : undefined,
          stock: editStock ? Number(editStock) : undefined,
          status: editStatus || undefined,
        },
      });
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editing.id
            ? {
                ...p,
                price: editPrice ? Number(editPrice) : p.price,
                stock: editStock ? Number(editStock) : p.stock,
                status: editStatus || p.status,
              }
            : p,
        ),
      );
      setEditing(null);
      toast.success("Listing updated");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update listing");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(p: AdminProduct) {
    try {
      await adminDeleteProduct({ data: { id: p.dbId || p.id } });
      setProducts((prev) => prev.filter((x) => x.id !== p.id));
      toast.success("Product removed from catalogue");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete product");
    }
  }

  return (
    <DashboardShell
      title="Products"
      subtitle={`${products.length} listings across the boutique catalogue`}
      actions={
        <>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Button asChild variant="hero" size="sm">
            <Link to="/dashboard/new-product">
              <Plus className="h-4 w-4" /> Add listing
            </Link>
          </Button>
        </>
      }
    >
      <div className="rounded-2xl border border-border bg-card shadow-card">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={tab} onValueChange={(v) => setTab(v as (typeof tabs)[number])}>
            <TabsList className="rounded-xl bg-surface-muted p-1">
              {tabs.map((t) => (
                <TabsTrigger key={t} value={t} className="rounded-lg px-3 text-xs sm:text-sm">
                  {t}
                  {t !== "All" && (
                    <span className="ml-1.5 rounded-full bg-muted px-1.5 py-px text-[10px] font-semibold text-muted-foreground">
                      {products.filter((p) => p.status === t).length}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search name, brand, category…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 w-48 text-xs rounded-lg"
              />
            </div>

            {selected.length > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {selected.length} selected
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={() => toast.success(`${selected.length} listings published`)}
                >
                  Publish
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={() => toast.success(`${selected.length} listings archived`)}
                >
                  Archive
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-destructive"
                  onClick={() => setSelected([])}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={allChecked}
                    onCheckedChange={(c) => setSelected(c ? rows.map((r) => r.id) : [])}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    {search
                      ? `No listings match "${search}".`
                      : "No listings in this tab."}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRows.map((p) => (
                  <TableRow key={p.id} className="transition-colors hover:bg-surface-muted">
                    <TableCell>
                      <Checkbox
                        checked={selected.includes(p.id)}
                        onCheckedChange={(c) =>
                          setSelected((s) =>
                            c ? [...s, p.id] : s.filter((id) => id !== p.id),
                          )
                        }
                        aria-label={`Select ${p.name}`}
                      />
                    </TableCell>

                    {/* Product cell */}
                    <TableCell>
                      <div className="flex min-w-0 items-center gap-3">
                        {p.images?.[0] ? (
                          <img
                            src={p.images[0]}
                            alt=""
                            loading="lazy"
                            className="h-11 w-9 shrink-0 rounded-lg border border-border object-cover object-top"
                          />
                        ) : (
                          <div className="h-11 w-9 shrink-0 rounded-lg border border-border bg-surface-muted" />
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{p.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {p.brand}
                            {(p.specs as any)?.["Sizes"] && (
                              <> · <Tag className="inline h-3 w-3 -mt-px" /> {(p.specs as any)["Sizes"]}</>
                            )}
                          </p>
                          <p className="text-[10px] text-muted-foreground/60 font-mono mt-0.5">
                            {p.sku || p.id.slice(0, 12) + "…"}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Category */}
                    <TableCell>
                      <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2 py-0.5 text-xs font-medium text-foreground">
                        {p.category ?? "—"}
                      </span>
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={p.status ?? "Draft"} />
                    </TableCell>

                    <TableCell>
                      <StockCell stock={p.stock ?? 0} />
                    </TableCell>

                    <TableCell className="text-right">
                      <span className="text-sm font-semibold">{formatPrice(p.price)}</span>
                      {p.compareAt && (
                        <span className="ml-1.5 text-xs text-muted-foreground line-through">
                          {formatPrice(p.compareAt)}
                        </span>
                      )}
                    </TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Actions for ${p.name}`}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openQuickEdit(p)}>
                            <Pencil className="h-4 w-4" /> Quick edit
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              to="/dashboard/product/$id/edit"
                              params={{ id: p.dbId || p.id }}
                            >
                              <FileEdit className="h-4 w-4" /> Edit full listing
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to="/product/$slug" params={{ slug: p.slug! }}>
                              View on storefront
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(p)}
                          >
                            <Trash2 className="h-4 w-4" /> Delete listing
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {rows.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border p-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <Select
                value={String(pageSize)}
                onValueChange={(val) => {
                  setPageSize(Number(val));
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-16">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="ml-2">
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, rows.length)}
                </span>{" "}
                of <span className="font-semibold text-foreground">{rows.length}</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-8 gap-1 text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Previous
              </Button>
              <span className="font-medium text-foreground px-2">
                Page {safePage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="h-8 gap-1 text-xs"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Edit Dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Quick edit listing</DialogTitle>
            <DialogDescription className="truncate">{editing?.name}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="qe-price">Price (GH₵)</Label>
              <Input
                id="qe-price"
                type="number"
                min="0"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                className="rounded-xl"
                placeholder="320"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qe-stock">Units in stock</Label>
              <Input
                id="qe-stock"
                type="number"
                min="0"
                value={editStock}
                onChange={(e) => setEditStock(e.target.value)}
                className="rounded-xl"
                placeholder="15"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Listing status</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Published">Published — live on storefront</SelectItem>
                  <SelectItem value="Draft">Draft — hidden from shoppers</SelectItem>
                  <SelectItem value="Archived">Archived — removed from catalogue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)} disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveQuickEdit}
              disabled={saving}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
