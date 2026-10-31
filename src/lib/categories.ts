import { useEffect, useState } from "react";
import { CATEGORIES_TAXONOMY, type CategoryTaxonomy } from "@/lib/store-data";
import {
  adminGetCategories,
  adminSaveCategories,
  getPublicCategories,
} from "@/lib/categories.functions";

export const CATEGORIES_STORAGE_KEY = "urban_vault_categories";
export const CATEGORIES_CHANGE_EVENT = "uv-categories-change";

/**
 * Creates a slugified ID for new categories
 */
export function slugifyCategory(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Synchronously load categories from localStorage, falling back to CATEGORIES_TAXONOMY.
 */
export function loadStoredCategories(): CategoryTaxonomy[] {
  if (typeof window === "undefined") return CATEGORIES_TAXONOMY;
  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (!raw) return CATEGORIES_TAXONOMY;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const existingIds = new Set(parsed.map((c: CategoryTaxonomy) => c.id || c.name));
      const missingDefaults = CATEGORIES_TAXONOMY.filter(
        (def) => !existingIds.has(def.id) && !existingIds.has(def.name),
      );
      return [...parsed, ...missingDefaults];
    }
  } catch (e) {
    console.warn("Failed to load categories from localStorage:", e);
  }
  return CATEGORIES_TAXONOMY;
}

/**
 * Synchronously save categories to localStorage and broadcast an event to other components/tabs.
 */
export function saveStoredCategories(categories: CategoryTaxonomy[]) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
      window.dispatchEvent(
        new CustomEvent(CATEGORIES_CHANGE_EVENT, { detail: categories }),
      );
    } catch (e) {
      console.warn("Failed to save categories to localStorage:", e);
    }
  }
}

export interface CategoryGroup {
  label: string;
  items: CategoryTaxonomy[];
}

/**
 * Groups categories logically into curated boutique departments for clean dropdown UI/UX.
 */
export function groupCategoriesForSelect(categories: CategoryTaxonomy[]): CategoryGroup[] {
  const groups: Record<string, CategoryTaxonomy[]> = {
    "Tops & Upperwear": [],
    "Dresses, Skirts & Sets": [],
    "Men's Traditional & Tailoring": [],
    "Bottoms & Trousers": [],
    "Footwear": [],
    "Accessories, Bags & Jewelry": [],
  };

  const otherGroups: Record<string, CategoryTaxonomy[]> = {};

  for (const cat of categories) {
    const lower = `${cat.name} ${cat.subcategories?.join(" ") || ""}`.toLowerCase();

    if (
      lower.includes("skirt") ||
      lower.includes("dress") ||
      lower.includes("two piece") ||
      lower.includes("2 piece") ||
      lower.includes("co-ord") ||
      lower.includes("trousers & shirt")
    ) {
      groups["Dresses, Skirts & Sets"]?.push(cat);
    } else if (
      lower.includes("round neck") ||
      lower.includes("shirt") ||
      lower.includes("top") ||
      lower.includes("tee") ||
      lower.includes("hoodie") ||
      lower.includes("jacket")
    ) {
      groups["Tops & Upperwear"]?.push(cat);
    } else if (
      lower.includes("kaftan") ||
      lower.includes("traditional") ||
      lower.includes("suit") ||
      lower.includes("tailor") ||
      lower.includes("blazer")
    ) {
      groups["Men's Traditional & Tailoring"]?.push(cat);
    } else if (
      lower.includes("bottom") ||
      lower.includes("trouser") ||
      lower.includes("pant") ||
      lower.includes("cargo") ||
      lower.includes("jean") ||
      lower.includes("short")
    ) {
      groups["Bottoms & Trousers"]?.push(cat);
    } else if (
      lower.includes("footwear") ||
      lower.includes("sneaker") ||
      lower.includes("shoe") ||
      lower.includes("slide") ||
      lower.includes("boot")
    ) {
      groups["Footwear"]?.push(cat);
    } else if (
      lower.includes("bag") ||
      lower.includes("luggage") ||
      lower.includes("jewelry") ||
      lower.includes("watch") ||
      lower.includes("headwear") ||
      lower.includes("cap") ||
      lower.includes("fragrance") ||
      lower.includes("grooming") ||
      lower.includes("accessori")
    ) {
      groups["Accessories, Bags & Jewelry"]?.push(cat);
    } else {
      const deptLabel =
        cat.department && cat.department !== "All"
          ? `${cat.department}'s Collection`
          : "Other Curations";
      if (!otherGroups[deptLabel]) otherGroups[deptLabel] = [];
      otherGroups[deptLabel].push(cat);
    }
  }

  const combined = [
    ...Object.entries(groups),
    ...Object.entries(otherGroups),
  ];

  return combined
    .filter(([_, items]) => items.length > 0)
    .map(([label, items]) => ({ label, items }));
}

/**
 * React hook that returns dynamic categories, stays synced across tabs/events,
 * and fetches the latest from Supabase Storage on mount.
 */
export function useDynamicCategories() {
  const [categories, setCategories] = useState<CategoryTaxonomy[]>(() =>
    loadStoredCategories(),
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<CategoryTaxonomy[]>;
      if (customEvent.detail && Array.isArray(customEvent.detail)) {
        setCategories(customEvent.detail);
      } else {
        setCategories(loadStoredCategories());
      }
    };

    window.addEventListener(CATEGORIES_CHANGE_EVENT, handleUpdate);
    window.addEventListener("storage", (e) => {
      if (e.key === CATEGORIES_STORAGE_KEY) {
        setCategories(loadStoredCategories());
      }
    });

    setLoading(true);
    getPublicCategories()
      .then((serverCats) => {
        if (!active) return;
        if (Array.isArray(serverCats) && serverCats.length > 0) {
          setCategories(serverCats);
          saveStoredCategories(serverCats);
        }
      })
      .catch((err) => {
        console.warn("Could not load server categories:", err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      window.removeEventListener(CATEGORIES_CHANGE_EVENT, handleUpdate);
    };
  }, []);

  const addCategoryOnTheFly = async (cat: {
    name: string;
    blurb?: string;
    department?: "All" | "Men" | "Women" | "Unisex";
    image?: string;
    subcategories?: string[];
  }) => {
    const trimmedName = cat.name.trim();
    if (!trimmedName) return null;

    const id = slugifyCategory(trimmedName);
    const existing = categories.find(
      (c) => c.name.toLowerCase() === trimmedName.toLowerCase() || c.id === id,
    );

    if (existing) {
      return existing;
    }

    const newCategory: CategoryTaxonomy = {
      id,
      name: trimmedName,
      department: cat.department || "All",
      image:
        cat.image ||
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
      blurb: cat.blurb?.trim() || `${trimmedName} boutique curation`,
      count: 0,
      subcategories: cat.subcategories || [trimmedName],
    };

    const nextList = [...categories, newCategory];
    setCategories(nextList);
    saveStoredCategories(nextList);

    try {
      await adminSaveCategories({ data: { categories: nextList } });
    } catch (e) {
      console.warn("Could not persist new category to server storage:", e);
    }

    return newCategory;
  };

  const updateCategory = async (id: string, patch: Partial<CategoryTaxonomy>) => {
    const nextList = categories.map((c) => (c.id === id ? { ...c, ...patch } : c));
    setCategories(nextList);
    saveStoredCategories(nextList);

    try {
      await adminSaveCategories({ data: { categories: nextList } });
    } catch (e) {
      console.warn("Could not persist category update to server storage:", e);
    }
  };

  return {
    categories,
    loading,
    setCategories,
    addCategoryOnTheFly,
    updateCategory,
  };
}
