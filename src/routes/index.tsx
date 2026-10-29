import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Flame,
  Layers,
  LayoutGrid,
  MessageCircle,
  Package,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Truck,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/storefront/product-card";
import { SiteFooter } from "@/components/storefront/site-footer";
import { SiteHeader } from "@/components/storefront/site-header";
import { brands, categories, reviews, popularSearches, STORE, whatsappLink, formatPrice } from "@/lib/store-data";
import { useDynamicCategories } from "@/lib/categories";
import { listPublishedProducts } from "@/lib/catalog.functions";
import type { CatalogProduct } from "@/lib/catalog";
import { Reveal } from "@/components/reveal";
import { LandingSkeleton } from "@/components/storefront/product-skeletons";
import { gsap } from "@/lib/gsap";
import { optimizeImageUrl } from "@/lib/image";
import { DEFAULT_HERO_SLIDES, type HeroSlide } from "@/lib/hero";
import { getPublicHeroSlides } from "@/lib/hero.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${STORE.name} — Accra Flagship | Streetwear & Footwear Ghana` },
      {
        name: "description",
        content:
          "Shop premium unisex fashion, oversized tees, sneakers, and designer streetwear at Urban Vault Unisex Boutique. Paystack, Cash on Delivery, and instant WhatsApp ordering (0554753212).",
      },
      { property: "og:title", content: `${STORE.name} — Modern Fashion Boutique` },
      {
        property: "og:description",
        content:
          "Curated unisex clothing, designer footwear, and streetwear essentials with fast delivery across Ghana.",
      },
      { property: "og:url", content: STORE.siteUrl },
    ],
    links: [
      { rel: "canonical", href: STORE.siteUrl },
      {
        rel: "preload",
        as: "image",
        href: "/boutique/urban_vault_hero_1_1792394728170.webp",
        type: "image/webp",
        fetchpriority: "high" as any,
      },
    ],
  }),
  loader: async () => {
    const [products, dynamicHeroSlides] = await Promise.all([
      listPublishedProducts(),
      getPublicHeroSlides().catch(() => DEFAULT_HERO_SLIDES),
    ]);
    return {
      products,
      heroSlides:
        dynamicHeroSlides && dynamicHeroSlides.length > 0
          ? dynamicHeroSlides
          : DEFAULT_HERO_SLIDES,
    };
  },
  staleTime: 1000 * 60 * 5,
  gcTime: 1000 * 60 * 30,
  pendingMs: 150,
  pendingComponent: LandingSkeleton,
  component: Landing,
});

function Landing() {
  const { products, heroSlides: initialHeroSlides } = Route.useLoaderData();
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(
    initialHeroSlides && initialHeroSlides.length > 0
      ? initialHeroSlides
      : DEFAULT_HERO_SLIDES,
  );
  const navigate = useNavigate();
  const [heroIndex, setHeroIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>("All");
  const [categoryOverrides, setCategoryOverrides] = useState<Record<string, string>>({});
  const { categories: dynamicCategories } = useDynamicCategories();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("category_images_overrides");
      if (stored) setCategoryOverrides(JSON.parse(stored));
    } catch {}

    try {
      const storedSlides = localStorage.getItem("urban_vault_hero_slides");
      if (storedSlides) {
        const parsed = JSON.parse(storedSlides);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHeroSlides(parsed);
        }
      }
    } catch {}

    const handleSlideChange = (e: any) => {
      if (e.detail && Array.isArray(e.detail) && e.detail.length > 0) {
        setHeroSlides(e.detail);
      }
    };
    window.addEventListener("uv-hero-slides-change", handleSlideChange);
    return () => window.removeEventListener("uv-hero-slides-change", handleSlideChange);
  }, []);

  const nextSlide = useCallback(() => {
    setHeroIndex((prev) => (prev + 1) % heroSlides.length);
  }, [heroSlides.length]);

  const prevSlide = useCallback(() => {
    setHeroIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  }, [heroSlides.length]);

  const activeSlide = heroSlides[heroIndex] || heroSlides[0] || DEFAULT_HERO_SLIDES[0];

  // Auto-slide hero with pause-on-hover support
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5500);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (diff > 50) {
      nextSlide();
    } else if (diff < -50) {
      prevSlide();
    }
    setTouchStart(null);
  };

  const filteredProducts = products.filter((p) => {
    if (activeCategoryTab === "All") return true;
    const cat = p.category.toLowerCase();
    const tab = activeCategoryTab.toLowerCase();
    const gender = (p.specs["Gender"] || "").toLowerCase();
    const name = p.name.toLowerCase();

    if (tab === "clothing") {
      return (
        cat.includes("shirt") ||
        cat.includes("top") ||
        cat.includes("bottom") ||
        cat.includes("suit") ||
        cat.includes("dress") ||
        cat.includes("hoodie") ||
        cat.includes("jacket") ||
        cat.includes("jean") ||
        cat.includes("jogger")
      );
    }
    if (tab === "shoes") {
      return (
        cat.includes("footwear") ||
        cat.includes("shoe") ||
        name.includes("sneaker") ||
        name.includes("shoe") ||
        name.includes("sandal") ||
        name.includes("slipper")
      );
    }
    if (tab === "accessories") {
      return (
        cat.includes("accessories") ||
        cat.includes("jewelry") ||
        cat.includes("bag") ||
        cat.includes("fragrance") ||
        cat.includes("watch") ||
        cat.includes("belt") ||
        cat.includes("wallet")
      );
    }
    if (tab === "african wear") {
      return (
        cat.includes("african") ||
        cat.includes("traditional") ||
        name.includes("kaftan") ||
        name.includes("asante")
      );
    }
    return cat.includes(tab) || gender.includes(tab) || name.includes(tab);
  });

  // 1. Trending Products: explicit trending flag or badge, or high views/rating fallback
  const trendingProducts = useMemo(() => {
    const explicit = products.filter(
      (p) => p.isTrending || p.badge?.toLowerCase().includes("trend")
    );
    if (explicit.length >= 4) return explicit.slice(0, 8);
    const fallback = [...products]
      .sort((a, b) => b.views - a.views || b.rating - a.rating)
      .slice(0, 8);
    const combined = [...explicit, ...fallback.filter((f) => !explicit.some((e) => e.id === f.id))];
    return combined.slice(0, 8);
  }, [products]);

  // 2. Best Seller Products: explicit best seller flag or badge, or high reviews fallback
  const bestSellerProducts = useMemo(() => {
    const explicit = products.filter(
      (p) => p.isBestSeller || p.badge?.toLowerCase().includes("best")
    );
    if (explicit.length >= 4) return explicit.slice(0, 8);
    const fallback = [...products]
      .sort((a, b) => b.reviews - a.reviews || b.rating - a.rating)
      .slice(0, 8);
    const combined = [...explicit, ...fallback.filter((f) => !explicit.some((e) => e.id === f.id))];
    return combined.slice(0, 8);
  }, [products]);

  const featuredBoutiqueProducts = filteredProducts.slice(0, 8);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <SiteHeader />

      {/* ── 1. Hero Big Slider Section ──────────────────────────── */}
      <section className="pt-2 sm:pt-4 pb-8 sm:pb-12 px-2 sm:px-6">
        <div className="mx-auto max-w-7xl">
          {/*
           * ── SPLIT HERO SLIDER ──
           * Left panel: warm dark charcoal (#1a1714) — editorial boutique feel
           * Right panel: hero image on the right 55%
           * Inspired by premium split-layout editorial fashion sliders
           */}
          <div
            className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border shadow-2xl min-h-[480px] sm:min-h-[540px] lg:min-h-[600px] flex flex-row"
            style={{ background: "#1a1714" }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* ── LEFT TEXT PANEL (45%) ── */}
            <div className="relative z-10 flex flex-col justify-between w-full lg:w-[45%] p-6 sm:p-10 lg:p-12 shrink-0">

              {/* Top: Category breadcrumb */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-px bg-primary" />
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/50 font-semibold">
                  {(activeSlide.badge || "").split("//")[0].trim()}
                </span>
              </div>

              {/* Middle: Animated headline + text */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={heroIndex}
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-4 sm:space-y-5 my-auto py-6 sm:py-0"
                >
                  <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.0]">
                    {activeSlide.headlineLine1}
                    <br />
                    <span className="text-primary">
                      {activeSlide.headlineHighlight}
                    </span>
                  </h1>

                  <p className="text-sm sm:text-base text-white/65 leading-relaxed max-w-sm">
                    {activeSlide.subtitle}
                  </p>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-1">
                    <Button
                      asChild
                      className="px-6 py-5 text-sm font-bold rounded-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all hover:scale-105 active:scale-95"
                    >
                      <Link
                        to={activeSlide.primaryCta?.to as any || "/products"}
                        search={activeSlide.primaryCta?.search || {}}
                      >
                        {activeSlide.primaryCta?.text || "Shop Collection"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>

                    <Button
                      asChild
                      variant="outline"
                      className="px-5 py-5 text-sm font-semibold rounded-full border-white/20 bg-transparent hover:bg-white/8 text-white transition-all hover:scale-105 active:scale-95"
                    >
                      <a
                        href={activeSlide.secondaryCta?.href || "#"}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <MessageCircle className="mr-2 h-4 w-4 text-primary" />
                        {activeSlide.secondaryCta?.text || "WhatsApp Concierge"}
                      </a>
                    </Button>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Bottom: Slide counter + progress lines */}
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-primary">
                  0{heroIndex + 1}
                </span>
                <span className="font-mono text-sm text-white/30">/</span>
                <span className="font-mono text-sm text-white/30">
                  0{heroSlides.length}
                </span>
                <div className="flex items-center gap-1.5 ml-1">
                  {heroSlides.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setHeroIndex(i)}
                      aria-label={`Go to slide ${i + 1}`}
                      className={`h-[2px] rounded-full transition-all duration-500 cursor-pointer ${
                        i === heroIndex ? "w-10 bg-primary" : "w-5 bg-white/25 hover:bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* ── RIGHT IMAGE PANEL (55%) ── */}
            <div className="relative hidden lg:block lg:flex-1 overflow-hidden">
              {/* Hero images — fade transition */}
              {heroSlides.map((slide, i) => {
                const isActive = i === heroIndex;
                return (
                  <div
                    key={slide.id || slide.image || i}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <img
                      src={slide.image}
                      alt={`${STORE.name} — ${slide.tabLabel || slide.headlineHighlight || "Hero"}`}
                      className={`h-full w-full object-cover object-center transition-transform duration-[7000ms] ease-out ${
                        isActive ? "scale-105" : "scale-100"
                      }`}
                      loading={i === 0 ? "eager" : "lazy"}
                      fetchPriority={i === 0 ? "high" : "auto"}
                      decoding={i === 0 ? "sync" : "async"}
                      width={1200}
                      height={900}
                    />
                  </div>
                );
              })}

              {/* Decorative script text — top right corner */}
              <div
                className="absolute top-6 right-6 text-right leading-tight pointer-events-none select-none"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic" }}
              >
                <p className="text-white/70 text-xl font-light">Style</p>
                <p className="text-white/70 text-xl font-light">Beyond</p>
                <p className="text-white/70 text-xl font-light">Trends</p>
                <div className="ml-auto mt-1 w-8 h-px bg-primary" />
              </div>

              {/* Stacked nav arrows — right edge, vertically centered */}
              <div className="absolute right-5 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Next slide"
                  className="h-10 w-10 rounded-full border border-white/25 bg-[#1a1714]/80 text-white flex items-center justify-center hover:bg-primary hover:border-primary hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="Previous slide"
                  className="h-10 w-10 rounded-full border border-white/25 bg-[#1a1714]/80 text-white flex items-center justify-center hover:bg-primary hover:border-primary hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Mobile: full-bleed image behind left panel (lg: hidden) */}
            <div className="absolute inset-0 lg:hidden overflow-hidden">
              {heroSlides.map((slide, i) => (
                <div
                  key={`mobile-${slide.id || slide.image || i}`}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    i === heroIndex ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <img
                    src={slide.image}
                    alt={`${STORE.name} — ${slide.tabLabel || slide.headlineHighlight || "Hero"}`}
                    className="h-full w-full object-cover object-center"
                    loading={i === 0 ? "eager" : "lazy"}
                    fetchPriority={i === 0 ? "high" : "auto"}
                    width={800}
                    height={600}
                  />
                  {/* Mobile warm dark panel behind text only */}
                  <div className="absolute inset-0 bg-[#1a1714]/82" />
                </div>
              ))}
            </div>
          </div>

          {/* ── Value Propositions Strip ── */}
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 divide-x divide-border border border-border rounded-xl overflow-hidden bg-card">
            <div className="flex items-center gap-3 p-4 sm:p-5">
              <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
              <div>
                <p className="text-xs sm:text-sm font-bold text-foreground">Nationwide Delivery</p>
                <p className="text-[11px] text-muted-foreground hidden sm:block">Fast dispatch across Ghana</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 sm:p-5">
              <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
              <div>
                <p className="text-xs sm:text-sm font-bold text-foreground">Secure Payments</p>
                <p className="text-[11px] text-muted-foreground hidden sm:block">Paystack, MoMo &amp; COD</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 sm:p-5">
              <BadgeCheck className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
              <div>
                <p className="text-xs sm:text-sm font-bold text-foreground">100% Authentic</p>
                <p className="text-[11px] text-muted-foreground hidden sm:block">Curated streetwear &amp; kicks</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 sm:p-5">
              <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
              <div>
                <p className="text-xs sm:text-sm font-bold text-foreground">WhatsApp Support</p>
                <p className="text-[11px] text-muted-foreground hidden sm:block">0554753212 — Accra Flagship</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Category Showcase ─────────────────────────────── */}
      <section className="py-8 sm:py-12 px-3 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">Browse Collections</p>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
                Shop By Category
              </h2>
            </div>
            <Link
              to="/products"
              search={{}}
              className="text-xs sm:text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1 self-start sm:self-auto"
            >
              View Full Catalogue <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {dynamicCategories.map((cat) => {
              const realCount = products.filter((p) => {
                const pc = (p.category ?? "").toLowerCase();
                const cc = cat.name.toLowerCase();
                return pc.includes(cc) || cc.includes(pc);
              }).length;
              return (
              <Link
                key={cat.name}
                to="/products"
                search={{ category: cat.name } as never}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-card"
              >
                <div className="aspect-[4/4] overflow-hidden bg-surface-muted">
                  <img
                    src={optimizeImageUrl((cat.id && categoryOverrides[cat.id]) || cat.image, 400, 75)}
                    alt={cat.name}
                    loading="lazy"
                    width={400}
                    height={400}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-3 text-center">
                  <h3 className="font-display text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {realCount > 0 ? `${realCount} Items` : "Explore"}
                  </p>
                </div>
              </Link>
            );
          })}
          </div>
        </div>
      </section>

      {/* ── 3. Trending Now Section ───────────────────────────── */}
      <section className="py-8 sm:py-14 px-3 sm:px-6 bg-surface-muted/30 border-y border-border/50">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-500 mb-1">
                <Flame className="h-4 w-4 fill-amber-500 text-amber-500 animate-pulse" />
                <span>Hot Drops · Accra</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
                Trending Now
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
                The most hyped streetwear essentials, oversized tees, and luxury footwear turning heads right now.
              </p>
            </div>
            <Link
              to="/products"
              search={{ trending: true } as never}
              className="text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1 self-start sm:self-auto shrink-0"
            >
              Explore All Trending <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {trendingProducts.map((prod) => (
              <ProductCard key={`trending-${prod.id}`} product={prod} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Best Sellers Section ───────────────────────────── */}
      <section className="py-8 sm:py-14 px-3 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-primary mb-1">
                <Trophy className="h-4 w-4 text-primary" />
                <span>Verified Customer Favorites</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
                Best Sellers
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
                Time-tested boutique silhouettes with top customer ratings and repeat orders across Ghana.
              </p>
            </div>
            <Link
              to="/products"
              search={{ bestseller: true } as never}
              className="text-xs sm:text-sm font-bold text-primary hover:underline inline-flex items-center gap-1 self-start sm:self-auto shrink-0"
            >
              Explore Best Sellers <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {bestSellerProducts.map((prod) => (
              <ProductCard key={`bestseller-${prod.id}`} product={prod} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Curated Catalogue / New In Store ────────────────── */}
      <section className="py-8 sm:py-14 px-3 sm:px-6 bg-surface-muted/20 border-t border-border/50">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary mb-1">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>Curated Catalogue</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
                New In Store
              </h2>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {["All", "Clothing", "Accessories", "Shoes", "African Wear"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveCategoryTab(tab)}
                  className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                    activeCategoryTab === tab
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-slate-100 dark:bg-muted/70 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-muted"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {featuredBoutiqueProducts.map((prod) => (
              <ProductCard key={`featured-${prod.id}`} product={prod} />
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button asChild size="lg" variant="outline" className="rounded-full px-8 font-semibold border-border hover:bg-surface-muted">
              <Link to="/products" search={{}}>
                Explore Full Collection <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── 4. Value Propositions (Simple & Boutique Focused) ── */}
      <section className="py-12 sm:py-16 px-3 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                <CreditCard className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-bold text-foreground">
                Paystack &amp; Cards
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Pay securely with Visa, Mastercard, and Mobile Money (MTN, Telecel) directly online.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                <Package className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-bold text-foreground">
                Cash on Delivery
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Inspect your items upon physical arrival in Accra or pick up directly from our flagship showroom.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 mb-4">
                <MessageCircle className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-bold text-foreground">
                WhatsApp Hotline
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Direct concierge on <span className="font-semibold text-foreground">0554753212</span> for sizing advice, questions, and instant orders.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 mb-4">
                <Truck className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-bold text-foreground">
                Nationwide Dispatch
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Same-day delivery in Accra, plus trusted 24-48 hr courier dispatch to Kumasi, Takoradi, Cape Coast &amp; beyond.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── 5. Customer Testimonials ──────────────────────────── */}
      <section className="py-12 sm:py-16 px-3 sm:px-6 bg-surface-muted/30 border-t border-border/50">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-xl mx-auto mb-10">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Customer Love</p>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              What Shoppers Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((rev, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-500 mb-3">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} className="h-4 w-4 fill-amber-500" />
                    ))}
                  </div>
                  <p className="text-sm text-foreground/90 italic leading-relaxed">
                    "{rev.text}"
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-border/60">
                  <p className="text-sm font-bold text-foreground">{rev.name}</p>
                  <p className="text-xs text-muted-foreground">{rev.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. WhatsApp Concierge Banner ─────────────────────── */}
      <section className="py-10 px-3 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-primary text-primary-foreground p-6 sm:p-10 shadow-lift flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-xl text-center md:text-left">
              <span className="inline-block rounded-md bg-white/20 px-3 py-1 text-xs font-bold tracking-wider uppercase mb-2">
                Need Help with Sizing or Stock?
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
                Order Directly on WhatsApp
              </h3>
              <p className="text-sm text-white/90 mt-2">
                Chat with our boutique team at <span className="font-bold underline">0554753212</span> to confirm sizing, send screenshots, or request immediate same-day delivery.
              </p>
            </div>

            <Button
              asChild
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-bold px-8 rounded-full shadow-lg shrink-0"
            >
              <a
                href={whatsappLink("Hello Urban Vault Unisex Boutique! I need assistance with an order.")}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle className="mr-2 h-5 w-5 text-primary" />
                Chat Now (0554753212)
              </a>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
