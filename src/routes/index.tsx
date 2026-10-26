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
import { listPublishedProducts } from "@/lib/catalog.functions";
import type { CatalogProduct } from "@/lib/catalog";
import { Reveal } from "@/components/reveal";
import { LandingSkeleton } from "@/components/storefront/product-skeletons";
import { gsap } from "@/lib/gsap";
import { optimizeImageUrl } from "@/lib/image";

const BOUTIQUE_HERO_SLIDES = [
  {
    image: "/boutique/urban_vault_hero_1_1792394728170.webp",
    badge: "Season 2026 // Streetwear Drop",
    headlineLine1: "DRESS THE",
    headlineHighlight: "CULTURE.",
    subtitle:
      "Curated unisex streetwear, graphic tees, designer hoodies, and elevated contemporary aesthetics crafted for fearless self-expression.",
    primaryCta: {
      text: "Shop New Drop",
      to: "/products" as const,
      search: {},
    },
    secondaryCta: {
      text: "WhatsApp Concierge",
      href: whatsappLink("Hello Urban Vault Unisex Boutique! I want to check out the new 2026 Streetwear drop."),
    },
    tabLabel: "Streetwear Drop",
    code: "01",
  },
  {
    image: "/boutique/urban_vault_hero_2_1792394739729.webp",
    badge: "Unisex Silhouettes // Modern Fit",
    headlineLine1: "EFFORTLESS",
    headlineHighlight: "LUXURY.",
    subtitle:
      "Modern unisex tracksuits, oversized silhouettes, and elevated wardrobe essentials. Premium fabrics made for everyday luxury and all-day comfort.",
    primaryCta: {
      text: "Explore Unisex Fits",
      to: "/products" as const,
      search: { category: "Clothing" },
    },
    secondaryCta: {
      text: "Order on WhatsApp",
      href: whatsappLink("Hello Urban Vault! I'm interested in your unisex silhouettes and tracksuits."),
    },
    tabLabel: "Unisex Silhouettes",
    code: "02",
  },
  {
    image: "/boutique/urban_vault_hero_3_1792394763146.webp",
    badge: "Exclusive Footwear // Kicks & Slides",
    headlineLine1: "STEP INTO",
    headlineHighlight: "PREMIUM.",
    subtitle:
      "From rare statement sneakers to everyday boutique slides. Elevate your footwear rotation with verified authenticity and showroom pickup.",
    primaryCta: {
      text: "Browse Footwear",
      to: "/products" as const,
      search: { category: "Footwear" },
    },
    secondaryCta: {
      text: "Check Shoe Sizes",
      href: whatsappLink("Hello Urban Vault! I want to check footwear availability and sizing."),
    },
    tabLabel: "Footwear & Kicks",
    code: "03",
  },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${STORE.name} — Streetwear & Footwear in Assin Fosu, Ghana` },
      {
        name: "description",
        content:
          "Shop premium unisex fashion, oversized tees, sneakers, and designer streetwear at Urban Vault Unisex Boutique. Paystack, Cash on Delivery, and instant WhatsApp ordering (0597489841).",
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
  loader: async (): Promise<CatalogProduct[]> => listPublishedProducts(),
  staleTime: 1000 * 60 * 5,
  gcTime: 1000 * 60 * 30,
  pendingMs: 150,
  pendingComponent: LandingSkeleton,
  component: Landing,
});

function Landing() {
  const products: CatalogProduct[] = Route.useLoaderData();
  const navigate = useNavigate();
  const [heroIndex, setHeroIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>("All");
  const [categoryOverrides, setCategoryOverrides] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem("category_images_overrides");
      if (stored) setCategoryOverrides(JSON.parse(stored));
    } catch {}
  }, []);

  const nextSlide = useCallback(() => {
    setHeroIndex((prev) => (prev + 1) % BOUTIQUE_HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setHeroIndex((prev) => (prev - 1 + BOUTIQUE_HERO_SLIDES.length) % BOUTIQUE_HERO_SLIDES.length);
  }, []);

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
          <div
            className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border bg-[#101318] shadow-2xl min-h-[580px] sm:min-h-[640px] lg:min-h-[720px] max-h-[820px] flex flex-col justify-between"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Background Image Carousel Layer */}
            {BOUTIQUE_HERO_SLIDES.map((slide, i) => {
              const isActive = i === heroIndex;
              return (
                <div
                  key={slide.image}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
                    isActive ? "opacity-100 z-0 pointer-events-auto" : "opacity-0 -z-10 pointer-events-none"
                  }`}
                >
                  <img
                    src={slide.image}
                    alt={`${STORE.name} — ${slide.tabLabel}`}
                    className={`h-full w-full object-cover object-center sm:object-[center_30%] transition-transform duration-[7000ms] ease-out ${
                      isActive ? "scale-105" : "scale-100"
                    }`}
                    loading={i === 0 ? "eager" : "lazy"}
                    fetchPriority={i === 0 ? "high" : "auto"}
                    decoding={i === 0 ? "sync" : "async"}
                    width={1600}
                    height={900}
                  />
                </div>
              );
            })}

            {/* Dark solid tint overlay for high contrast & clarity (No gradients, pure brand dark) */}
            <div className="absolute inset-0 bg-[#101318]/70 pointer-events-none z-1" />

            {/* Top Bar inside Hero: Brand Tag & Live Slide Counter */}
            <div className="relative z-10 p-5 sm:p-8 flex items-center justify-between">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-[#151b23]/90 px-3.5 py-1 text-xs font-semibold text-white">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.16em]">
                  {STORE.name}
                </span>
              </div>

              {/* Slide Counter & Pause indicator */}
              <div className="flex items-center gap-2">
                {isPaused && (
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-primary bg-[#151b23] border border-primary/40 px-2.5 py-1 rounded-full">
                    Paused
                  </span>
                )}
                <div className="rounded-full bg-[#151b23]/90 border border-border px-3 py-1 text-white font-mono text-xs">
                  <span className="text-primary font-bold">0{heroIndex + 1}</span>
                  <span className="text-white/40 mx-1">/</span>
                  <span className="text-white/70">0{BOUTIQUE_HERO_SLIDES.length}</span>
                </div>
              </div>
            </div>

            {/* Left/Right Floating Navigation Arrows */}
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous slide"
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 h-10 w-10 sm:h-12 sm:w-12 rounded-full border border-border bg-[#151b23]/90 text-white flex items-center justify-center hover:bg-primary hover:border-primary hover:scale-110 active:scale-95 transition-all duration-200 shadow-xl opacity-80 sm:opacity-0 group-hover:opacity-100 cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next slide"
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 h-10 w-10 sm:h-12 sm:w-12 rounded-full border border-border bg-[#151b23]/90 text-white flex items-center justify-center hover:bg-primary hover:border-primary hover:scale-110 active:scale-95 transition-all duration-200 shadow-xl opacity-80 sm:opacity-0 group-hover:opacity-100 cursor-pointer"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            {/* Hero Main Content (Animated on slide change) */}
            <div className="relative z-10 px-5 sm:px-10 lg:px-16 py-4 sm:py-8 max-w-3xl my-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={heroIndex}
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -22 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="space-y-4 sm:space-y-6"
                >
                  {/* Category / Drop Badge */}
                  <div className="inline-flex items-center gap-2 rounded-full border border-border bg-[#151b23]/90 px-3.5 py-1 text-xs font-semibold text-white shadow-lg">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/95">
                      {BOUTIQUE_HERO_SLIDES[heroIndex].badge}
                    </span>
                  </div>

                  {/* Headline: Solid Brand Colors (No gradients) */}
                  <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.04]">
                    {BOUTIQUE_HERO_SLIDES[heroIndex].headlineLine1} <br />
                    <span className="text-primary">
                      {BOUTIQUE_HERO_SLIDES[heroIndex].headlineHighlight}
                    </span>
                  </h1>

                  {/* Subtitle */}
                  <p className="text-sm sm:text-base lg:text-lg text-white/80 max-w-xl leading-relaxed">
                    {BOUTIQUE_HERO_SLIDES[heroIndex].subtitle}
                  </p>

                  {/* Call To Actions */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                    <Button
                      asChild
                      size="lg"
                      className="px-8 py-6 text-base font-bold rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all hover:scale-105 active:scale-95"
                    >
                      <Link
                        to={BOUTIQUE_HERO_SLIDES[heroIndex].primaryCta.to}
                        search={BOUTIQUE_HERO_SLIDES[heroIndex].primaryCta.search}
                      >
                        {BOUTIQUE_HERO_SLIDES[heroIndex].primaryCta.text}{" "}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>

                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="px-6 py-6 text-base font-semibold rounded-full border-border bg-[#151b23]/90 hover:bg-[#1a222c] text-white transition-all hover:scale-105 active:scale-95"
                    >
                      <a
                        href={BOUTIQUE_HERO_SLIDES[heroIndex].secondaryCta.href}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <MessageCircle className="mr-2 h-5 w-5 text-primary" />
                        {BOUTIQUE_HERO_SLIDES[heroIndex].secondaryCta.text}
                      </a>
                    </Button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom Slider Navigation Tabs & Indicator */}
            <div className="relative z-10 px-5 sm:px-10 lg:px-16 pb-5 sm:pb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {BOUTIQUE_HERO_SLIDES.map((slide, i) => {
                  const isActive = i === heroIndex;
                  return (
                    <button
                      key={slide.image}
                      type="button"
                      onClick={() => setHeroIndex(i)}
                      className={`group/btn relative text-left py-2 px-3 sm:px-4 rounded-xl transition-all duration-300 flex items-center gap-2.5 cursor-pointer ${
                        isActive
                          ? "bg-[#151b23] border border-primary text-white shadow-md"
                          : "bg-[#101318]/80 hover:bg-[#151b23] text-white/60 hover:text-white border border-border"
                      }`}
                    >
                      <span className={`font-mono text-xs font-bold ${isActive ? "text-primary" : "text-white/50"}`}>
                        {slide.code}
                      </span>
                      <span className="hidden sm:inline text-xs font-semibold tracking-wide">
                        {slide.tabLabel}
                      </span>
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          isActive ? "w-6 bg-primary" : "w-2 bg-white/20 group-hover/btn:bg-white/40"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Progress dot indicators (visible on mobile) */}
              <div className="flex sm:hidden items-center justify-center gap-1.5 self-center">
                {BOUTIQUE_HERO_SLIDES.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setHeroIndex(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === heroIndex ? "w-6 bg-primary" : "w-2 bg-white/30"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Value Propositions Strip */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-xl border border-border/70 bg-card/60 backdrop-blur-sm">
              <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <BadgeCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-foreground">100% Authentic</p>
                <p className="text-[11px] text-muted-foreground">Curated streetwear &amp; kicks</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-xl border border-border/70 bg-card/60 backdrop-blur-sm">
              <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-foreground">Nationwide Delivery</p>
                <p className="text-[11px] text-muted-foreground">Fast dispatch across Ghana</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-xl border border-border/70 bg-card/60 backdrop-blur-sm">
              <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-foreground">Paystack &amp; COD</p>
                <p className="text-[11px] text-muted-foreground">MoMo, Card &amp; Pay on Delivery</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-xl border border-border/70 bg-card/60 backdrop-blur-sm">
              <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-foreground">Showroom &amp; Support</p>
                <p className="text-[11px] text-muted-foreground">Assin Fosu / 0597489841</p>
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
          {categories.map((cat) => {
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
                <span>Hot Drops · Assin Fosu</span>
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
                Inspect your items upon physical arrival in Assin Fosu or pick up directly from our showroom.
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
                Direct concierge on <span className="font-semibold text-foreground">0597489841</span> for sizing advice, questions, and instant orders.
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
                Same-day delivery in Assin Fosu, plus trusted 24-48 hr courier dispatch to Kumasi, Accra, Takoradi &amp; beyond.
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
                Chat with our boutique team at <span className="font-bold underline">0597489841</span> to confirm sizing, send screenshots, or request immediate same-day delivery.
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
                Chat Now (0597489841)
              </a>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
