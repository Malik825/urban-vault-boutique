import { Link, useLocation } from "@tanstack/react-router";
import { Home, LayoutGrid, Heart, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/lib/cart";

const NAV_ITEMS = [
  { label: "Home", icon: Home, to: "/" as const },
  { label: "Shop", icon: LayoutGrid, to: "/products" as const },
  { label: "Wishlist", icon: Heart, to: "/wishlist" as const },
  { label: "Cart", icon: ShoppingBag, to: "/checkout" as const, isCart: true },
  { label: "Account", icon: User, to: "/account" as const },
];

export function MobileNav() {
  const { pathname } = useLocation();
  const { count } = useCart();

  // Hide on dashboard or checkout routes where we want focus
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/checkout")) {
    return null;
  }

  return (
    <nav className="glass fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-border bg-background/80 px-2 pb-safe pt-1 sm:hidden">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to));

        return (
          <Link
            key={item.label}
            to={item.to as any}
            search={{}}
            className={`relative flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors ${
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="relative">
              <item.icon
                className={`h-5 w-5 transition-transform ${isActive ? "scale-110" : ""}`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              {item.isCart && count > 0 && (
                <span className="absolute -right-2 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground shadow-sm">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
