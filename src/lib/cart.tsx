import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react";
import type { Product } from "@/lib/store-data";
import { supabase } from "@/integrations/supabase/client";

export type CartItem = {
  product: Product;
  qty: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (product: Product, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  count: number;
  subtotal: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "urbanvault-cart";

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem("voltix-cart");
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // quota exceeded — silently ignore
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const userRef = useRef<string | null>(null);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  useEffect(() => {
    const local = loadCart();
    setItems(local);
    setIsMounted(true);

    // Sync with remote user cart if logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        userRef.current = session.user.id;
        const remoteCart = (session.user.user_metadata?.cart as CartItem[]) || [];
        if (remoteCart.length > 0) {
          // Merge remote cart items with local
          setItems((prev) => {
            const merged = [...prev];
            for (const rItem of remoteCart) {
              const existing = merged.find((i) => i.product.id === rItem.product.id);
              if (!existing) {
                merged.push(rItem);
              }
            }
            return merged;
          });
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      userRef.current = session?.user?.id ?? null;
      if (session?.user?.user_metadata?.cart) {
        const remoteCart = session.user.user_metadata.cart as CartItem[];
        setItems((prev) => {
          if (prev.length === 0 && remoteCart.length > 0) return remoteCart;
          return prev;
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Persist to localStorage and Supabase on change
  useEffect(() => {
    if (!isMounted) return;
    saveCart(items);

    if (userRef.current) {
      const timer = setTimeout(() => {
        supabase.auth.updateUser({ data: { cart: items } }).catch(() => {});
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [items, isMounted]);

  const addItem = (product: Product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, qty: Math.min(i.qty + qty, product.stock) }
            : i,
        );
      }
      return [...prev, { product, qty: Math.min(qty, product.stock) }];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const updateQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, qty } : i)),
    );
  };

  const clearCart = () => setItems([]);

  const count = items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        count,
        subtotal,
        isOpen,
        setIsOpen,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
