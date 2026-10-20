import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { ProductCard } from "@/components/storefront/product-card";
import { SiteFooter } from "@/components/storefront/site-footer";
import { SiteHeader } from "@/components/storefront/site-header";
import { filterOptions, formatPrice, STORE } from "@/lib/store-data";
import { listPublishedProducts } from "@/lib/catalog.functions";
import type { CatalogProduct } from "@/lib/catalog";

type ProductSearch = {
  q?: string | undefined;
  brand?: string | undefined;
  category?: string | undefined;
  department?: string | undefined;
  deals?: boolean | undefined;
  sort?: string | undefined;
  page?: number | undefined;
};

export const Route = createFileRoute("/products")({
  validateSearch: (search: Record<string, unknown>): ProductSearch => ({
    q: typeof search["q"] === "string" ? (search["q"] as string) : undefined,
    brand: typeof search["brand"] === "string" ? (search["brand"] as string) : undefined,
    category: typeof search["category"] === "string" ? (search["category"] as string) : undefined,
    department: typeof search["department"] === "string" ? (search["department"] as string) : undefined,
    deals: search["deals"] === true || search["deals"] === "true" ? true : undefined,
    sort: typeof search["sort"] === "string" ? (search["sort"] as string) : undefined,
    page: search["page"] ? Number(search["page"]) : undefined,
  }),
  head: () => ({
    meta: [
      { title: `Shop Collection — ${STORE.name}` },
      {
        name: "description",
        content:
          `Browse the latest unisex streetwear, footwear, shirts and accessories at ${STORE.name}. Fast delivery across Accra and nationwide Ghana.`,
      },
      { property: "og:title", content: `Shop Collection — ${STORE.name}` },
      {
        property: "og:description",
        content: `Explore curated streetwear, footwear and unisex apparel at ${STORE.name}.`,
      },
      { property: "og:url", content: `${STORE.siteUrl}/products` },
    ],
    links: [{ rel: "canonical", href: `${STORE.siteUrl}/products` }],
  }),
  loader: async (): Promise<CatalogProduct[]> => listPublishedProducts(),
  component: Listing,
});

const MAX_PRICE = 5000;

function Listing() {
  const products: CatalogProduct[] = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate();

  const [view, setView] = useState<"grid" | "list">("grid");
  const [query, setQuery] = useState(search.q ?? "");
  const [sort, setSort] = useState(search.sort ?? "relevance");
  const [price, setPrice] = useState<number[]>([0, MAX_PRICE]);
  const [sel, setSel] = useState<Record<string, string[]>>({
    department: search.department ? [search.department] : [],
    brand: search.brand ? [search.brand] : [],
    category: search.category ? [search.category] : [],
    condition: [],
    size: [],
    availability: [],
  });

  // Compute live counts from the loaded products data
  const liveCounts = useMemo(() => {
    const published = products.filter((p) => p.status === "Published");
    const category: Record<string, number> = {};
    const brand: Record<string, number> = {};
    for (const p of published) {
      category[p.category] = (category[p.category] ?? 0) + 1;
      brand[p.brand] = (brand[p.brand] ?? 0) + 1;
    }
    return { category, brand };
  }, [products]);

  const PAGE_SIZE = 12;
  const [currentPage, setCurrentPage] = useState(search.page ? Math.max(1, Number(search.page)) : 1);

  // Sync state if search.page changes
  useEffect(() => {
    if (search.page && Number(search.page) !== currentPage) {
      setCurrentPage(Number(search.page));
    }
  }, [search.page]);

  // Reset page to 1 when filters or query change
  useEffect(() => {
    setCurrentPage(1);
    if (search.page && search.page > 1) {
      navigate({
        search: ((prev: any) => ({ ...prev, page: undefined })) as never,
        replace: true,
      });
    }
  }, [query, sel, price, sort]);

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
    list = list.filter((p) => {
      // Department filter
      const deptFilter = sel["department"]?.[0] || search.department;
      if (deptFilter && deptFilter !== "All") {
        const pGender = (p.specs["Gender"] || "").toLowerCase();
        const pCat = (p.category || "").toLowerCase();
        const pName = (p.name || "").toLowerCase();
        const target = deptFilter.toLowerCase();
        const matches = pGender.includes(target) || pGender === "unisex" || pCat.includes(target) || pName.includes(target);
        if (!matches) return false;
      }

      // Category filter
      if (!has("category", p.category)) return false;

      // Brand filter
      if (!has("brand", p.brand)) return false;

      // Condition filter
      if (!has("condition", p.condition)) return false;

      // Size filter
      if (sel["size"]?.length) {
        const pSizes = (p.specs["Sizes"] || p.specs["Size"] || p.specs["Fit"] || "");
        const hasSize = sel["size"].some((s) => pSizes.includes(s));
        if (!hasSize) return false;
      }

      // Availability filter
      if (sel["availability"]?.includes("In stock") && p.stock <= 0) return false;

      // Price filter
      if (p.price < price[0]! || p.price > price[1]!) return false;

      return true;
    });
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    if (sort === "newest") list = [...list].reverse();
    return list;
  }, [query, sel, price, sort, search.deals, search.department]);

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const displayedResults = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return results.slice(start, start + PAGE_SIZE);
  }, [results, safePage, PAGE_SIZE]);

  const handlePageChange = (newPage: number) => {
    const targetPage = Math.min(Math.max(1, newPage), totalPages);
    setCurrentPage(targetPage);
    navigate({
      search: ((prev: any) => ({ ...prev, page: targetPage > 1 ? targetPage : undefined })) as never,
      replace: true,
    });
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  const filters = (
    <div className="space-y-6">
      <FilterGroup title="Price Range">
        <Slider
          value={price}
          onValueChange={setPrice}
          min={0}
          max={MAX_PRICE}
          step={50}
          className="mt-2"
        />
        <div className="mt-3 flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>{formatPrice(price[0]!)}</span>
          <span>{formatPrice(price[1]!)}</span>
        </div>
      </FilterGroup>

      <CheckGroup
        title="Department"
        group="department"
        options={filterOptions.department.filter((d) => d !== "All")}
        sel={sel}
        toggle={toggle}
      />
      <CheckGroup
        title="Category"
        group="category"
        options={filterOptions.category}
        counts={liveCounts.category}
        sel={sel}
        toggle={toggle}
      />
      <CheckGroup
        title="Size / Fit"
        group="size"
        options={filterOptions.size}
        sel={sel}
        toggle={toggle}
      />
      <CheckGroup title="Brand" group="brand" options={filterOptions.brand} counts={liveCounts.brand} sel={sel} toggle={toggle} />
      <CheckGroup
        title="Condition"
        group="condition"
        options={filterOptions.condition}
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

      <div className="mx-auto max-w-7xl container-x pb-16 pt-6">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-foreground">
            {search.deals ? "Flash deals" : (search.category ?? "All products")}
          </span>
        </nav>

        <header className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-extrabold sm:text-4xl">
              {search.deals ? "Flash deals" : (search.category ?? "All products")}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {results.length} products · curated boutique collection
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

        {/* Department & Quick Filter Pills */}
        <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {filterOptions.department.map((dept) => {
            const currentDept = sel["department"]?.[0] || search.department || "All";
            const isSelected = currentDept === dept || (dept === "All" && (!sel["department"]?.length && !search.department));
            return (
              <button
                key={dept}
                type="button"
                onClick={() => {
                  setSel((prev) => ({
                    ...prev,
                    department: dept === "All" ? [] : [dept],
                  }));
                  navigate({
                    search: ((prev: any) => ({
                      ...prev,
                      department: dept === "All" ? undefined : dept,
                      page: undefined,
                    })) as never,
                  });
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                  isSelected
                    ? "bg-foreground text-background shadow-xs"
                    : "bg-surface-muted text-muted-foreground hover:text-foreground hover:bg-muted border border-border/60"
                }`}
              >
                {dept === "All" ? "All Collections" : `${dept}'s Wear`}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
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
          <aside className="hidden w-64 shrink-0 lg:block sticky top-24 self-start max-h-[calc(100vh-7rem)] overflow-y-auto pr-2 no-scrollbar">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Filters</h2>
              {activeCount > 0 && (
                <button
                  onClick={() => {
                    setSel({
                      department: [],
                      brand: [],
                      category: [],
                      condition: [],
                      size: [],
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
          </aside>

          <div className="min-w-0 flex-1">
            {results.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-8">
                <div
                  className={
                    view === "grid"
                      ? "grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
                      : "flex flex-col gap-4"
                  }
                >
                  {displayedResults.map((p, index) => (
                    <Reveal key={p.id} delay={(index % PAGE_SIZE) * 50}>
                      <ProductCard product={p} view={view} />
                    </Reveal>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex flex-col items-center justify-between gap-4 pt-6 sm:flex-row border-t border-border/60">
                    <p className="text-xs text-muted-foreground order-2 sm:order-1">
                      Showing{" "}
                      <span className="font-semibold text-foreground">
                        {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, results.length)}
                      </span>{" "}
                      of <span className="font-semibold text-foreground">{results.length}</span> items
                    </p>

                    <div className="order-1 sm:order-2">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={safePage <= 1}
                              onClick={() => handlePageChange(safePage - 1)}
                              className="gap-1 pl-2.5 h-9"
                            >
                              <ChevronLeft className="h-4 w-4" />
                              <span>Previous</span>
                            </Button>
                          </PaginationItem>

                          {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(
                              (p) =>
                                p === 1 ||
                                p === totalPages ||
                                Math.abs(p - safePage) <= 1,
                            )
                            .reduce<(number | string)[]>((acc, p, idx, arr) => {
                              if (idx > 0) {
                                const prev = arr[idx - 1]!;
                                if (p - prev === 2) acc.push(prev + 1);
                                else if (p - prev > 2) acc.push(`ellipsis-${p}`);
                              }
                              acc.push(p);
                              return acc;
                            }, [])
                            .map((item) =>
                              typeof item === "string" ? (
                                <PaginationItem key={item}>
                                  <PaginationEllipsis />
                                </PaginationItem>
                              ) : (
                                <PaginationItem key={item}>
                                  <Button
                                    variant={item === safePage ? "outline" : "ghost"}
                                    size="sm"
                                    onClick={() => handlePageChange(item)}
                                    className={`h-9 w-9 p-0 font-medium ${
                                      item === safePage
                                        ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                                        : ""
                                    }`}
                                  >
                                    {item}
                                  </Button>
                                </PaginationItem>
                              ),
                            )}

                          <PaginationItem>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={safePage >= totalPages}
                              onClick={() => handlePageChange(safePage + 1)}
                              className="gap-1 pr-2.5 h-9"
                            >
                              <span>Next</span>
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  </div>
                )}
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
  options = [],
  counts,
  sel,
  toggle,
}: {
  title: string;
  group: string;
  options?: string[];
  counts?: Record<string, number>;
  sel: Record<string, string[]>;
  toggle: (g: string, v: string) => void;
}) {
  // Only show options that have at least 1 product (when counts provided)
  const visibleOptions = counts
    ? options.filter((o) => (counts[o] ?? 0) > 0)
    : options;

  if (!visibleOptions || visibleOptions.length === 0) return null;

  return (
    <FilterGroup title={title}>
      <div className="space-y-2.5">
        {visibleOptions.map((o) => (
          <div key={o} className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <Checkbox
                id={`${group}-${o}`}
                checked={sel[group]?.includes(o) ?? false}
                onCheckedChange={() => toggle(group, o)}
              />
              <Label htmlFor={`${group}-${o}`} className="cursor-pointer text-sm font-normal leading-none">
                {o}
              </Label>
            </div>
            {counts && counts[o] !== undefined && (
              <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
                {counts[o]}
              </span>
            )}
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
      <h2 className="mt-5 font-display text-lg font-bold">No items match those filters</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
        Try adjusting your filters — or message us on WhatsApp and we&apos;ll source it for you.
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
