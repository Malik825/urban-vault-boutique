import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { CatalogProduct } from "@/lib/catalog";

// ─── Types ────────────────────────────────────────────────────────────────────

type WishlistContextType = {
  wishlist: CatalogProduct[];
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (product: CatalogProduct) => void;
};

type CompareContextType = {
  compareList: CatalogProduct[];
  isComparing: (productId: string) => boolean;
  addToCompare: (product: CatalogProduct) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
};

// ─── Contexts ─────────────────────────────────────────────────────────────────

const WishlistContext = createContext<WishlistContextType | null>(null);
const CompareContext = createContext<CompareContextType | null>(null);

// ─── LocalStorage helpers ─────────────────────────────────────────────────────

const WISHLIST_KEY = "urbanvault-wishlist";
const COMPARE_KEY = "urbanvault-compare";

function getStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function setStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded — silently ignore
  }
}

// ─── Wishlist Provider ────────────────────────────────────────────────────────

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<CatalogProduct[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setWishlist(getStorage<CatalogProduct[]>(WISHLIST_KEY, []));
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) setStorage(WISHLIST_KEY, wishlist);
  }, [wishlist, isMounted]);

  const isWishlisted = useCallback(
    (productId: string) => wishlist.some((p) => p.id === productId),
    [wishlist],
  );

  const toggleWishlist = useCallback((product: CatalogProduct) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      return exists ? prev.filter((p) => p.id !== product.id) : [...prev, product];
    });
  }, []);

  return (
    <WishlistContext.Provider value={{ wishlist, isWishlisted, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside <WishlistProvider>");
  return ctx;
}

// ─── Compare Provider ─────────────────────────────────────────────────────────

const MAX_COMPARE = 4;

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareList, setCompareList] = useState<CatalogProduct[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setCompareList(getStorage<CatalogProduct[]>(COMPARE_KEY, []));
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) setStorage(COMPARE_KEY, compareList);
  }, [compareList, isMounted]);

  const isComparing = useCallback(
    (productId: string) => compareList.some((p) => p.id === productId),
    [compareList],
  );

  const addToCompare = useCallback((product: CatalogProduct) => {
    setCompareList((prev) => {
      if (prev.some((p) => p.id === product.id)) return prev;
      if (prev.length >= MAX_COMPARE) {
        // Remove oldest, add new
        return [...prev.slice(1), product];
      }
      return [...prev, product];
    });
  }, []);

  const removeFromCompare = useCallback((productId: string) => {
    setCompareList((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const clearCompare = useCallback(() => setCompareList([]), []);

  return (
    <CompareContext.Provider
      value={{ compareList, isComparing, addToCompare, removeFromCompare, clearCompare }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used inside <CompareProvider>");
  return ctx;
}


