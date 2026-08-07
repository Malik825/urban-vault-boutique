import { useState } from "react";
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
import { ProductCard } from "@/components/storefront/product-card";
import { SiteFooter } from "@/components/storefront/site-footer";
import { SiteHeader } from "@/components/storefront/site-header";
import { brands, categories, reviews, popularSearches } from "@/lib/store-data";
import { listPublishedProducts } from "@/lib/catalog.functions";
import type { CatalogProduct } from "@/lib/catalog";
import { Reveal } from "@/components/reveal";
import heroImg from "@/assets/hero.jpg";

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

  const trending = products.filter((p) => p.status === "Published").slice(0, 8);
  const deals = products.filter((p) => p.badge === "Flash deal");
  const arrivals = products.filter((p) => p.badge === "New" || p.badge === "Best seller").slice(0, 4);
  const popular = products.slice(4, 8);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-mesh">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 pb-14 pt-12 sm:px-6 md:pb-20 md:pt-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          <div className="min-w-0 animate-fade-up">

            <Badge variant="outline" className="glass rounded-full border px-3 py-1.5 text-[0.7rem] sm:text-xs">
              <Sparkles className="mr-1.5 h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="min-w-0">1,400+ verified devices · updated hourly</span>
            </Badge>
            <h1 className="mt-6 text-[2rem] font-extrabold leading-[1.08] sm:text-5xl lg:text-6xl">
              Find Your Next <span className="text-gradient-brand">Device</span>
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-lg">
              Real stock levels, full specifications and honest condition grading — from Lagos&apos;
              most trusted electronics retailers. Enquire on WhatsApp, get a reply in minutes.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                navigate({ to: "/products", search: q ? { q } : {} });
              }}
              className="mt-8"
            >
              <div className="glass flex items-center gap-2 rounded-2xl border p-2 shadow-lift">
                <Search className="ml-1 h-5 w-5 shrink-0 text-muted-foreground sm:ml-2" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search “MacBook Pro”, “16GB RAM”…"
                  aria-label="Search devices"
                  className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-muted-foreground sm:text-base"
                />
                <Button type="submit" variant="hero" className="shrink-0">
                  Search
                </Button>
              </div>
            </form>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Trending:</span>
              {popularSearches.slice(0, 4).map((s) => (
                <Link
                  key={s}
                  to="/products"
                  search={{ q: s }}
                  className="max-w-full truncate rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium transition-colors hover:border-primary/40 hover:bg-primary-soft"
                >
                  {s}
                </Link>
              ))}
            </div>

            <dl className="mt-10 grid max-w-md grid-cols-3 gap-3 sm:gap-4">
              {[
                { k: "1,4k+", v: "Devices listed" },
                { k: "4.9/5", v: "Buyer rating" },
                { k: "< 5 min", v: "Reply time" },
              ].map((s) => (
                <div key={s.v} className="min-w-0">
                  <dt className="font-display text-lg font-extrabold sm:text-2xl">{s.k}</dt>
                  <dd className="text-[0.7rem] text-muted-foreground sm:text-xs">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative min-w-0 animate-fade-in">

            <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-lift">
              <img
                src={heroImg}
                alt="Premium laptop, phone, tablet and headphones on a bright desk"
                width={1600}
                height={1104}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="glass absolute -bottom-4 left-4 rounded-2xl border p-4 shadow-lift sm:left-6">
              <p className="text-xs text-muted-foreground">Fastest enquiry today</p>
              <p className="mt-1 flex items-center gap-2 font-display text-sm font-bold">
                <MessageCircle className="h-4 w-4 text-primary" /> Replied in 1m 42s
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Brands */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-4 py-8 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Authorised stock from
          </p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            {brands.map((b) => (
              <Link
                key={b.name}
                to="/products"
                search={{ brand: b.name }}
                className="font-display text-lg font-bold text-muted-foreground transition-colors hover:text-foreground sm:text-xl"
              >
                {b.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trending carousel */}
      <Section
        eyebrow="Trending now"
        title="What Lagos is buying this week"
        action={{ label: "Browse all", to: "/products" }}
      >
        <Carousel opts={{ align: "start" }} className="w-full">
          <CarouselContent className="-ml-4">
            {trending.map((p) => (
              <CarouselItem key={p.id} className="basis-[78%] pl-4 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <ProductCard product={p} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden lg:flex" />
          <CarouselNext className="hidden lg:flex" />
        </Carousel>
      </Section>

      {/* Flash deals */}
      <section className="bg-surface-muted section-pad">
        <Reveal className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground">
                <Flame className="h-4 w-4" /> Flash deals
              </p>
              <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">Ends in 06 : 41 : 12</h2>
            </div>
            <Badge className="shrink-0 border-transparent bg-brand-gradient text-primary-foreground">
              <Timer className="mr-1.5 h-3.5 w-3.5" /> Today only
            </Badge>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {deals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
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
                  <h3 className="font-display text-base font-bold">{c.name}</h3>
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
        <Reveal className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="max-w-2xl text-2xl font-extrabold sm:text-4xl">
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
                text: "Order before 2pm for same-day delivery across Lagos, next-day nationwide with tracked couriers.",
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
      <section className="px-4 pb-16 sm:px-6">
        <Reveal className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-brand-gradient px-6 py-12 shadow-glow sm:px-12 sm:py-16">
          <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
            <div className="text-primary-foreground">
              <h2 className="text-2xl font-extrabold sm:text-4xl">
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
      <Reveal className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground">
              {eyebrow}
            </p>
            <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">{title}</h2>
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
      </Reveal>
    </section>
  );
}
