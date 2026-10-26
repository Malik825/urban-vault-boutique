import { STORE, whatsappLink } from "@/lib/store-data";

export interface HeroSlide {
  id?: string;
  image: string;
  badge: string;
  headlineLine1: string;
  headlineHighlight: string;
  subtitle: string;
  primaryCta: {
    text: string;
    to: string;
    search?: Record<string, string>;
  };
  secondaryCta: {
    text: string;
    href: string;
  };
  tabLabel?: string;
  code?: string;
}

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: "slide-1",
    image: "/boutique/urban_vault_hero_1_1792394728170.webp",
    badge: "Season 2026 // Streetwear Drop",
    headlineLine1: "DRESS THE",
    headlineHighlight: "CULTURE.",
    subtitle:
      "Curated unisex streetwear, graphic tees, designer hoodies, and elevated contemporary aesthetics crafted for fearless self-expression.",
    primaryCta: {
      text: "Shop New Drop",
      to: "/products",
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
    id: "slide-2",
    image: "/boutique/urban_vault_hero_2_1792394739729.webp",
    badge: "Unisex Silhouettes // Modern Fit",
    headlineLine1: "EFFORTLESS",
    headlineHighlight: "LUXURY.",
    subtitle:
      "Modern unisex tracksuits, oversized silhouettes, and elevated wardrobe essentials. Premium fabrics made for everyday luxury and all-day comfort.",
    primaryCta: {
      text: "Explore Unisex Fits",
      to: "/products",
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
    id: "slide-3",
    image: "/boutique/urban_vault_hero_3_1792394763146.webp",
    badge: "Exclusive Footwear // Kicks & Slides",
    headlineLine1: "STEP INTO",
    headlineHighlight: "PREMIUM.",
    subtitle:
      "From rare statement sneakers to everyday boutique slides. Elevate your footwear rotation with verified authenticity and showroom pickup.",
    primaryCta: {
      text: "Browse Footwear",
      to: "/products",
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
