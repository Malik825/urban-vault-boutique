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
  tagline: "Exclusive unisex streetwear, footwear & contemporary fashion",
  description: "Accra's premier boutique for curated unisex apparel, luxury footwear, everyday streetwear, and high-fashion essentials with nationwide Ghana delivery.",
  siteUrl: "https://urbanvaultgh.com",
  phone: "+233 59 748 9841",
  whatsapp: "+233 59 748 9841",
  whatsappRaw: "233597489841",
  email: "orders@urbanvaultgh.com",
  city: "Accra, Ghana",
  address: "Osu / East Legon, Accra, Ghana",
  pickupLocation: "Urban Vault Showroom, Accra",
  currencyCode: "GHS",
  currencySymbol: "GH₵",
  logoUrl: "/boutique/urban_vault_logo_1792394705888.webp",
  hero: {
    badge: "New Season Arrivals 2026",
    headline: "URBAN VAULT UNISEX BOUTIQUE",
    subheadline: "Curated streetwear, designer footwear, and modern unisex apparel crafted for bold individual expression.",
    ctaPrimary: { text: "Shop New Arrivals", link: "/products" },
    ctaSecondary: { text: "Order via WhatsApp", link: "https://wa.me/233597489841" },
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
