import { useState, useEffect } from "react";
import { STORE } from "./store-data";

export const SETTINGS_STORAGE_KEY = "urban_vault_store_settings";

export interface StoreSettings {
  storeName: string;
  themeColor: string;
  whatsapp: string;
  whatsappMessage: string;
  showWhatsappButton: boolean;
  socialInstagram: string;
  socialTwitter: string;
  socialTiktok: string;
  socialFacebook: string;
  payMomo: boolean;
  payPaystack: boolean;
  payCod: boolean;
  payPickup: boolean;
  deliveryLocal: string;
  deliveryNational: string;
  freeDeliveryThreshold: string;
  seoTitle: string;
  seoKeywords: string;
  seoDescription: string;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: STORE.name,
  themeColor: "#F43F5E",
  whatsapp: STORE.whatsapp,
  whatsappMessage: "Hi Urban Vault, I'm interested in this item — is it available in my size?",
  showWhatsappButton: true,
  socialInstagram: "",
  socialTwitter: "",
  socialTiktok: "",
  socialFacebook: "",
  payMomo: true,
  payPaystack: true,
  payCod: true,
  payPickup: true,
  deliveryLocal: "35",
  deliveryNational: "60",
  freeDeliveryThreshold: "500",
  seoTitle: "Urban Vault Unisex Boutique — Streetwear & Designer Apparel Assin Fosu",
  seoKeywords: "boutique assin fosu, unisex streetwear, vintage wash tees, designer sneakers ghana",
  seoDescription:
    "Shop curated unisex fashion, premium streetwear, heavyweight tees, luxury footwear, and designer statement pieces at Urban Vault Unisex Boutique. Fast delivery across Assin Fosu and Ghana.",
};

export function loadSettings(): StoreSettings {
  if (typeof window === "undefined") return DEFAULT_STORE_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) return { ...DEFAULT_STORE_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_STORE_SETTINGS;
}

export function saveSettings(settings: StoreSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent("uv-settings-change", { detail: settings }));
}

export function useStoreSettings(): StoreSettings {
  const [settings, setSettings] = useState<StoreSettings>(() => loadSettings());

  useEffect(() => {
    function handleChange(e: Event) {
      const customEvent = e as CustomEvent<StoreSettings>;
      if (customEvent.detail) {
        setSettings(customEvent.detail);
      } else {
        setSettings(loadSettings());
      }
    }

    window.addEventListener("uv-settings-change", handleChange);
    window.addEventListener("storage", handleChange);

    return () => {
      window.removeEventListener("uv-settings-change", handleChange);
      window.removeEventListener("storage", handleChange);
    };
  }, []);

  return settings;
}
