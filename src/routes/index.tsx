import { useState, useEffect, useRef } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  CreditCard,
  Flame,
  Layers,
  LayoutGrid,
  MessageCircle,
  Package,
  Phone,
  Search,
  ShieldCheck,
  Star,
  Truck,
  Zap,
} from "lucide-react";
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
    badge: "Streetwear & Contemporary Fashion",
  },
  {
    image: "/boutique/urban_vault_hero_2_1792394739729.webp",
    badge: "Unisex Silhouettes & Elevated Comfort",
  },
  {
    image: "/boutique/urban_vault_hero_3_1792394763146.webp",
    badge: "Exclusive Footwear & Kicks",
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
  const heroRef = useRef<HTMLDivElement>(null);
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>("All");

  // Auto-slide hero
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % BOUTIQUE_HERO_SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // GSAP animation
  useEffect(() => {
    if (!heroRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-element",
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: "power2.out",
        }
      );
    }, heroRef);
    return () => ctx.revert();
  }, []);

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

  const featuredBoutiqueProducts = filteredProducts.slice(0, 8);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <SiteHeader />

      {/* ── 1. Hero Section ───────────────────────────────────── */}
      <section className="pt-3 sm:pt-6 pb-8 sm:pb-14 px-3 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/70 bg-gradient-to-br from-card via-card/90 to-surface-muted p-5 sm:p-10 lg:p-14 shadow-card">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Left Column: Brand Statement */}
              <div ref={heroRef} className="lg:col-span-7 space-y-5 sm:space-y-6">
                <div className="hero-element inline-flex items-center gap-2.5 rounded-full border border-border/80 bg-background/80 px-3.5 py-1 text-xs font-medium text-foreground backdrop-blur-sm shadow-xs">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                  </span>
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/85">
                    Season 2026 <span className="text-muted-foreground/50">/</span> New Drop
                  </span>
                </div>

                <h1 className="hero-element font-display text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-[3.25rem] leading-[1.08] text-foreground">
                  URBAN VAULT <br />
                  <span className="text-primary tracking-normal">UNISEX BOUTIQUE</span>
                </h1>

                <p className="hero-element text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed max-w-xl">
                  Curated unisex streetwear, contemporary shirts, everyday footwear, and elevated silhouettes. Designed for effortless expression with showroom pickup in Assin Fosu and nationwide delivery across Ghana.
                </p>

                {/* Quick CTA Actions */}
                <div className="hero-element flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <Button asChild size="lg" className="px-8 font-bold rounded-full shadow-md hover:shadow-lg transition-all">
                    <Link to="/products" search={{}}>
                      Shop Collection <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="px-6 font-semibold rounded-full border-border hover:bg-surface-muted text-foreground"
                  >
                    <a
                      href={whatsappLink("Hello Urban Vault Unisex Boutique! I'd like to check available items and new arrivals.")}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MessageCircle className="mr-2 h-4 w-4 text-primary" />
                      Order via WhatsApp
                    </a>
                  </Button>
                </div>

                {/* Key value propositions */}
                <div className="hero-element pt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground border-t border-border/50">
                  <span className="flex items-center gap-1.5">
                    <BadgeCheck className="h-4 w-4 text-primary" />
                    100% Authentic Apparel
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CreditCard className="h-4 w-4 text-primary" />
                    Paystack &amp; Cash on Delivery
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-primary" />
                    Hotline: 0597489841
                  </span>
                </div>
              </div>

              {/* Right Column: Hero Visual Carousel */}
              <div className="lg:col-span-5">
                <div className="relative aspect-[4/5] sm:aspect-[4/4] lg:aspect-[4/5] w-full overflow-hidden rounded-2xl border border-border shadow-lift bg-surface-muted">
                  {BOUTIQUE_HERO_SLIDES.map((slide, i) => (
                    <div
                      key={i}
                      className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                        i === heroIndex ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
                      }`}
                    >
                      <img
                        src={slide.image}
                        alt="Urban Vault Unisex Boutique Lookbook"
                        className="h-full w-full object-cover object-center"
                        loading={i === 0 ? "eager" : "lazy"}
                        fetchPriority={i === 0 ? "high" : "auto"}
                        decoding={i === 0 ? "sync" : "async"}
                        width={960}
                        height={536}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-5 left-5 right-5 text-white">
                        <span className="inline-block rounded-md bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-semibold uppercase tracking-wider mb-2 border border-white/30">
                          {slide.badge}
                        </span>
                        <p className="text-sm font-semibold text-white/90">
                          Urban Vault Collection 2026
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Carousel navigation indicators */}
                  <div className="absolute top-4 right-4 z-10 flex gap-1.5">
                    {BOUTIQUE_HERO_SLIDES.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setHeroIndex(i)}
                        aria-label={`Go to slide ${i + 1}`}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          i === heroIndex ? "w-6 bg-white" : "w-2 bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </div>
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
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to="/products"
                search={{ category: cat.name } as never}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-card"
              >
                <div className="aspect-[4/4] overflow-hidden bg-surface-muted">
                  <img
                    src={optimizeImageUrl(cat.image, 400, 75)}
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
                    {cat.count} Items
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Featured Products ─────────────────────────────── */}
      <section className="py-8 sm:py-12 px-3 sm:px-6 bg-surface-muted/30 border-y border-border/50">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary mb-1">
                <Flame className="h-3.5 w-3.5 text-amber-500" />
                <span>Trending Now</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
                New In Store
              </h2>
            </div>

            {/* Category Filter Pills (Matching Design Inspiration) */}
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
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button asChild size="lg" variant="outline" className="rounded-full px-8 font-semibold border-border">
              <Link to="/products" search={{}}>
                Explore All Products <ArrowRight className="ml-2 h-4 w-4" />
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
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-brand-gradient text-white p-6 sm:p-10 shadow-lift flex flex-col md:flex-row items-center justify-between gap-6">
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
