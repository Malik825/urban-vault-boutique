import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, ImagePlus, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { formatPrice, products, type Product } from "@/lib/store-data";

export const Route = createFileRoute("/dashboard/products")({
  head: () => ({
    meta: [
      { title: "Products — Voltix seller dashboard" },
      {
        name: "description",
        content:
          "Manage your electronics catalogue: bulk actions, quick edits, stock status, drafts and archived listings.",
      },
      { property: "og:title", content: "Products — Voltix seller dashboard" },
      { property: "og:description", content: "Bulk actions, quick edit and live stock status." },
    ],
  }),
  component: ProductsAdmin,
});

const tabs = ["All", "Published", "Draft", "Archived"] as const;

function ProductsAdmin() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("All");
  const [selected, setSelected] = useState<string[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);

  const rows = products.filter((p) => (tab === "All" ? true : p.status === tab));
  const allChecked = rows.length > 0 && rows.every((r) => selected.includes(r.id));

  return (
    <DashboardShell
      title="Products"
      subtitle={`${products.length} listings across 4 categories`}
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
              {rows.map((p) => (
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
                      <img
                        src={p.images[0]}
                        alt=""
                        loading="lazy"
                        className="h-10 w-10 shrink-0 rounded-lg border border-border object-cover"
                      />
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
                        <DropdownMenuItem onClick={() => setEditing(p)}>
                          <Pencil className="h-4 w-4" /> Quick edit
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/product/$slug" params={{ slug: p.slug }}>
                            View on storefront
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => toast.success("Listing archived")}
                        >
                          <Trash2 className="h-4 w-4" /> Archive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quick edit</DialogTitle>
            <DialogDescription>{editing?.name}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="qe-price">Price (₦)</Label>
              <Input id="qe-price" defaultValue={editing?.price} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qe-stock">Stock</Label>
              <Input id="qe-stock" defaultValue={editing?.stock} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setEditing(null);
                toast.success("Listing updated");
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
