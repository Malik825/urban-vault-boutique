import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronRight,
  LayoutGrid,
  List,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/storefront/product-card";
import { SiteFooter } from "@/components/storefront/site-footer";
import { SiteHeader } from "@/components/storefront/site-header";
import { filterOptions, formatPrice } from "@/lib/store-data";
import { listPublishedProducts } from "@/lib/catalog.functions";
import type { CatalogProduct } from "@/lib/catalog";

type ProductSearch = {
  q?: string | undefined;
  brand?: string | undefined;
  category?: string | undefined;
  deals?: boolean | undefined;
  sort?: string | undefined;
};

export const Route = createFileRoute("/products")({
  validateSearch: (search: Record<string, unknown>): ProductSearch => ({
    q: typeof search["q"] === "string" ? (search["q"] as string) : undefined,
    brand: typeof search["brand"] === "string" ? (search["brand"] as string) : undefined,
    category: typeof search["category"] === "string" ? (search["category"] as string) : undefined,
    deals: search["deals"] === true || search["deals"] === "true" ? true : undefined,
    sort: typeof search["sort"] === "string" ? (search["sort"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Shop all devices — Voltix electronics catalogue" },
      {
        name: "description",
        content:
          "Filter laptops, phones, tablets and accessories by brand, price, RAM, storage, processor and condition. Live stock and instant WhatsApp enquiry.",
      },
      { property: "og:title", content: "Shop all devices — Voltix" },
      {
        property: "og:description",
        content: "Rich filters, live stock levels and instant WhatsApp enquiries on every listing.",
      },
    ],
  }),
  loader: async (): Promise<CatalogProduct[]> => listPublishedProducts(),
  component: Listing,
});

const MAX_PRICE = 2800000;

function Listing() {
  const products: CatalogProduct[] = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate();

  const [view, setView] = useState<"grid" | "list">("grid");
  const [query, setQuery] = useState(search.q ?? "");
  const [sort, setSort] = useState(search.sort ?? "relevance");
  const [price, setPrice] = useState<number[]>([0, MAX_PRICE]);
  const [sel, setSel] = useState<Record<string, string[]>>({
    brand: search.brand ? [search.brand] : [],
    category: search.category ? [search.category] : [],
    condition: [],
    ram: [],
    storage: [],
    processor: [],
    screen: [],
    availability: [],
  });

  const toggle = (group: string, value: string) =>
    setSel((s) => {
      const list = s[group] ?? [];
      return {
        ...s,
        [group]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
      };
    });

  const activeCount =
    Object.values(sel).flat().length + (price[0]! > 0 || price[1]! < MAX_PRICE ? 1 : 0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.filter((p) => p.status === "Published");
    if (search.deals) list = list.filter((p) => p.compareAt);
    if (q)
      list = list.filter((p) =>
        `${p.name} ${p.brand} ${p.category} ${Object.values(p.specs).join(" ")}`
          .toLowerCase()
          .includes(q),
      );
    const has = (g: string, v: string) => (sel[g]?.length ? sel[g]!.includes(v) : true);
    list = list.filter(
      (p) =>
        has("brand", p.brand) &&
        has("category", p.category) &&
        has("condition", p.condition) &&
        (sel["ram"]?.length ? sel["ram"].includes(p.specs["RAM"] ?? "") : true) &&
        (sel["storage"]?.length ? sel["storage"].includes(p.specs["Storage"] ?? "") : true) &&
        (sel["processor"]?.length
          ? sel["processor"].some((v) => (p.specs["Processor"] ?? "").includes(v))
          : true) &&
        (sel["screen"]?.length ? sel["screen"].includes(p.specs["Screen Size"] ?? "") : true) &&
        (sel["availability"]?.includes("In stock") ? p.stock > 0 : true) &&
        p.price >= price[0]! &&
        p.price <= price[1]!,
    );
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    if (sort === "newest") list = [...list].reverse();
    return list;
  }, [query, sel, price, sort, search.deals]);

  const filters = (
    <div className="space-y-6">
      <FilterGroup title="Price">
        <Slider
          value={price}
          onValueChange={setPrice}
          min={0}
          max={MAX_PRICE}
          step={50000}
          className="mt-2"
        />
        <div className="mt-3 flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>{formatPrice(price[0]!)}</span>
          <span>{formatPrice(price[1]!)}</span>
        </div>
      </FilterGroup>

      <CheckGroup title="Brand" group="brand" options={filterOptions.brand} sel={sel} toggle={toggle} />
      <CheckGroup
        title="Category"
        group="category"
        options={filterOptions.category}
        sel={sel}
        toggle={toggle}
      />
      <CheckGroup
        title="Condition"
        group="condition"
        options={filterOptions.condition}
        sel={sel}
        toggle={toggle}
      />
      <CheckGroup title="RAM" group="ram" options={filterOptions.ram} sel={sel} toggle={toggle} />
      <CheckGroup
        title="Storage"
        group="storage"
        options={filterOptions.storage}
        sel={sel}
        toggle={toggle}
      />
      <CheckGroup
        title="Processor"
        group="processor"
        options={filterOptions.processor}
        sel={sel}
        toggle={toggle}
      />
      <CheckGroup
        title="Screen size"
        group="screen"
        options={filterOptions.screen}
        sel={sel}
        toggle={toggle}
      />
      <CheckGroup
        title="Availability"
        group="availability"
        options={["In stock"]}
        sel={sel}
        toggle={toggle}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-foreground">
            {search.deals ? "Flash deals" : (search.category ?? "All devices")}
          </span>
        </nav>

        <header className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-extrabold sm:text-4xl">
              {search.deals ? "Flash deals" : (search.category ?? "All devices")}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {results.length} products · live stock from verified retailers
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1 rounded-xl border border-border bg-surface p-1">
            <Button
              variant={view === "grid" ? "soft" : "ghost"}
              size="icon-sm"
              aria-label="Grid view"
              onClick={() => setView("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={view === "list" ? "soft" : "ghost"}
              size="icon-sm"
              aria-label="List view"
              onClick={() => setView("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                navigate({
                  to: "/products",
                  search: (prev: ProductSearch) => ({ ...prev, q: e.target.value || undefined }),
                  replace: true,
                });
              }}
              placeholder="Live search the catalogue…"
              aria-label="Search products"
              className="h-11 rounded-xl pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={sort}
              onValueChange={(v) => {
                setSort(v);
              }}
            >
              <SelectTrigger className="h-11 w-full rounded-xl sm:w-[190px]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Most relevant</SelectItem>
                <SelectItem value="newest">Newest arrivals</SelectItem>
                <SelectItem value="price-asc">Price: low to high</SelectItem>
                <SelectItem value="price-desc">Price: high to low</SelectItem>
                <SelectItem value="rating">Top rated</SelectItem>
              </SelectContent>
            </Select>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="h-11 rounded-xl lg:hidden">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {activeCount > 0 && (
                    <Badge className="ml-1 border-transparent bg-primary text-primary-foreground">
                      {activeCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6 pb-10">{filters}</div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="mt-8 flex gap-8">
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2 no-scrollbar">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold">Filters</h2>
                {activeCount > 0 && (
                  <button
                    onClick={() => {
                      setSel({
                        brand: [],
                        category: [],
                        condition: [],
                        ram: [],
                        storage: [],
                        processor: [],
                        screen: [],
                        availability: [],
                      });
                      setPrice([0, MAX_PRICE]);
                    }}
                    className="flex items-center gap-1 text-xs font-medium text-accent-foreground hover:underline"
                  >
                    <X className="h-3 w-3" /> Clear all
                  </button>
                )}
              </div>
              {filters}
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            {results.length === 0 ? (
              <EmptyState />
            ) : (
              <div
                className={
                  view === "grid"
                    ? "grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
                    : "flex flex-col gap-4"
                }
              >
                {results.map((p) => (
                  <div key={p.id} className="animate-fade-up">
                    <ProductCard product={p} view={view} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </h3>
      <div className="mt-3">{children}</div>
      <Separator className="mt-6" />
    </div>
  );
}

function CheckGroup({
  title,
  group,
  options,
  sel,
  toggle,
}: {
  title: string;
  group: string;
  options: string[];
  sel: Record<string, string[]>;
  toggle: (g: string, v: string) => void;
}) {
  return (
    <FilterGroup title={title}>
      <div className="space-y-2.5">
        {options.map((o) => (
          <div key={o} className="flex items-center gap-2.5">
            <Checkbox
              id={`${group}-${o}`}
              checked={sel[group]?.includes(o) ?? false}
              onCheckedChange={() => toggle(group, o)}
            />
            <Label htmlFor={`${group}-${o}`} className="cursor-pointer text-sm font-normal">
              {o}
            </Label>
          </div>
        ))}
      </div>
    </FilterGroup>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-accent-foreground">
        <Search className="h-5 w-5" />
      </span>
      <h2 className="mt-5 font-display text-lg font-bold">No devices match those filters</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
        Loosen a filter or two — or send us a WhatsApp message and we&apos;ll source it for you.
      </p>
      <div className="mt-6 flex justify-center gap-2">
        <Button asChild variant="outline">
          <Link to="/products" search={{}}>
            Reset filters
          </Link>
        </Button>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-[4/3] w-full rounded-xl" />
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3.5 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
