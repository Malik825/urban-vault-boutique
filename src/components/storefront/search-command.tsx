import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import {
  Search,
  X,
  Clock,
  Flame,
  Star,
  Heart,
  ShoppingCart,
  MessageCircle,
  SlidersHorizontal,
  ArrowLeft,
  Tag,
  Layers,
  RotateCcw,
  Grid3X3,
  List,
  Camera,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { VisualSearchModal } from "./visual-search-modal";
import {
  brands,
  categories,
  formatPrice,
  popularSearches,
  products as defaultProducts,
  whatsappLink,
  createProductEnquiry,
  STORE,
  type Product,
} from "@/lib/store-data";
import { useDynamicCategories } from "@/lib/categories";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/user-store";
import type { CatalogProduct } from "@/lib/catalog";

const RECENT_KEY = "urban-vault-recent-searches";
const DEFAULT_RECENT = [
  "Boxy Tee",
  "Chunky Platform Sneakers",
  "Cuban Collar Linen Shirt",
  "Utility Cargo Pants",
];

const TRENDING_TAGS = [
  "Boxy Tee",
  "Chunky Sneakers",
  "Linen Shirt",
  "Cargo Pants",
  "Oversized Hoodie",
  "Platform Loafers",
  "Crossbody Bag",
  "Unisex Streetwear",
  "New Arrivals",
];

export function SearchCommand({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const { items: cartItems, addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  // ── State ──────────────────────────────────────────────────────────
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [selectedCondition, setSelectedCondition] = useState("All");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [dealsOnly, setDealsOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"relevance" | "price-asc" | "price-desc" | "rating" | "newest">("relevance");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [recentSearches, setRecentSearches] = useState<string[]>(DEFAULT_RECENT);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [visualSearchOpen, setVisualSearchOpen] = useState(false);
  const { categories: dynamicCategories } = useDynamicCategories();

  // ── Load recent searches from localStorage ────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(RECENT_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {
      // fallback
    }
  }, []);

  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...recentSearches.filter((s) => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, 8);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const removeRecentSearch = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter((s) => s !== term);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const clearAllRecent = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_KEY);
    } catch {
      // ignore
    }
  };

  // ── Auto focus & Double-scrollbar prevention ───────────────────────
  useEffect(() => {
    if (open) {
      const origHtmlOverflow = document.documentElement.style.overflow;
      const origBodyOverflow = document.body.style.overflow;
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => {
        document.documentElement.style.overflow = origHtmlOverflow;
        document.body.style.overflow = origBodyOverflow;
      };
    } else {
      setMobileFilterOpen(false);
      return undefined;
    }
  }, [open]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  // ── Filter and Search Logic ───────────────────────────────────────
  const filteredProducts = useMemo(() => {
    let result = [...defaultProducts];
    const q = query.trim().toLowerCase();

    // Text search
    if (q) {
      result = result.filter((p) => {
        const nameMatch = p.name.toLowerCase().includes(q);
        const brandMatch = p.brand.toLowerCase().includes(q);
        const categoryMatch = p.category.toLowerCase().includes(q);
        const blurbMatch = p.blurb?.toLowerCase().includes(q);
        const specsMatch = Object.entries(p.specs || {}).some(
          ([k, v]) => k.toLowerCase().includes(q) || String(v).toLowerCase().includes(q)
        );
        return nameMatch || brandMatch || categoryMatch || blurbMatch || specsMatch;
      });
    }

    // Category filter
    if (selectedCategory !== "All") {
      result = result.filter((p) =>
        p.category.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    // Brand filter
    if (selectedBrand !== "All") {
      result = result.filter(
        (p) => p.brand.toLowerCase() === selectedBrand.toLowerCase()
      );
    }

    // Condition filter
    if (selectedCondition !== "All") {
      result = result.filter(
        (p) => p.condition.toLowerCase() === selectedCondition.toLowerCase()
      );
    }

    // In stock only
    if (inStockOnly) {
      result = result.filter((p) => p.stock > 0);
    }

    // Deals only
    if (dealsOnly) {
      result = result.filter(
        (p) =>
          p.badge?.toLowerCase() === "flash deal" ||
          (p.compareAt && p.compareAt > p.price)
      );
    }

    // Sorting
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        result.sort((a, b) => {
          if (a.badge === "New") return -1;
          if (b.badge === "New") return 1;
          return 0;
        });
        break;
      default:
        // relevance: prioritize name match
        if (q) {
          result.sort((a, b) => {
            const aStarts = a.name.toLowerCase().startsWith(q) ? 1 : 0;
            const bStarts = b.name.toLowerCase().startsWith(q) ? 1 : 0;
            return bStarts - aStarts;
          });
        }
        break;
    }

    return result;
  }, [
    query,
    selectedCategory,
    selectedBrand,
    selectedCondition,
    inStockOnly,
    dealsOnly,
    sortBy,
  ]);

  const hasActiveFilters =
    query.trim() !== "" ||
    selectedCategory !== "All" ||
    selectedBrand !== "All" ||
    selectedCondition !== "All" ||
    inStockOnly ||
    dealsOnly;

  const resetFilters = () => {
    setQuery("");
    setSelectedCategory("All");
    setSelectedBrand("All");
    setSelectedCondition("All");
    setInStockOnly(false);
    setDealsOnly(false);
    setSortBy("relevance");
  };

  const handleSelectProduct = (product: Product) => {
    if (query.trim()) {
      saveRecentSearch(query.trim());
    }
    onOpenChange(false);
    navigate({ to: "/product/$slug", params: { slug: product.slug } });
  };

  const handleSelectQueryTag = (term: string) => {
    setQuery(term);
    saveRecentSearch(term);
    inputRef.current?.focus();
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    e.preventDefault();
    if (product.stock === 0) return;
    if (cartItems.some((i) => i.product.id === product.id)) {
      toast.error("Item is already in your cart");
    } else {
      addItem(product);
      toast.success(`${product.name} added to cart`);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    e.preventDefault();
    toggleWishlist(product as CatalogProduct);
    const saved = isWishlisted(product.id);
    toast.success(saved ? "Removed from wishlist" : "Saved to wishlist");
  };

  if (!open) return null;

  return (
    <>
      <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-50 flex flex-col bg-background dark:bg-[#090D14] text-foreground dark:text-slate-100 overflow-hidden w-full h-full"
      >
        {/* Ambient Primary Glow Accent */}
        <div
          className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] sm:w-[1000px] h-[360px] bg-primary/10 rounded-full blur-3xl opacity-70"
          aria-hidden="true"
        />

        {/* ── TOP HEADER / SEARCH BAR ─────────────────────────────────────── */}
        <header className="relative z-10 shrink-0 border-b border-border dark:border-white/10 bg-background/95 dark:bg-[#090D14]/90 backdrop-blur-xl px-4 py-3 sm:px-6 sm:py-4">
          <div className="mx-auto flex max-w-7xl items-center gap-3 sm:gap-6">
            {/* Logo / Brand Branding */}
            <div className="hidden sm:flex items-center gap-3 shrink-0">
              <Link
                to="/"
                onClick={() => onOpenChange(false)}
                className="flex items-center gap-2.5 outline-none rounded-xl"
              >
                <img
                  src={STORE.logoUrl || "/urban-vault-logo.jpg"}
                  alt={STORE.name}
                  className="h-9 w-9 rounded-full object-cover ring-1 ring-primary/30 shadow-xs"
                />
                <span className="font-display text-base font-bold tracking-tight text-foreground dark:text-white">
                  {STORE.name}
                </span>
              </Link>
              <Badge className="border-0 bg-primary/15 text-primary font-semibold text-[11px] px-2.5 py-0.5 rounded-full">
                Catalogue Search
              </Badge>
            </div>

            {/* Mobile Back Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="sm:hidden h-10 w-10 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted shrink-0"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            {/* Prominent Search Input Box */}
            <div className="relative flex-1 flex items-center rounded-2xl bg-muted/60 dark:bg-[#121924] border border-border dark:border-white/12 shadow-inner focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <div className="pl-4 pr-2 text-primary flex items-center pointer-events-none">
                <Search className="h-5 w-5 animate-pulse" />
              </div>

              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, brands, categories (e.g. linen shirt, EU 42, Casablanca, washed black)…"
                className="h-12 sm:h-13 w-full bg-transparent pr-12 text-sm sm:text-base text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400 focus:outline-none"
              />

              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                  className="p-1.5 mr-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-white/10 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {/* Photo Search Button */}
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  setVisualSearchOpen(true);
                }}
                title="Snap & Find Similar (Visual Search)"
                className="flex items-center gap-1.5 mr-2 px-2.5 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all text-xs font-semibold shadow-xs shrink-0"
              >
                <Camera className="h-4 w-4" />
                <span className="hidden sm:inline">Photo Search</span>
              </button>

              {/* ESC key badge */}
              <div className="hidden sm:flex items-center pr-3 pointer-events-none">
                <kbd className="rounded bg-background dark:bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground dark:text-slate-300 border border-border dark:border-white/10">
                  ESC
                </kbd>
              </div>
            </div>

            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* Mobile Filter Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className={`lg:hidden h-10 w-10 rounded-xl border border-border dark:border-white/10 text-muted-foreground hover:text-foreground shrink-0 ${
                hasActiveFilters ? "border-primary text-primary bg-primary/10" : ""
              }`}
              aria-label="Filter"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>

            {/* Desktop Close Button */}
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-border dark:border-white/10 px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-white/10 transition-all shrink-0"
            >
              <X className="h-4 w-4" />
              <span>Close</span>
            </Button>
          </div>

          {/* Quick horizontal category pills on Mobile */}
          <div className="sm:hidden mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {["All", ...dynamicCategories.map((c) => c.name)].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-card border border-border/80 dark:border-white/10 text-muted-foreground hover:bg-muted"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>

        {/* ── MAIN WORKSPACE ─────────────────────────────────────────────── */}
        <div className="flex-1 flex overflow-hidden">
          {/* ── DESKTOP SIDEBAR ─────────────────────────────────────────── */}
          <aside className="hidden lg:flex w-80 shrink-0 flex-col border-r border-border dark:border-white/10 bg-surface-muted/30 dark:bg-[#0B1017]/70 p-6 overflow-y-auto space-y-6">
            {/* Quick stats & Clear */}
            <div className="flex items-center justify-between pb-2 border-b border-border dark:border-white/10">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground dark:text-slate-400">
                Filter Catalogue
              </span>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  <RotateCcw className="h-3 w-3" /> Reset all
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
                <Layers className="h-3.5 w-3.5" /> Categories
              </p>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory("All")}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    selectedCategory === "All"
                      ? "bg-primary/15 text-primary border border-primary/30 font-semibold shadow-xs"
                      : "text-muted-foreground dark:text-slate-300 hover:bg-muted dark:hover:bg-white/5 hover:text-foreground dark:hover:text-white"
                  }`}
                >
                  <span>All Categories</span>
                  <span className="text-[11px] font-mono text-muted-foreground dark:text-slate-500">
                    {defaultProducts.length}
                  </span>
                </button>
                {dynamicCategories.map((c) => {
                  const isSelected = selectedCategory.toLowerCase() === c.name.toLowerCase();
                  const realCount = defaultProducts.filter((p) =>
                    p.category.toLowerCase().includes(c.name.toLowerCase()) ||
                    c.name.toLowerCase().includes(p.category.toLowerCase())
                  ).length;
                  return (
                    <button
                      key={c.name}
                      onClick={() => setSelectedCategory(c.name)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-primary/15 text-primary border border-primary/30 font-semibold shadow-xs"
                          : "text-muted-foreground dark:text-slate-300 hover:bg-muted dark:hover:bg-white/5 hover:text-foreground dark:hover:text-white"
                      }`}
                    >
                      <span className="truncate">{c.name}</span>
                      {realCount > 0 && (
                        <span className="text-[11px] font-mono text-muted-foreground dark:text-slate-500">
                          {realCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Brand Filter */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
                <Tag className="h-3.5 w-3.5" /> Brands
              </p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedBrand("All")}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedBrand === "All"
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "bg-card dark:bg-white/5 border border-border dark:border-white/10 text-muted-foreground dark:text-slate-300 hover:bg-muted"
                  }`}
                >
                  All
                </button>
                {brands.map((b) => (
                  <button
                    key={b.name}
                    onClick={() =>
                      setSelectedBrand(selectedBrand === b.name ? "All" : b.name)
                    }
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      selectedBrand === b.name
                        ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                        : "bg-card dark:bg-white/5 border border-border dark:border-white/10 text-muted-foreground dark:text-slate-300 hover:bg-muted"
                    }`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Condition Filter */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary mb-3">
                Condition
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {["All", "New", "Open box", "Refurbished"].map((cond) => (
                  <button
                    key={cond}
                    onClick={() => setSelectedCondition(cond)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium text-center transition-all ${
                      selectedCondition === cond
                        ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                        : "bg-card dark:bg-white/5 border border-border dark:border-white/10 text-muted-foreground dark:text-slate-300 hover:bg-muted"
                    }`}
                  >
                    {cond}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Status Toggles */}
            <div className="space-y-2.5 pt-2 border-t border-border dark:border-white/10">
              <label className="flex items-center gap-2.5 text-xs text-muted-foreground dark:text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span>In Stock only</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-muted-foreground dark:text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={dealsOnly}
                  onChange={(e) => setDealsOnly(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span className="flex items-center gap-1">
                  <span>Flash Deals &amp; Discounts</span>
                  <Flame className="h-3 w-3 text-amber-500" />
                </span>
              </label>
            </div>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="pt-3 border-t border-border dark:border-white/10">
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground dark:text-slate-400 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-primary" /> Recent
                  </p>
                  <button
                    onClick={clearAllRecent}
                    className="text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                </div>
                <div className="space-y-1">
                  {recentSearches.map((term) => (
                    <div
                      key={term}
                      onClick={() => handleSelectQueryTag(term)}
                      className="group flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground dark:text-slate-300 hover:bg-muted dark:hover:bg-white/10 hover:text-foreground dark:hover:text-white cursor-pointer transition-colors"
                    >
                      <span className="truncate">{term}</span>
                      <button
                        onClick={(e) => removeRecentSearch(term, e)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-muted-foreground hover:text-foreground"
                        aria-label="Remove"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Searches */}
            <div className="pt-3 border-t border-border dark:border-white/10">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground dark:text-slate-400 mb-2.5 flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5 text-primary" /> Trending
              </p>
              <div className="flex flex-wrap gap-1.5">
                {TRENDING_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleSelectQueryTag(tag)}
                    className="rounded-full bg-card dark:bg-white/5 border border-border dark:border-white/10 px-2.5 py-1 text-[11px] font-medium text-muted-foreground dark:text-slate-300 hover:border-primary/40 hover:text-primary hover:bg-primary/10 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* ── MAIN PRODUCT RESULTS AREA ─────────────────────────────────── */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-primary/30 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
            {/* Toolbar: Stats & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border dark:border-white/10">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display text-base sm:text-lg font-bold text-foreground dark:text-white">
                  {filteredProducts.length} {filteredProducts.length === 1 ? "Product" : "Products"} Found
                </span>
                {query && (
                  <span className="text-xs text-muted-foreground">
                    for &ldquo;<span className="text-primary font-semibold">{query}</span>&rdquo;
                  </span>
                )}
                {selectedCategory !== "All" && (
                  <Badge className="bg-primary/15 text-primary border border-primary/30 text-[11px]">
                    {selectedCategory}
                  </Badge>
                )}
                {selectedBrand !== "All" && (
                  <Badge variant="outline" className="text-[11px]">
                    {selectedBrand}
                  </Badge>
                )}
              </div>

              {/* Sort & View Modes */}
              <div className="flex items-center gap-3 self-end sm:self-auto">
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline text-xs text-muted-foreground font-medium">
                    Sort:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="rounded-xl border border-border dark:border-white/12 bg-background dark:bg-[#121924] px-3 py-1.5 text-xs font-semibold text-foreground dark:text-slate-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="newest">Newest Devices</option>
                  </select>
                </div>

                <div className="hidden sm:flex items-center rounded-xl border border-border dark:border-white/10 bg-background dark:bg-[#121924] p-0.5">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`rounded-lg p-1.5 transition-colors ${
                      viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                    aria-label="Grid view"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`rounded-lg p-1.5 transition-colors ${
                      viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                    aria-label="List view"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Filter Drawer (Expandable when toggled) */}
            {mobileFilterOpen && (
              <div className="lg:hidden rounded-2xl border border-primary/30 bg-card dark:bg-[#0E1520] p-4 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-border dark:border-white/10">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    Refine Results
                  </span>
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Done
                  </button>
                </div>

                <div>
                  <p className="text-xs font-bold text-foreground mb-2">Brands</p>
                  <div className="flex flex-wrap gap-1.5">
                    {brands.map((b) => (
                      <button
                        key={b.name}
                        onClick={() => setSelectedBrand(selectedBrand === b.name ? "All" : b.name)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                          selectedBrand === b.name ? "bg-primary text-primary-foreground" : "bg-muted border border-border text-muted-foreground"
                        }`}
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    <span>In Stock only</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dealsOnly}
                      onChange={(e) => setDealsOnly(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    <span>Deals only 🔥</span>
                  </label>
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredProducts.length === 0 ? (
              <div className="rounded-3xl border border-border dark:border-white/10 bg-card dark:bg-[#0E141D]/90 p-8 sm:p-12 text-center max-w-xl mx-auto space-y-5">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
                  <Search className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground dark:text-white">No devices found</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground dark:text-slate-400">
                    We couldn&rsquo;t find anything matching &ldquo;{query || selectedCategory}&rdquo;. Try another keyword, check spelling, or clear filters.
                  </p>
                </div>
                <div className="flex justify-center gap-3">
                  <Button
                    onClick={resetFilters}
                    className="bg-primary hover:bg-primary-deep text-primary-foreground font-semibold rounded-xl"
                  >
                    Clear All Filters
                  </Button>
                </div>

                {/* Suggested Alternatives */}
                <div className="pt-6 border-t border-border dark:border-white/10">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-slate-400 mb-3">
                    Popular Right Now
                  </p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {popularSearches.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSelectQueryTag(s)}
                        className="rounded-full bg-muted dark:bg-white/5 border border-border dark:border-white/10 px-3 py-1 text-xs text-muted-foreground dark:text-slate-300 hover:text-primary"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : viewMode === "grid" ? (
              /* ── PRODUCT RESULTS: GRID VIEW ────────────────────────── */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredProducts.map((p) => {
                  const saved = isWishlisted(p.id);
                  const isLowStock = p.stock > 0 && p.stock <= 4;
                  const discount = p.compareAt
                    ? Math.round(((p.compareAt - p.price) / p.compareAt) * 100)
                    : 0;

                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectProduct(p)}
                      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 dark:border-white/10 bg-card dark:bg-[#0E1520] hover:border-primary/50 hover:shadow-lg transition-all duration-300 cursor-pointer"
                    >
                      {/* Image Media Area */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-muted dark:bg-[#131B26]">
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                        {/* Badges on Image */}
                        <div className="absolute left-2.5 top-2.5 flex flex-col items-start gap-1 z-10">
                          {p.badge && (
                            <span className="rounded-md bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground shadow-xs">
                              {p.badge}
                            </span>
                          )}
                          {discount > 0 && !p.badge && (
                            <span className="rounded-md bg-rose-600 px-2 py-0.5 text-[11px] font-bold text-white shadow-xs">
                              −{discount}%
                            </span>
                          )}
                        </div>

                        {/* Wishlist Button */}
                        <button
                          onClick={(e) => handleToggleWishlist(e, p)}
                          aria-label="Wishlist"
                          className="absolute right-2.5 top-2.5 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/95 dark:bg-[#0E1520]/80 backdrop-blur-md border border-border/50 dark:border-white/20 text-muted-foreground dark:text-slate-300 hover:text-rose-500 hover:scale-110 transition-transform shadow-xs"
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              saved ? "fill-rose-500 text-rose-500" : ""
                            }`}
                          />
                        </button>
                      </div>

                      {/* Card Body */}
                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
                        <div>
                          {/* Brand & Rating */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                              {p.brand}
                            </span>
                            <span className="flex items-center gap-1 text-xs font-semibold text-foreground dark:text-slate-200">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                              {p.rating.toFixed(1)}
                              <span className="text-muted-foreground font-normal">
                                ({p.reviews})
                              </span>
                            </span>
                          </div>

                          {/* Product Title */}
                          <h4 className="mt-1.5 font-display text-sm sm:text-base font-bold text-foreground dark:text-white group-hover:text-primary transition-colors line-clamp-1">
                            {p.name}
                          </h4>

                          {/* Stock Status & Condition */}
                          <div className="mt-2.5 flex flex-wrap items-center gap-2">
                            {p.stock === 0 ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" /> Out of stock
                              </span>
                            ) : isLowStock ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" /> Only {p.stock} left
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary" /> In stock · {p.stock}
                              </span>
                            )}

                            <span className="rounded-md border border-border/80 dark:border-white/10 bg-muted/20 text-muted-foreground dark:text-slate-300 px-2 py-0.5 text-[11px] font-medium">
                              {p.condition}
                            </span>
                          </div>
                        </div>

                        {/* Pricing & Add to Cart Action */}
                        <div className="pt-3 border-t border-border/50 dark:border-white/10 flex flex-col gap-3">
                          <div className="flex items-baseline gap-2">
                            <span className="font-display text-base sm:text-lg font-extrabold text-foreground dark:text-white">
                              {formatPrice(p.price)}
                            </span>
                            {p.compareAt && (
                              <span className="text-xs text-muted-foreground line-through">
                                {formatPrice(p.compareAt)}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {/* WhatsApp Enquiry */}
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(whatsappLink(createProductEnquiry(p)), "_blank");
                              }}
                              className="h-9 w-9 rounded-xl border-border text-primary hover:bg-primary/10 shrink-0"
                              title="Enquire on WhatsApp"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </Button>

                            {/* Add to Cart Button */}
                            <Button
                              size="sm"
                              disabled={p.stock === 0}
                              onClick={(e) => handleAddToCart(e, p)}
                              className="h-9 flex-1 rounded-xl bg-primary hover:bg-primary-deep text-primary-foreground font-semibold text-xs shadow-xs gap-1.5 transition-all"
                            >
                              <ShoppingCart className="h-4 w-4" />
                              <span>{p.stock === 0 ? "Out of Stock" : "Add to Cart"}</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* ── PRODUCT RESULTS: LIST VIEW ────────────────────────── */
              <div className="space-y-3">
                {filteredProducts.map((p) => {
                  const saved = isWishlisted(p.id);
                  const isLowStock = p.stock > 0 && p.stock <= 4;
                  const discount = p.compareAt
                    ? Math.round(((p.compareAt - p.price) / p.compareAt) * 100)
                    : 0;

                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectProduct(p)}
                      className="group flex flex-col sm:flex-row items-stretch gap-4 rounded-2xl border border-border/80 dark:border-white/10 bg-card dark:bg-[#0E1520] p-3 sm:p-4 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="relative aspect-video sm:aspect-square w-full sm:w-36 rounded-xl overflow-hidden bg-surface-muted dark:bg-[#131B26] shrink-0">
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                        {p.badge && (
                          <span className="absolute left-2 top-2 rounded bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                            {p.badge}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col justify-between gap-2">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                              {p.brand} · {p.category}
                            </span>
                            <span className="flex items-center gap-1 text-xs font-semibold text-foreground dark:text-slate-200">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                              {p.rating.toFixed(1)}
                            </span>
                          </div>

                          <h4 className="font-display text-base font-bold text-foreground dark:text-white group-hover:text-primary transition-colors mt-0.5">
                            {p.name}
                          </h4>

                          <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                            {p.blurb}
                          </p>

                          <div className="mt-2 flex items-center gap-2">
                            {p.stock === 0 ? (
                              <span className="text-xs text-muted-foreground">Out of stock</span>
                            ) : isLowStock ? (
                              <span className="text-xs text-amber-600 dark:text-amber-400">Only {p.stock} left</span>
                            ) : (
                              <span className="text-xs text-primary">In stock ({p.stock})</span>
                            )}
                            <span className="rounded bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                              {p.condition}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/50 dark:border-white/10">
                          <div className="flex items-baseline gap-2">
                            <span className="font-display text-lg font-bold text-foreground dark:text-white">
                              {formatPrice(p.price)}
                            </span>
                            {p.compareAt && (
                              <span className="text-xs text-muted-foreground line-through">
                                {formatPrice(p.compareAt)}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => handleToggleWishlist(e, p)}
                              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-rose-500"
                            >
                              <Heart className={`h-4 w-4 ${saved ? "fill-rose-500 text-rose-500" : ""}`} />
                            </Button>
                            <Button
                              size="sm"
                              disabled={p.stock === 0}
                              onClick={(e) => handleAddToCart(e, p)}
                              className="h-8 rounded-lg bg-primary hover:bg-primary-deep text-primary-foreground font-semibold text-xs px-3"
                            >
                              Add to Cart
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </motion.div>
    </AnimatePresence>
    <VisualSearchModal open={visualSearchOpen} onOpenChange={setVisualSearchOpen} />
    </>
  );
}
