import { useState, useEffect, useRef } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Flame,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Timer,
  Truck,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import TextAnimation from "@/components/ui/scroll-text";
import { ProductCard } from "@/components/storefront/product-card";
import { SiteFooter } from "@/components/storefront/site-footer";
import { SiteHeader } from "@/components/storefront/site-header";
import { brands, categories, reviews, popularSearches } from "@/lib/store-data";
import { listPublishedProducts } from "@/lib/catalog.functions";
import type { CatalogProduct } from "@/lib/catalog";
import { Reveal } from "@/components/reveal";
import { LandingSkeleton, ProductGridSkeleton } from "@/components/storefront/product-skeletons";
import { gsap } from "@/lib/gsap";

import heroImg from "@/assets/hero.jpg";
import laptopImg from "@/assets/laptop.jpg";
import phoneImg from "@/assets/phone.jpg";
import tabletImg from "@/assets/tablet.jpg";

const HERO_IMAGES = [heroImg, laptopImg, phoneImg, tabletImg];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Voltix — Premium Laptops, Phones & Gadgets in Lagos" },
      {
        name: "description",
        content:
          "Browse verified laptops, phones and gadgets with real stock levels and full specs. Compare, shortlist and enquire instantly on WhatsApp.",
      },
      { property: "og:title", content: "Voltix — Premium Laptops, Phones & Gadgets" },
      {
        property: "og:description",
        content:
          "A premium electronics storefront with live inventory, rich filters and instant WhatsApp enquiries.",
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
  const [q, setQ] = useState("");
  const [heroIndex, setHeroIndex] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  // Auto-slide hero images
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // GSAP Hero Animation
  useEffect(() => {
    if (!heroRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-element",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          delay: 0.1,
        }
      );
    }, heroRef);
    return () => ctx.revert();
  }, []);

  const trending = products.filter((p) => p.status === "Published").slice(0, 8);
  const deals = products.filter((p) => p.badge === "Flash deal");
  const arrivals = products.filter((p) => p.badge === "New" || p.badge === "Best seller").slice(0, 4);
  const popular = products.slice(4, 8);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero Section */}
      <section className="sm:pt-6 sm:pb-12 sm:px-6">
        <div className="mx-auto max-w-7xl sm:container-x sm:px-0">
          {/* Background wrapper: hidden on mobile, shown on sm+ */}
          <div className="sm:bg-primary-soft/30 sm:dark:bg-primary-dark/20 sm:rounded-[2.5rem] sm:p-10 lg:p-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 sm:gap-8 lg:gap-12 items-center">

              {/* Right: Sliding Image Carousel — full-bleed on mobile */}
              <div className="relative h-[52vw] min-h-[240px] max-h-[420px] sm:h-[300px] lg:h-[450px] w-full overflow-hidden sm:rounded-3xl shadow-xl order-1 lg:order-2">
                {HERO_IMAGES.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt="Premium tech device"
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out ${
                      i === heroIndex ? "opacity-100" : "opacity-0"
                    }`}
                  />
                ))}
                {/* Gradient overlay on mobile so text below reads cleanly */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent sm:hidden" />
                {/* Pagination Dots */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                  {HERO_IMAGES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setHeroIndex(i)}
                      aria-label={`Go to slide ${i + 1}`}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === heroIndex ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Left: Text Content */}
              <div ref={heroRef} className="max-w-xl order-2 lg:order-1 px-4 pt-6 pb-10 sm:px-0 sm:py-0">
                <div className="hero-element">
                  <Badge variant="outline" className="w-fit bg-background/50 rounded-full border px-3 py-1.5 text-[0.7rem] sm:text-xs shadow-sm">
                    <Sparkles className="mr-1.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    <span>1,400+ verified devices · updated hourly</span>
                  </Badge>
                </div>

                <h1 className="hero-element mt-5 font-display text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl xl:text-6xl text-foreground">
                  Find Your Next <span className="text-gradient-brand">Device</span>
                </h1>

                <p className="hero-element mt-4 sm:mt-6 text-sm sm:text-base lg:text-lg leading-relaxed text-muted-foreground">
                  Real stock levels, full specifications and honest condition grading for laptops, phones, tablets and accessories — from Accra's most trusted electronics retailers.
                </p>
                <div className="hero-element mt-6 sm:mt-8 flex flex-wrap gap-3">
                  <Button asChild variant="hero" size="lg" className="rounded-full px-6 sm:px-8 shadow-md">
                    <Link to="/products" search={{}}>Shop Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="rounded-full px-6 sm:px-8 bg-background/50 backdrop-blur-md">
                    <Link to="/products" search={{ deals: true }}>View Deals</Link>
                  </Button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Brands Marquee */}
      <section className="border-y border-border bg-surface overflow-hidden py-2.5">
        <div className="flex items-center">
          <p className="w-[35%] shrink-0 pl-8 pr-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground border-r border-border">
            Stocked brands
          </p>
          <div
            className="relative flex-1 overflow-hidden"
            style={{ maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)" }}
          >
            <div
              className="flex items-center"
              style={{ animation: "marquee 24s linear infinite", width: "max-content" }}
            >
              {[...brands, ...brands].map((b, i) => (
                <Link
                  key={i}
                  to="/products"
                  search={{ brand: b.name }}
                  className="font-display text-sm font-semibold text-muted-foreground whitespace-nowrap transition-colors hover:text-foreground mx-8"
                >
                  {b.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trending carousel */}
      <Section
        eyebrow="Trending now"
        title="What Accra is buying this week"
        action={{ label: "Browse all", to: "/products" }}
      >
        <div className="flex w-full gap-4 overflow-x-auto snap-x snap-mandatory pb-4 no-scrollbar">
          {trending.map((p) => (
            <div key={p.id} className="min-w-[85%] sm:min-w-[50%] lg:min-w-[33.33%] xl:min-w-[25%] snap-start">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </Section>

      {/* Flash deals */}
      <section className="bg-surface-muted section-pad">
        <Reveal className="mx-auto max-w-7xl container-x">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground">
                <Flame className="h-4 w-4" /> Flash deals
              </p>
              <h2 className="mt-1 text-xl font-extrabold sm:text-2xl lg:text-3xl">Ends in 06 : 41 : 12</h2>
            </div>
            <Badge className="shrink-0 border-transparent bg-brand-gradient text-primary-foreground">
              <Timer className="mr-1.5 h-3.5 w-3.5" /> Today only
            </Badge>
          </div>
          <div className="mt-8">
            {deals.length === 0 ? (
              <ProductGridSkeleton />
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

      {/* Categories */}
      <Section eyebrow="Categories" title="Shop by what you need">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.name}
              to="/products"
              search={{ category: c.name }}
              className="group hover-lift relative overflow-hidden rounded-2xl border border-border bg-card shadow-card"
            >
              <div className="aspect-[4/3] overflow-hidden bg-surface-muted">
                <img
                  src={c.image}
                  alt={c.name}
                  loading="lazy"
                  width={1024}
                  height={1024}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display text-[15px] font-bold">{c.name}</h3>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground">{c.blurb}</p>
                <p className="mt-3 text-xs font-semibold text-accent-foreground">
                  {c.count} products
                </p>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* New arrivals + popular */}
      <Section
        eyebrow="New arrivals"
        title="Just landed in the warehouse"
        action={{ label: "See new stock", to: "/products" }}
        muted
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {arrivals.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </Section>

      <Section eyebrow="Popular products" title="Most viewed this month">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {popular.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </Section>

      {/* Why shop */}
      <section className="section-pad bg-surface">
        <Reveal className="mx-auto max-w-7xl container-x">
          <h2 className="max-w-2xl text-xl font-extrabold sm:text-3xl">
            Why thousands shop with Voltix
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                icon: BadgeCheck,
                title: "Every unit verified",
                text: "Serial-checked, battery-tested and condition-graded before it goes live. What you see is the exact unit you get.",
              },
              {
                icon: MessageCircle,
                title: "Answers on WhatsApp",
                text: "No forms, no waiting. Tap enquire and talk to a real person about pricing, bundles or bulk orders.",
              },
              {
                icon: Truck,
                title: "Same-day dispatch",
                text: "Order before 2pm for same-day delivery across Accra, next-day nationwide with tracked couriers.",
              },
            ].map((f, i) => (
              <Reveal
                key={f.title}
                delay={i * 90}
                className="hover-lift rounded-2xl border border-border bg-card p-6 shadow-card"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-accent-foreground">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 font-display text-lg font-bold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
              </Reveal>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Reviews */}
      <Section eyebrow="Customer reviews" title="Trusted by buyers and IT teams" muted>
        <div className="grid gap-5 md:grid-cols-3">
          {reviews.map((r) => (
            <figure
              key={r.name}
              className="hover-lift flex flex-col rounded-2xl border border-border bg-card p-6 shadow-card"
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
                <p className="text-sm font-semibold">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      {/* Newsletter */}
      <section className="container-x pb-16">
        <Reveal className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-brand-gradient dark:bg-brand-gradient/80 container-x py-12 shadow-glow sm:py-16">
          <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
            <div className="text-primary-foreground">
              <h2 className="text-xl font-extrabold sm:text-3xl">
                Get restocks and flash deals first
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed opacity-90 sm:text-base">
                One email a week. New arrivals, price drops and refurbished units before they sell
                out. No spam, unsubscribe anytime.
              </p>
              <p className="mt-5 flex items-center gap-2 text-xs opacity-90">
                <ShieldCheck className="h-4 w-4" /> 9,200+ subscribers
              </p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                toast.success("You're on the list — watch your inbox.");
              }}
              className="glass flex flex-col gap-2 rounded-2xl border p-2 sm:flex-row"
            >
              <Input
                type="email"
                required
                placeholder="you@email.com"
                aria-label="Email address"
                className="h-11 border-0 bg-transparent shadow-none focus-visible:ring-0"
              />
              <Button type="submit" className="h-11 shrink-0">
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
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}
