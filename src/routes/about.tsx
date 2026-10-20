import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Building2,
  CheckCircle2,
  CreditCard,
  Globe,
  Heart,
  LayoutGrid,
  MessageCircle,
  Package,
  ShieldCheck,
  Smartphone,
  MapPin,
  Star,
  Truck,
  Zap,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/storefront/site-header";
import { SiteFooter } from "@/components/storefront/site-footer";
import { Reveal } from "@/components/reveal";
import TextAnimation from "@/components/ui/scroll-text";
import { STORE, whatsappLink } from "@/lib/store-data";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: `About ${STORE.name} — Modern Fashion Boutique, Accra Ghana` },
      {
        name: "description",
        content: `${STORE.name} is a premier fashion boutique in Accra, Ghana offering curated unisex apparel, streetwear, and footwear with Paystack, Cash on Delivery, and instant WhatsApp ordering.`,
      },
      { property: "og:url", content: `${STORE.siteUrl}/about` },
    ],
    links: [{ rel: "canonical", href: `${STORE.siteUrl}/about` }],
  }),
  component: AboutPage,
});

const capabilities = [
  {
    icon: Smartphone,
    title: "Mobile-First Storefront",
    description: "Built for African shoppers browsing on Android & iOS mobile devices with ultra-fast page speed and zero lag.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Commerce",
    description: "Pre-filled product queries, instant price confirmation, and one-click cart export directly into WhatsApp chat.",
  },
  {
    icon: CreditCard,
    title: "Digital & MoMo Payments",
    description: "Ready for Ghanaian Mobile Money (MTN MoMo, Telecel Cash, AirtelTigo) and card processing via Paystack.",
  },
  {
    icon: Package,
    title: "Transparent Product Catalogue",
    description: "Standardised condition grading (New, Open Box, Refurbished) and detailed specs eliminating endless 'DM for price'.",
  },
  {
    icon: Building2,
    title: "B2B & Bulk Ordering",
    description: "Demonstrates that the same platform supports direct consumer retail and high-value corporate quotation requests.",
  },
  {
    icon: Truck,
    title: "Regional Delivery Logic",
    description: "Accra same-day delivery, regional courier tiers (Kumasi, Takoradi, Tamale), and free in-store pickup options.",
  },
];

const pillars = [
  {
    title: "The Problem Facing Local Retailers",
    description:
      "Most electronics and gadget sellers in Accra and across Africa rely exclusively on WhatsApp status updates, Instagram DMs, and TikTok. While these channels generate initial attention, they suffer from lost sales, constant repetitive messages ('How much? Is it available?'), unorganized orders, and high customer hesitation.",
  },
  {
    title: "The Storefront Solution",
    description:
      "This storefront demonstrates how a traditional electronics business can transition to a credible, high-converting digital storefront. Customers get instant access to live stock, detailed specifications, Ghanaian Cedi pricing, and flexible checkout — while preserving the familiar, trusted WhatsApp channel.",
  },
  {
    title: "Built as a Sellable Asset",
    description:
      "Every component in this project — from the live product filtering and cart drawer to the Mobile Money payment UI and WhatsApp cart dispatcher — is engineered as a deployable solution for real businesses looking to upgrade their online presence.",
  },
];

function AboutPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heroRef.current || !heroContentRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        heroContentRef.current,
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero */}
      <section ref={heroRef} className="relative overflow-hidden py-16 sm:py-24 border-b border-border bg-surface-muted/50">
        <div className="mx-auto max-w-7xl container-x relative z-10">
          <div ref={heroContentRef} className="max-w-3xl">
            <Badge variant="outline" className="mb-4 bg-background border-border text-foreground/80 font-mono text-[11px] uppercase tracking-wider">
              <MapPin className="mr-1.5 h-3.5 w-3.5 text-primary" /> Accra, Ghana
            </Badge>

            <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-foreground leading-[1.15]">
              Curated fashion &amp; streetwear in Ghana.
            </h1>

            <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed">
              {STORE.name} is a contemporary boutique based in Accra. We provide curated unisex streetwear, designer shirts, premium footwear, and everyday luxury essentials with transparent pricing and same-day doorstep delivery.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="rounded-full px-7 font-bold">
                <Link to="/products">Browse Our Catalogue</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-6 bg-background">
                <a
                  href={whatsappLink(`Hello ${STORE.name}! I'd like to enquire about your products.`)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle className="mr-2 h-4 w-4 text-primary" />
                  Chat on WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Context Pillars */}
      <section className="section-pad bg-surface border-b border-border">
        <div className="mx-auto max-w-7xl container-x">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Our Story</p>
            <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl lg:text-4xl tracking-tight">
              Moving from social media to a professional storefront
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {pillars.map((p, i) => (
              <Reveal key={p.title} delay={i * 80} className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold font-mono">
                  0{i + 1}
                </span>
                <h3 className="font-display text-lg font-bold text-foreground">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features demonstrated */}
      <section className="section-pad bg-surface-muted border-b border-border">
        <div className="mx-auto max-w-7xl container-x">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">What We Offer</p>
            <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl lg:text-4xl tracking-tight">
              Everything you need to shop with confidence
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground">
              From verified product specs to Mobile Money checkout and WhatsApp ordering — we've built a complete retail experience for Ghanaian shoppers.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((c, i) => {
              const Icon = c.icon;
              return (
                <Reveal key={c.title} delay={i * 60} className="hover-lift rounded-2xl border border-border bg-card p-6 shadow-card">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-base font-bold text-foreground">{c.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{c.description}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Deployable Pitch Box */}
      <section className="section-pad bg-surface">
        <div className="mx-auto max-w-5xl container-x">
          <div className="rounded-3xl border border-border bg-brand-gradient text-primary-foreground p-8 sm:p-12 shadow-glow text-center space-y-5">
            <Badge variant="outline" className="border-white/30 text-white text-xs">
              Ready to Order
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight max-w-2xl mx-auto">
              Shop the full catalogue or send us a direct enquiry
            </h2>
            <p className="text-sm sm:text-base opacity-90 max-w-xl mx-auto leading-relaxed">
              Explore curated unisex streetwear, contemporary shirts, and luxury footwear with transparent GH₵ pricing. Order online with Paystack, Cash on Delivery, or chat with us on WhatsApp.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" variant="secondary" className="rounded-full px-8 font-bold">
                <a
                  href={whatsappLink(`Hello ${STORE.name}! I'd like to place an order or get more information.`)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle className="mr-2 h-4 w-4 text-primary" />
                  Chat on WhatsApp
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-8 border-white/40 text-white hover:bg-white/10">
                <Link to="/products">Browse Products</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
