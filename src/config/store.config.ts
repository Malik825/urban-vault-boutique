export interface StoreConfig {
  id: string;
  name: string;
  displayName: string;
  tagline: string;
  description: string;
  siteUrl: string;
  phone: string;
  whatsapp: string;
  whatsappRaw: string;
  email: string;
  city: string;
  address: string;
  pickupLocation: string;
  currencyCode: string;
  currencySymbol: string;
  logoUrl: string;
  hero: {
    badge: string;
    headline: string;
    subheadline: string;
    ctaPrimary: { text: string; link: string };
    ctaSecondary: { text: string; link: string };
    slides: Array<{
      image: string;
      caption?: string;
    }>;
  };
  features: {
    enablePaystack: boolean;
    enableCashOnDelivery: boolean;
    enableMobileMoney: boolean;
    enableWhatsAppOrdering: boolean;
  };
  socials: {
    instagram?: string;
    tiktok?: string;
    facebook?: string;
  };
}

export const URBAN_VAULT_CONFIG: StoreConfig = {
  id: "urban-vault",
  name: "URBAN VAULT UNISEX BOUTIQUE",
  displayName: "Urban Vault",
  tagline: "Assin Fosu's premier unisex streetwear, footwear & contemporary fashion destination",
  description: "Urban Vault Unisex Boutique — Assin Fosu showroom. Curated unisex apparel, luxury footwear, everyday streetwear, and high-fashion essentials with local Assin Fosu delivery and nationwide Ghana shipping.",
  siteUrl: "https://urbanvaultgh.com",
  phone: "+233 55 475 3212",
  whatsapp: "+233 55 475 3212",
  whatsappRaw: "233554753212",
  email: "orders@urbanvaultgh.com",
  city: "Assin Fosu, Central Region, Ghana",
  address: "Main Commercial High Street, Assin Fosu, Central Region, Ghana",
  pickupLocation: "Urban Vault Showroom, Assin Fosu",
  currencyCode: "GHS",
  currencySymbol: "GH₵",
  logoUrl: "/boutique/urban_vault_logo_1792394705888.webp",
  hero: {
    badge: "Assin Fosu Showroom · New Season 2026",
    headline: "URBAN VAULT UNISEX BOUTIQUE",
    subheadline: "Assin Fosu's premier destination for curated streetwear, designer footwear, and modern unisex apparel crafted for bold individual expression.",
    ctaPrimary: { text: "Shop New Arrivals", link: "/products" },
    ctaSecondary: { text: "Order via WhatsApp", link: "https://wa.me/233554753212" },
    slides: [
      {
        image: "/boutique/urban_vault_hero_1_1792394728170.webp",
        caption: "Luxury Streetwear & Essentials",
      },
      {
        image: "/boutique/urban_vault_hero_2_1792394739729.webp",
        caption: "Contemporary Unisex Fits",
      },
      {
        image: "/boutique/urban_vault_hero_3_1792394763146.webp",
        caption: "Exclusive Footwear Collection",
      },
    ],
  },
  features: {
    enablePaystack: true,
    enableCashOnDelivery: true,
    enableMobileMoney: true,
    enableWhatsAppOrdering: true,
  },
  socials: {
    instagram: "https://instagram.com/urbanvaultboutique",
    tiktok: "https://tiktok.com/@urbanvaultboutique",
  },
};

// Current active store configuration
export const ACTIVE_STORE: StoreConfig = URBAN_VAULT_CONFIG;
