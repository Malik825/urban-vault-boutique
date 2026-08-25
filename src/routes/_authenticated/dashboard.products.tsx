import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, ImagePlus, MoreHorizontal, Pencil, Plus, Trash2, FileEdit, ChevronLeft, ChevronRight } from "lucide-react";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { formatPrice } from "@/lib/store-data";
import { adminListProducts, adminDeleteProduct, adminUpdateProduct } from "@/lib/admin.functions";

type AdminProduct = Awaited<ReturnType<typeof adminListProducts>>[number];

export const Route = createFileRoute("/_authenticated/dashboard/products")({
  head: () => ({
    meta: [
      { title: "Products — Voltix seller dashboard" },
      {
        name: "description",
        content:
          "Manage your electronics catalogue: bulk actions, quick edits, stock status, drafts and archived listings.",
      },
      { property: "og:title", content: "Products — Voltix" },
      { property: "og:description", content: "Manage catalogue items and live stock." },
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

function ProductsAdmin() {
  const allProducts = Route.useLoaderData() as AdminProduct[];
  const [tab, setTab] = useState<"All" | "Published" | "Draft" | "Archived">("All");
  const [selected, setSelected] = useState<string[]>([]);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [products, setProducts] = useState<AdminProduct[]>(allProducts);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const rows = products.filter((p) => (tab === "All" ? true : p.status === tab));
  const allChecked = rows.length > 0 && rows.every((r) => selected.includes(r.id));

  // Reset page when tab changes
  useEffect(() => {
    setPage(1);
  }, [tab]);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const paginatedRows = rows.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <DashboardShell
      title="Products"
      subtitle={`${products.length} listings across the catalogue`}
      actions={
        <>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Button asChild variant="hero" size="sm">
            <Link to="/dashboard/new-product">
              <Plus className="h-4 w-4" /> Add product
            </Link>
          </Button>
        </>
      }
    >
      <div className="rounded-2xl border border-border bg-card shadow-card">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={tab} onValueChange={(v) => setTab(v as (typeof tabs)[number])}>
            <TabsList className="rounded-xl bg-surface-muted p-1">
              {tabs.map((t) => (
                <TabsTrigger key={t} value={t} className="rounded-lg px-3 text-xs sm:text-sm">
                  {t}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          {selected.length > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                {selected.length} selected
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.success(`${selected.length} listings published`)}
              >
                Publish
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.success(`${selected.length} listings archived`)}
              >
                Archive
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelected([])}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm">
              <ImagePlus className="h-4 w-4" /> Bulk image upload
            </Button>
          )}
        </div>

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
                <TableHead>Status</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    No products found in this tab.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRows.map((p) => (
                  <TableRow key={p.id} className="transition-colors hover:bg-surface-muted">
                    <TableCell>
                      <Checkbox
                        checked={selected.includes(p.id)}
                        onCheckedChange={(c) =>
                          setSelected((s) => (c ? [...s, p.id] : s.filter((id) => id !== p.id)))
                        }
                        aria-label={`Select ${p.name}`}
                      />
                    </TableCell>
                    <TableCell>
                        <div className="flex min-w-0 items-center gap-3">
                        {p.images?.[0] ? (
                          <img
                            src={p.images[0]}
                            alt=""
                            loading="lazy"
                            className="h-10 w-10 shrink-0 rounded-lg border border-border object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 shrink-0 rounded-lg border border-border bg-surface-muted" />
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{p.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {p.brand} · {p.id}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={p.status === "Published" ? "default" : "secondary"}
                        className={
                          p.status === "Published"
                            ? "border-transparent bg-primary-soft text-accent-foreground"
                            : ""
                        }
                      >
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-sm font-medium ${
                          p.stock === 0
                            ? "text-muted-foreground"
                            : p.stock <= 4
                              ? "text-warning-foreground"
                              : ""
                        }`}
                      >
                        {p.stock === 0 ? "Out of stock" : `${p.stock} units`}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold">
                      {formatPrice(p.price)}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {p.views.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" aria-label="Row actions">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditing(p); setEditPrice(String(p.price ?? "")); setEditStock(String(p.stock ?? "")); }}>
                            <Pencil className="h-4 w-4" /> Quick edit
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to="/dashboard/product/$id/edit" params={{ id: p.dbId || p.id }}>
                              <FileEdit className="h-4 w-4" /> Edit full listing
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to="/product/$slug" params={{ slug: p.slug! }}>
                              View on storefront
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={async () => {
                              try {
                                await adminDeleteProduct({ data: { id: p.dbId || p.id } });
                                setProducts((prev) => prev.filter((x) => x.id !== p.id));
                                toast.success("Product deleted");
                              } catch (err: any) {
                                toast.error(err?.message || "Failed to delete product");
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" /> Delete
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

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quick edit</DialogTitle>
            <DialogDescription>{editing?.name}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="qe-price">Price (GH₵)</Label>
              <Input id="qe-price" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qe-stock">Stock</Label>
              <Input id="qe-stock" value={editStock} onChange={(e) => setEditStock(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!editing) return;
                try {
                  await adminUpdateProduct({
                    data: {
                      id: editing.dbId || editing.id,
                      price: editPrice ? Number(editPrice) : undefined,
                      stock: editStock ? Number(editStock) : undefined,
                    },
                  });
                  setProducts((prev) =>
                    prev.map((p) =>
                      p.id === editing.id
                        ? { ...p, price: editPrice ? Number(editPrice) : p.price, stock: editStock ? Number(editStock) : p.stock }
                        : p,
                    ),
                  );
                  setEditing(null);
                  toast.success("Product updated");
                } catch (err: any) {
                  toast.error(err?.message || "Failed to update product");
                }
              }}
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
