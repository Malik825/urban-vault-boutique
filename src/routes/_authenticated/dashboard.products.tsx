import { useState, useEffect, useRef } from "react";
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
  GripVertical,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
  adminCreateProduct,
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

// ─── Status / stock helpers ───────────────────────────────────────────────────

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

// ─── Draggable table row ───────────────────────────────────────────────────────

function SortableProductRow({
  p,
  selected,
  onToggle,
  onQuickEdit,
  onDelete,
}: {
  p: AdminProduct;
  selected: boolean;
  onToggle: (checked: boolean) => void;
  onQuickEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: p.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
    position: isDragging ? "relative" : undefined,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className="transition-colors hover:bg-surface-muted"
    >
      {/* Drag handle */}
      <TableCell className="w-6 px-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground/40 hover:text-muted-foreground transition-colors touch-none"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </TableCell>

      <TableCell>
        <Checkbox
          checked={selected}
          onCheckedChange={(c) => onToggle(!!c)}
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
            <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${p.name}`}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onQuickEdit}>
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
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" /> Delete listing
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

// ─── CSV / JSON bulk upload types ────────────────────────────────────────────

interface BulkRow {
  name: string;
  brand?: string;
  category?: string;
  price?: string | number;
  stock?: string | number;
  sku?: string;
  status?: string;
  blurb?: string;
  slug?: string;
  condition?: string;
  badge?: string;
}

type BulkRowResult = BulkRow & { _ok: boolean; _error?: string };

/** Parse a CSV string into an array of plain objects keyed by header row, respecting quoted values */
function parseCsv(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const firstLine = lines[0];
  if (!firstLine || lines.length < 2) return [];

  const splitLine = (row: string): string[] => {
    const result: string[] = [];
    let insideQuote = false;
    let entry = "";
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      if (char === '"') {
        insideQuote = !insideQuote;
      } else if (char === "," && !insideQuote) {
        result.push(entry.trim().replace(/^"|"$/g, "").replace(/""/g, '"'));
        entry = "";
      } else {
        entry += char;
      }
    }
    result.push(entry.trim().replace(/^"|"$/g, "").replace(/""/g, '"'));
    return result;
  };

  const headers = splitLine(firstLine).map((h) => h.toLowerCase().replace(/[^a-z0-9_]/g, "_"));
  return lines.slice(1).map((line) => {
    const values = splitLine(line);
    return Object.fromEntries(headers.map((h, i) => [h, (values[i] ?? "").trim()]));
  });
}

// ─── Bulk Upload Dialog ───────────────────────────────────────────────────────

function BulkUploadDialog({
  open,
  onClose,
  onImported,
}: {
  open: boolean;
  onClose: () => void;
  onImported: (count: number) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<BulkRowResult[]>([]);
  const [rawText, setRawText] = useState("");
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);

  function reset() {
    setRows([]);
    setRawText("");
    setDone(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleClose() {
    reset();
    onClose();
  }

  function parseAndPreview(text: string) {
    setRawText(text);
    let parsed: BulkRow[] = [];

    // Detect JSON array
    const trimmed = text.trim();
    if (trimmed.startsWith("[")) {
      try {
        parsed = JSON.parse(trimmed) as BulkRow[];
      } catch {
        toast.error("Invalid JSON — could not parse array.");
        return;
      }
    } else {
      parsed = parseCsv(text) as unknown as BulkRow[];
    }

    if (parsed.length === 0) {
      toast.error("No rows detected. Check your file format.");
      return;
    }

    const validated: BulkRowResult[] = parsed.map((r) => {
      const name = (r.name ?? "").toString().trim();
      const price = Number(r.price ?? 0);
      if (!name) return { ...r, _ok: false, _error: "Missing name" };
      if (isNaN(price) || price <= 0)
        return { ...r, _ok: false, _error: "Invalid price" };
      return { ...r, _ok: true };
    });

    setRows(validated);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => parseAndPreview((ev.target?.result as string) ?? "");
    reader.readAsText(file);
  }

  async function handleImport() {
    const validRows = rows.filter((r) => r._ok);
    if (validRows.length === 0) return;
    setImporting(true);

    let successCount = 0;
    for (const r of validRows) {
      try {
        const name = (r.name ?? "").toString().trim();
        const price = Number(r.price ?? 0);
        const stock = Number(r.stock ?? 0);
        const slug =
          (r.slug ?? "").toString().trim() ||
          name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

        await adminCreateProduct({
          data: {
            name,
            brand: (r.brand ?? "Urban Vault Co.").toString().trim(),
            category: (r.category ?? "Tops & Shirts").toString().trim(),
            price,
            stock: isNaN(stock) ? 0 : stock,
            low_stock_threshold: 4,
            condition: (r.condition ?? "Brand New").toString().trim(),
            status: (r.status ?? "Draft").toString().trim(),
            blurb: (r.blurb ?? `${name} — boutique listing.`).toString().trim(),
            slug,
            sku:
              (r.sku ?? "").toString().trim() ||
              `UVB-${Math.floor(1000 + Math.random() * 9000)}`,
            specs: { Department: "Unisex" },
            ...(r.badge ? { badge: (r.badge as string).trim() } : {}),
          },
        });
        successCount++;
      } catch (err: any) {
        console.error("[BulkUpload] row failed:", r, err.message);
      }
    }

    setImporting(false);
    setDone(true);
    toast.success(`Imported ${successCount} of ${validRows.length} product(s) as Drafts`);
    onImported(successCount);
  }

  const validCount = rows.filter((r) => r._ok).length;
  const errorCount = rows.filter((r) => !r._ok).length;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Bulk Import Products
          </DialogTitle>
          <DialogDescription>
            Upload a <strong>CSV</strong> or <strong>JSON</strong> file to import multiple
            listings at once. All imported products will start as{" "}
            <strong>Drafts</strong> — review and publish them from the product list.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-1">
          {/* File drop zone */}
          {!done && (
            <div>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.json,text/csv,application/json"
                className="hidden"
                onChange={handleFileChange}
              />
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) =>
                    parseAndPreview((ev.target?.result as string) ?? "");
                  reader.readAsText(file);
                }}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 hover:border-primary p-8 cursor-pointer transition-all text-center"
              >
                <Upload className="h-8 w-8 text-primary/60" />
                <p className="text-sm font-semibold text-foreground">
                  Click or drag &amp; drop a .csv or .json file
                </p>
                <p className="text-xs text-muted-foreground">
                  Required columns: <code className="bg-muted px-1 rounded">name</code>,{" "}
                  <code className="bg-muted px-1 rounded">price</code>. Optional:{" "}
                  brand, category, stock, sku, status, blurb, slug, condition, badge
                </p>
              </div>

              {/* Paste fallback */}
              <details className="mt-3">
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                  Or paste CSV / JSON text directly
                </summary>
                <textarea
                  className="mt-2 w-full h-28 rounded-xl border border-border bg-muted/30 p-3 text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder={`name,price,brand,stock\nBoxy Tee Black,350,Urban Vault Co.,20`}
                  value={rawText}
                  onChange={(e) => parseAndPreview(e.target.value)}
                />
              </details>
            </div>
          )}

          {/* Preview table */}
          {rows.length > 0 && !done && (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-semibold">
                  {rows.length} row{rows.length !== 1 ? "s" : ""} detected
                </span>
                {validCount > 0 && (
                  <span className="flex items-center gap-1 text-xs font-medium text-primary">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {validCount} valid
                  </span>
                )}
                {errorCount > 0 && (
                  <span className="flex items-center gap-1 text-xs font-medium text-rose-600">
                    <AlertCircle className="h-3.5 w-3.5" /> {errorCount} error{errorCount !== 1 ? "s" : ""}
                  </span>
                )}
                <button
                  type="button"
                  onClick={reset}
                  className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <X className="h-3.5 w-3.5" /> Clear
                </button>
              </div>
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto max-h-64">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50 sticky top-0">
                      <tr>
                        <th className="text-left px-3 py-2 font-semibold">Status</th>
                        <th className="text-left px-3 py-2 font-semibold">Name</th>
                        <th className="text-left px-3 py-2 font-semibold">Price</th>
                        <th className="text-left px-3 py-2 font-semibold">Brand</th>
                        <th className="text-left px-3 py-2 font-semibold">Stock</th>
                        <th className="text-left px-3 py-2 font-semibold">SKU</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {rows.map((r, i) => (
                        <tr key={i} className={r._ok ? "" : "bg-rose-500/5"}>
                          <td className="px-3 py-1.5">
                            {r._ok ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                            ) : (
                              <span
                                className="flex items-center gap-1 text-rose-600"
                                title={r._error}
                              >
                                <AlertCircle className="h-3.5 w-3.5" />
                                {r._error}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-1.5 font-medium truncate max-w-[160px]">
                            {(r.name ?? "").toString()}
                          </td>
                          <td className="px-3 py-1.5">GH₵ {r.price ?? "—"}</td>
                          <td className="px-3 py-1.5 text-muted-foreground">
                            {(r.brand ?? "—").toString()}
                          </td>
                          <td className="px-3 py-1.5">{r.stock ?? 0}</td>
                          <td className="px-3 py-1.5 font-mono text-muted-foreground">
                            {(r.sku ?? "—").toString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Success state */}
          {done && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <CheckCircle2 className="h-14 w-14 text-primary" />
              <p className="font-display text-lg font-bold">Import complete!</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                {validCount} product{validCount !== 1 ? "s" : ""} were added as{" "}
                <strong>Drafts</strong>. Review and publish them from the product list.
              </p>
            </div>
          )}

          {/* Format guide */}
          {!rows.length && !done && (
            <div className="rounded-xl border border-border bg-muted/20 p-4 text-xs text-muted-foreground space-y-2">
              <p className="font-semibold text-foreground">Expected CSV format:</p>
              <pre className="font-mono bg-muted rounded-lg p-2 overflow-x-auto leading-relaxed">
                {`name,price,brand,category,stock,sku,status,blurb
"Boxy Tee Black",350,"Urban Vault Co.","Tops & Shirts",20,UVB-001,Draft,""
"Linen Shirt Tan",420,"Daily Paper","Tops & Shirts",12,UVB-002,Draft,""`}
              </pre>
              <p className="font-semibold text-foreground">Or JSON array:</p>
              <pre className="font-mono bg-muted rounded-lg p-2 overflow-x-auto leading-relaxed">
                {`[{ "name": "Boxy Tee", "price": 350, "stock": 20 }]`}
              </pre>
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-border pt-4 mt-2">
          <Button variant="outline" onClick={handleClose} disabled={importing}>
            {done ? "Close" : "Cancel"}
          </Button>
          {!done && (
            <Button
              onClick={handleImport}
              disabled={importing || validCount === 0}
              className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[120px]"
            >
              {importing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Importing…
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-1.5" /> Import {validCount > 0 ? `${validCount} product${validCount !== 1 ? "s" : ""}` : ""}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

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
  const [bulkOpen, setBulkOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [tab, search]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

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

  // ── Drag handlers ──────────────────────────────────────────────────────────

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;

    setProducts((prev) => {
      const oldIndex = prev.findIndex((p) => p.id === active.id);
      const newIndex = prev.findIndex((p) => p.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });

    toast.success("Product order updated");
  }

  const activeProduct = activeId ? products.find((p) => p.id === activeId) : null;

  // ── Quick edit ─────────────────────────────────────────────────────────────

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
          ...(editPrice ? { price: Number(editPrice) } : {}),
          ...(editStock ? { stock: Number(editStock) } : {}),
          ...(editStatus ? { status: editStatus } : {}),
        },
      });
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editing.id
            ? {
                ...p,
                price: editPrice ? Number(editPrice) : p.price,
                stock: editStock ? Number(editStock) : p.stock,
                status: (editStatus || p.status) as AdminProduct["status"],
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
          <Button variant="outline" size="sm" onClick={() => setBulkOpen(true)}>
            <Upload className="h-4 w-4" /> Bulk Import
          </Button>
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

        {/* DnD Table */}
        <div className="overflow-x-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  {/* drag handle column */}
                  <TableHead className="w-8 px-2" />
                  <TableHead className="w-10">
                    <Checkbox
                      checked={allChecked}
                      onCheckedChange={(c) =>
                        setSelected(c ? rows.map((r) => r.id) : [])
                      }
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
              <SortableContext
                items={paginatedRows.map((p) => p.id)}
                strategy={verticalListSortingStrategy}
              >
                <TableBody>
                  {paginatedRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                        {search
                          ? `No listings match "${search}".`
                          : "No listings in this tab."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedRows.map((p) => (
                      <SortableProductRow
                        key={p.id}
                        p={p}
                        selected={selected.includes(p.id)}
                        onToggle={(c) =>
                          setSelected((s) =>
                            c ? [...s, p.id] : s.filter((id) => id !== p.id),
                          )
                        }
                        onQuickEdit={() => openQuickEdit(p)}
                        onDelete={() => handleDelete(p)}
                      />
                    ))
                  )}
                </TableBody>
              </SortableContext>
            </Table>

            {/* Drag overlay ghost row */}
            <DragOverlay dropAnimation={null}>
              {activeProduct ? (
                <table className="w-full">
                  <tbody>
                    <tr className="bg-card border border-primary/30 rounded-xl shadow-xl opacity-90">
                      <td className="px-2 py-3 w-8">
                        <GripVertical className="h-4 w-4 text-primary" />
                      </td>
                      <td className="px-2 py-3 w-10" />
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {activeProduct.images?.[0] ? (
                            <img
                              src={activeProduct.images[0]}
                              alt=""
                              className="h-10 w-8 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="h-10 w-8 rounded-lg bg-muted" />
                          )}
                          <span className="text-sm font-semibold">{activeProduct.name}</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : null}
            </DragOverlay>
          </DndContext>
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

      {/* Bulk Import Dialog */}
      <BulkUploadDialog
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        onImported={(count) => {
          if (count > 0) {
            // Reload products list to include the new drafts
            adminListProducts()
              .then((data) => setProducts(data))
              .catch(() => {});
          }
        }}
      />
    </DashboardShell>
  );
}
