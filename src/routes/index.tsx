import { useState, useEffect, useRef } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  CreditCard,
  Flame,
  Globe,
  HelpCircle,
  Instagram,
  Laptop,
  Layers,
  LayoutGrid,
  MessageCircle,
  Package,
  Phone,
  Search,
  Send,
  ShieldCheck,
  Smartphone,
  Star,
  Timer,
  Truck,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import TextAnimation from "@/components/ui/scroll-text";
import { ProductCard } from "@/components/storefront/product-card";
import { SiteFooter } from "@/components/storefront/site-footer";
import { SiteHeader } from "@/components/storefront/site-header";
import { brands, categories, reviews, popularSearches, STORE, whatsappLink, formatPrice } from "@/lib/store-data";
import { listPublishedProducts } from "@/lib/catalog.functions";
import type { CatalogProduct } from "@/lib/catalog";
import { Reveal } from "@/components/reveal";
import { LandingSkeleton } from "@/components/storefront/product-skeletons";
import { gsap } from "@/lib/gsap";

import slide1 from "@/assets/hero-slide-01.jpg";
import slide2 from "@/assets/hero-slide-02.jpg";
import slide3 from "@/assets/hero-slide-03.jpg";
import slide4 from "@/assets/hero-slide-04.jpg";

const HERO_IMAGES = [slide1, slide2, slide3, slide4];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${STORE.name} — Electronics & Tech Store, Accra Ghana` },
      {
        name: "description",
        content:
          "Shop verified smartphones, laptops and tech accessories in Ghana with transparent GH₵ pricing, Mobile Money checkout, and instant WhatsApp ordering. Serving Accra and nationwide delivery.",
      },
      { property: "og:title", content: `${STORE.name} — Electronics & Tech Store, Ghana` },
      {
        property: "og:description",
        content:
          "Modern online shopping for electronics and technology. Serving customers in Ghana and across Africa with verified devices and honest pricing.",
      },
    ],
  }),
  loader: async (): Promise<CatalogProduct[]> => listPublishedProducts(),
  pendingMs: 0,
  pendingComponent: LandingSkeleton,
  component: Landing,
});

function Landing() {
  const products: CatalogProduct[] = Route.useLoaderData();
  const navigate = useNavigate();
  const [heroIndex, setHeroIndex] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  // Bulk quote modal state
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkName, setBulkName] = useState("");
  const [bulkBusiness, setBulkBusiness] = useState("");
  const [bulkPhone, setBulkPhone] = useState("");
  const [bulkEmail, setBulkEmail] = useState("");
  const [bulkProducts, setBulkProducts] = useState("");
  const [bulkQuantity, setBulkQuantity] = useState("");
  const [bulkMessage, setBulkMessage] = useState("");

  // Auto-slide hero images
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // GSAP Hero Animation
  useEffect(() => {
    if (!heroRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-element",
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
          delay: 0.1,
        }
      );
    }, heroRef);
    return () => ctx.revert();
  }, []);

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkName || !bulkPhone || !bulkProducts) {
      toast.error("Please fill in your name, phone and required products.");
      return;
    }

    const message = `Hello ${STORE.name}! I would like to request a bulk corporate quote:\n\n*Name:* ${bulkName}\n*Company/Org:* ${bulkBusiness || "N/A"}\n*Phone:* ${bulkPhone}\n*Email:* ${bulkEmail || "N/A"}\n*Items Required:* ${bulkProducts}\n*Quantity:* ${bulkQuantity || "Multiple units"}\n*Notes:* ${bulkMessage || "Looking for pricing and availability."}`;

    window.open(whatsappLink(message), "_blank");
    toast.success("Quote request opened in WhatsApp!");
    setBulkOpen(false);
    setBulkName("");
    setBulkBusiness("");
    setBulkPhone("");
    setBulkEmail("");
    setBulkProducts("");
    setBulkQuantity("");
    setBulkMessage("");
  };

  const [catalogueTab, setCatalogueTab] = useState<"All" | "Laptops" | "Phones" | "Accessories">("All");

  const macbook = products.find((p) => p.name.toLowerCase().includes("macbook")) || products[0];
  const iphone = products.find((p) => p.name.toLowerCase().includes("iphone")) || products[1];
  const dell = products.find((p) => p.name.toLowerCase().includes("dell")) || products[2];
  const hpSpectre = products.find((p) => p.name.toLowerCase().includes("spectre") || (p.brand === "HP" && p.id !== macbook?.id)) || products[3];

  const filteredCatalogueProducts = products.filter((p) => {
    if (catalogueTab === "All") return true;
    if (catalogueTab === "Laptops") return p.category.toLowerCase().includes("laptop");
    if (catalogueTab === "Phones") return p.category.toLowerCase().includes("phone") || p.category.toLowerCase().includes("smartphones");
    if (catalogueTab === "Accessories") return p.category.toLowerCase().includes("access") || p.category.toLowerCase().includes("audio") || p.category.toLowerCase().includes("watch");
    return true;
  });

  const trending = products.filter((p) => p.status === "Published").slice(0, 8);
  const deals = products.filter((p) => p.badge?.toLowerCase() === "flash deal").slice(0, 4);
  const arrivals = products.filter((p) => p.badge === "New" || p.badge === "Best seller").slice(0, 4);
  const popular = products.slice(4, 8);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero Section */}
      <section className="pt-4 sm:pt-6 sm:pb-12 sm:px-6">
        <div className="mx-auto max-w-7xl sm:container-x sm:px-0">
          <div className="sm:bg-primary-soft/30 sm:dark:bg-primary-dark/20 sm:rounded-xl sm:p-10 lg:p-16 border border-border/40 sm:shadow-card">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">

              {/* Right: Sliding Device Gallery */}
              <div className="relative h-[55vw] min-h-[260px] max-h-[440px] sm:h-[320px] lg:h-[460px] w-full overflow-hidden rounded-xl sm:rounded-xl order-1 lg:order-2 shadow-lg">
                {HERO_IMAGES.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt="Modern tech electronics catalogue"
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out ${i === heroIndex ? "opacity-100 scale-100" : "opacity-0 scale-105"
                      }`}
                  />
                ))}

                {/* Gradient overlay on mobile */}
                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background/90 via-background/40 to-transparent sm:hidden" />

                {/* Floating Badge on Carousel */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-black/65 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white border border-white/20 shadow-md">
                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_var(--primary)]" />
                    Verified Tech · Experts.
                  </span>
                </div>

                {/* Pagination Dots */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                  {HERO_IMAGES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setHeroIndex(i)}
                      aria-label={`Go to slide ${i + 1}`}
                      className={`h-1.5 rounded-full transition-all duration-300 ${i === heroIndex ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
                        }`}
                    />
                  ))}
                </div>
              </div>

              {/* Left: Text Content */}
              <div ref={heroRef} className="max-w-xl order-2 lg:order-1 px-4 pt-2 pb-8 sm:px-0 sm:py-0">
                <h1 className="hero-element font-display text-3xl font-extrabold leading-[1.12] tracking-tight sm:text-4xl md:text-5xl xl:text-[3.25rem] text-foreground">
                  Your products deserve a <span className="text-primary">better storefront</span>.
                </h1>

                <p className="hero-element mt-4 sm:mt-5 text-sm sm:text-base lg:text-lg leading-relaxed text-muted-foreground">
                  Browse phones, laptops, accessories and electronics in one modern shopping experience with transparent specs, Ghana Mobile Money checkout, and instant WhatsApp ordering.
                </p>

                <div className="hero-element mt-6 sm:mt-8 flex flex-wrap items-center gap-3">
                  <Button asChild variant="default" size="lg" className="px-7 shadow-md font-semibold">
                    <Link to="/products" search={{}}>
                      Shop Products <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="px-6 border-primary/50 text-primary hover:bg-primary/10 font-semibold"
                  >
                    <a
                      href={whatsappLink("Hello GadgetHaus! I'd like to learn more about your products and services.")}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MessageCircle className="mr-2 h-4 w-4 text-primary" />
                      Chat on WhatsApp
                    </a>
                  </Button>
                </div>

                {/* Supporting Message */}
                <div className="hero-element mt-6 pt-5 border-t border-border/60 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>Built for modern African retail · Mobile Money &amp; WhatsApp commerce ready</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Brands Bar */}
      <section className="border-y border-border bg-surface overflow-hidden py-3">
        <div className="flex items-center">
          <p className="w-[38%] sm:w-[25%] shrink-0 pl-6 pr-3 text-[11px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground border-r border-border">
            Stocked Brands
          </p>
          <div
            className="relative flex-1 overflow-hidden"
            style={{ maskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)" }}
          >
            <div
              className="flex items-center"
              style={{ animation: "marquee 26s linear infinite", width: "max-content" }}
            >
              {[...brands, ...brands].map((b, i) => (
                <Link
                  key={i}
                  to="/products"
                  search={{ brand: b.name }}
                  className="font-display text-sm font-semibold text-muted-foreground whitespace-nowrap transition-colors hover:text-foreground mx-6 sm:mx-8"
                >
                  {b.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Catalogue Discovery Showcase (Matches Reference Design) */}
      <section className="section-pad">
        <div className="mx-auto max-w-7xl container-x">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">
                Catalogue Discovery
              </p>
              <h2 className="mt-1 font-display text-2xl font-extrabold sm:text-3xl tracking-tight text-foreground">
                Popular electronics in Ghana
              </h2>
            </div>
            <Link
              to="/products"
              search={{}}
              className="text-sm font-semibold text-primary hover:text-primary-deep flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              View all products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Category Filter Pills (Matches Image 3) */}
          <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {(["All", "Laptops", "Phones", "Accessories"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setCatalogueTab(tab)}
                className={`rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold transition-all shrink-0 ${catalogueTab === tab
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-card border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Showcase Display */}
          <div className="mt-6">
            {catalogueTab === "All" ? (
              <>
                {/* Desktop Bento Grid (Matches Image 2) */}
                <div className="hidden lg:grid lg:grid-cols-12 gap-5 items-stretch">
                  {/* Left: Large Featured Card */}
                  <div className="lg:col-span-5 h-full">
                    {macbook && <ProductCard product={macbook} variant="featured" />}
                  </div>

                  {/* Right: 2 top cards + 1 wide bottom card */}
                  <div className="lg:col-span-7 flex flex-col gap-5 justify-between h-full">
                    <div className="grid grid-cols-2 gap-5">
                      {iphone && <ProductCard product={iphone} variant="standard" />}
                      {dell && <ProductCard product={dell} variant="standard" />}
                    </div>
                    {hpSpectre && <ProductCard product={hpSpectre} variant="wide" />}
                  </div>
                </div>

                {/* Mobile / Tablet Responsive Layout (Matches Image 3) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
                  {macbook && <ProductCard product={macbook} variant="featured" />}
                  {iphone && <ProductCard product={iphone} variant="standard" />}
                  {dell && <ProductCard product={dell} variant="standard" />}
                  {hpSpectre && <ProductCard product={hpSpectre} variant="standard" />}
                </div>
              </>
            ) : (
              /* Filtered Category Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredCatalogueProducts.map((p) => (
                  <ProductCard key={p.id} product={p} variant="standard" />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Flash deals */}
      <section className="bg-surface-muted section-pad">
        <Reveal className="mx-auto max-w-7xl container-x">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground">
                <Flame className="h-4 w-4 text-primary" /> Promotional Deals
              </p>
              <h2 className="mt-1 text-xl font-extrabold sm:text-2xl lg:text-3xl">Limited-Time Offers</h2>
            </div>
            <Badge className="shrink-0 border-transparent bg-brand-gradient text-primary-foreground font-semibold">
              <Timer className="mr-1.5 h-3.5 w-3.5" /> Today Only
            </Badge>
          </div>
          <div className="mt-8">
            {deals.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No flash deals currently listed.
              </p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {deals.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </Reveal>
      </section>

      {/* Categories Grid - 8 Categories */}
      <Section eyebrow="Product Categories" title="Explore by category">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.slice(0, 8).map((c) => (
            <Link
              key={c.name}
              to="/products"
              search={{ category: c.name }}
              className="group hover-lift relative overflow-hidden rounded-xl border border-border bg-card shadow-card flex flex-col justify-between"
            >
              <div className="aspect-[16/10] overflow-hidden bg-surface-muted">
                <img
                  src={c.image}
                  alt={c.name}
                  loading="lazy"
                  width={640}
                  height={400}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-[15px] font-bold group-hover:text-primary transition-colors">
                      {c.name}
                    </h3>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{c.blurb}</p>
                </div>
                <p className="mt-3 text-xs font-semibold text-primary">
                  {c.count} items
                </p>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* New arrivals */}
      <Section
        eyebrow="New Arrivals"
        title="Recently stocked devices"
        action={{ label: "Browse catalogue", to: "/products" }}
        muted
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {arrivals.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </Section>

      {/* TRUST SECTION: Requirement 9 */}
      <section className="section-pad bg-surface border-y border-border">
        <Reveal className="mx-auto max-w-7xl container-x">
          <div className="max-w-2xl">
            <Badge variant="outline" className="text-xs uppercase font-bold text-primary border-primary/30 mb-2">
              Solution Overview
            </Badge>
            <h2 className="text-2xl font-extrabold sm:text-3xl lg:text-4xl tracking-tight">
              Why customers shop with GadgetHaus
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
              A modern, high-trust retail experience built for African shoppers — combining professional product discovery with the WhatsApp ordering and mobile money payments you already use.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Smartphone,
                title: "Mobile-First Shopping",
                text: "Optimised for African shoppers browsing on Android & iOS mobile devices with ultra-fast page loads and responsive cards.",
              },
              {
                icon: MessageCircle,
                title: "WhatsApp Commerce",
                text: "Pre-filled enquiry messages with exact product names, pricing, and cart summaries so customers can order with zero confusion.",
              },
              {
                icon: CreditCard,
                title: "Digital Payments Ready",
                text: "Seamless integration ready for Ghanaian Mobile Money (MTN, Telecel, AirtelTigo) and cards via Paystack or local gateways.",
              },
              {
                icon: Package,
                title: "Structured Product Catalogue",
                text: "Rich device specifications, honest condition grading (New, Open Box, Refurbished), and instant filtering by RAM, storage and brand.",
              },
              {
                icon: ShieldCheck,
                title: "Inventory & Price Transparency",
                text: "Clear stock counters and transparent pricing in Ghanaian Cedi (GH₵) eliminate endless 'DM for price' friction.",
              },
              {
                icon: Layers,
                title: "Responsive & Scalable",
                text: "High-performance architecture that looks stunning on every screen size from budget smartphones to 4K desktop displays.",
              },
            ].map((f, i) => (
              <Reveal
                key={f.title}
                delay={i * 70}
                className="hover-lift rounded-xl border border-border bg-card p-6 shadow-card flex flex-col justify-between"
              >
                <div>
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                    <f.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-bold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-8 rounded-xl bg-primary/5 border border-primary/20 p-5 text-center sm:flex sm:items-center sm:justify-between sm:text-left">
            <div>
              <p className="font-bold text-foreground text-sm sm:text-base">
                Need a corporate order or bulk pricing for your business?
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                We offer formal quotes, volume discounts, and doorstep delivery across Ghana.
              </p>
            </div>
            <Button asChild size="sm" className="mt-3 sm:mt-0 shrink-0 font-semibold">
              <a
                href={whatsappLink("Hello GadgetHaus! I'm interested in your products and would like to discuss a corporate order.")}
                target="_blank"
                rel="noreferrer"
              >
                Get a Quote
              </a>
            </Button>
          </div>
        </Reveal>
      </section>

      {/* BULK / BUSINESS PURCHASES: Requirement 10 */}
      <section className="section-pad bg-surface-muted">
        <Reveal className="mx-auto max-w-7xl container-x">
          <div className="rounded-3xl border border-border bg-card p-8 sm:p-12 shadow-card grid gap-8 lg:grid-cols-[1.2fr_1fr] items-center">
            <div>
              <Badge variant="outline" className="text-xs uppercase font-bold text-primary border-primary/30 mb-3">
                B2B &amp; Corporate Sales
              </Badge>
              <h2 className="text-2xl font-extrabold sm:text-3xl lg:text-4xl tracking-tight text-foreground">
                Buying for your business?
              </h2>
              <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                Request pricing for bulk orders, office equipment, school projects and corporate purchases. We provide formal invoices, warranty coverage, and regional delivery across Ghana.
              </p>

              <div className="mt-6 space-y-2.5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>Volume discounts on laptops, phones, and peripherals</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>Fast VAT-compliant invoicing and formal purchase orders</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>Doorstep delivery with tracked dispatch in Accra and Kumasi</span>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="rounded-full px-7 font-bold">
                      <Building2 className="mr-2 h-4 w-4" /> Request Bulk Quote
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="font-display text-xl font-bold">
                        Corporate &amp; Bulk Quote Request
                      </DialogTitle>
                      <DialogDescription>
                        Fill out your requirements below and our sales team will prepare a formal quote via WhatsApp or email.
                      </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleBulkSubmit} className="space-y-4 pt-2">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label htmlFor="bulk-name">Your Full Name *</Label>
                          <Input
                            id="bulk-name"
                            required
                            placeholder="e.g. Kwabena Darko"
                            value={bulkName}
                            onChange={(e) => setBulkName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="bulk-biz">Company / Organization</Label>
                          <Input
                            id="bulk-biz"
                            placeholder="e.g. Apex Tech Solutions"
                            value={bulkBusiness}
                            onChange={(e) => setBulkBusiness(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label htmlFor="bulk-phone">WhatsApp / Phone *</Label>
                          <Input
                            id="bulk-phone"
                            required
                            type="tel"
                            placeholder="+233 24 123 4567"
                            value={bulkPhone}
                            onChange={(e) => setBulkPhone(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="bulk-email">Work Email</Label>
                          <Input
                            id="bulk-email"
                            type="email"
                            placeholder="procurement@company.com"
                            value={bulkEmail}
                            onChange={(e) => setBulkEmail(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label htmlFor="bulk-prods">Products Needed *</Label>
                          <Input
                            id="bulk-prods"
                            required
                            placeholder="e.g. ThinkPad Laptops, Monitors"
                            value={bulkProducts}
                            onChange={(e) => setBulkProducts(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="bulk-qty">Estimated Quantity</Label>
                          <Input
                            id="bulk-qty"
                            placeholder="e.g. 10–20 units"
                            value={bulkQuantity}
                            onChange={(e) => setBulkQuantity(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="bulk-msg">Additional Details</Label>
                        <Textarea
                          id="bulk-msg"
                          rows={3}
                          placeholder="Specific specs, delivery deadline or location in Ghana..."
                          value={bulkMessage}
                          onChange={(e) => setBulkMessage(e.target.value)}
                        />
                      </div>

                      <DialogFooter className="pt-2">
                        <Button type="button" variant="ghost" onClick={() => setBulkOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" className="gap-1.5 font-bold">
                          <Send className="h-4 w-4" /> Send via WhatsApp
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rounded-full px-6 bg-background"
                >
                  <a
                    href={whatsappLink("Hi! I have a question about corporate purchasing and bulk laptop orders.")}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle className="mr-2 h-4 w-4 text-emerald-600" />
                    Quick Enquiry
                  </a>
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-border/80 bg-surface-muted/50 p-6 space-y-4">
              <h3 className="font-display text-base font-bold tracking-tight">Sample Corporate Packages</h3>
              <div className="space-y-3">
                <div className="rounded-xl border border-border bg-card p-3.5 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">Startup Office Pack</p>
                    <p className="text-xs text-muted-foreground">5× HP EliteBooks + USB-C Hubs</p>
                  </div>
                  <span className="text-xs font-bold text-primary">From GH₵ 42,000</span>
                </div>

                <div className="rounded-xl border border-border bg-card p-3.5 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">Design &amp; Media Bundle</p>
                    <p className="text-xs text-muted-foreground">3× MacBook Pro 14 M3 + 4K Displays</p>
                  </div>
                  <span className="text-xs font-bold text-primary">From GH₵ 75,000</span>
                </div>

                <div className="rounded-xl border border-border bg-card p-3.5 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">Sales Team Mobility</p>
                    <p className="text-xs text-muted-foreground">8× Galaxy S24 + Protective Cases</p>
                  </div>
                  <span className="text-xs font-bold text-primary">From GH₵ 110,000</span>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground text-center pt-1">
                Corporate packages · Tailored quotes generated on request
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* SOCIAL COMMERCE: Requirement 11 */}
      <section className="section-pad bg-surface border-b border-border">
        <Reveal className="mx-auto max-w-7xl container-x">
          <div className="max-w-2xl mx-auto text-center">
            <Badge variant="outline" className="text-xs uppercase font-bold text-primary border-primary/30 mb-2">
              Omnichannel Experience
            </Badge>
            <h2 className="text-2xl font-extrabold sm:text-3xl lg:text-4xl tracking-tight">
              Found us on social media?
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
              Browse the full catalogue, check product specifications and complete your purchase online with verified pricing and real-time delivery estimates.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap justify-center items-center gap-4">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold hover:border-primary transition-all shadow-xs"
            >
              <Instagram className="h-4 w-4 text-pink-500" />
              <span>Instagram Storefront</span>
            </a>

            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold hover:border-primary transition-all shadow-xs"
            >
              <span className="font-black text-foreground">TikTok</span>
              <span>Product Unboxings</span>
            </a>

            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold hover:border-primary transition-all shadow-xs"
            >
              <span className="font-bold text-blue-600">Facebook</span>
              <span>Retail Community</span>
            </a>

            <a
              href={whatsappLink("Hello! I saw your products on social media and would like to place an order.")}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300 transition-all shadow-xs"
            >
              <MessageCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>WhatsApp Channel</span>
            </a>
          </div>
        </Reveal>
      </section>

      {/* Customer reviews */}
      <Section eyebrow="Customer Feedback" title="Why shoppers trust GadgetHaus" muted>
        <div className="grid gap-5 md:grid-cols-3">
          {reviews.map((r) => (
            <figure
              key={r.name}
              className="hover-lift flex flex-col rounded-xl border border-border bg-card p-6 shadow-card"
            >
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.round(r.rating) ? "fill-warning text-warning" : "text-border"}`}
                  />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                “{r.text}”
              </blockquote>
              <figcaption className="mt-5 border-t border-border pt-4">
                <p className="text-sm font-semibold text-foreground">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      {/* Newsletter */}
      <section className="container-x pb-16 pt-8">
        <Reveal className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-brand-gradient dark:bg-brand-gradient/80 container-x py-12 shadow-glow sm:py-16">
          <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
            <div className="text-primary-foreground">
              <Badge variant="outline" className="border-white/30 text-white text-[11px] mb-2">
                Restock Notifications
              </Badge>
              <h2 className="text-xl font-extrabold sm:text-3xl">
                Get price drops &amp; new stock alerts
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed opacity-90 sm:text-base">
                Join our sample email notification list. Receive price drops, flash deals, and refurbished MacBook arrivals.
              </p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                toast.success("You're subscribed! We'll notify you of deals and restocks.");
              }}
              className="glass flex flex-col gap-2 rounded-xl border p-2 sm:flex-row"
            >
              <Input
                type="email"
                required
                placeholder="your@email.com"
                aria-label="Email address"
                className="h-11 border-0 bg-transparent shadow-none focus-visible:ring-0 text-white placeholder:text-white/70"
              />
              <Button type="submit" variant="secondary" className="h-11 shrink-0 font-bold">
                Subscribe
              </Button>
            </form>
          </div>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}

function Section({
  eyebrow,
  title,
  action,
  muted,
  children,
}: {
  eyebrow: string;
  title: string;
  action?: { label: string; to: string };
  muted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={`section-pad ${muted ? "bg-surface-muted" : ""}`}>
      <div className="mx-auto max-w-7xl container-x">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground">
              {eyebrow}
            </p>
            <TextAnimation
              as="h2"
              text={title}
              classname="mt-1 text-xl font-extrabold sm:text-3xl"
              variants={{
                hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
                visible: {
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                },
              }}
            />
          </div>
          {action && (
            <Button asChild variant="outline" size="sm" className="shrink-0">
              <Link to="/products" search={{}}>
                {action.label}
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Link>
            </Button>
          )}
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}
