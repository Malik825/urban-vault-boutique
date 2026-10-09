import { Link, useLocation } from "@tanstack/react-router";
import { Home, Search, Heart, User } from "lucide-react";

const NAV_ITEMS = [
  { label: "Home", icon: Home, to: "/" as const },
  { label: "Shop", icon: Search, to: "/products" as const },
  { label: "Wishlist", icon: Heart, to: "/wishlist" as const },
  { label: "Account", icon: User, to: "/account" as const },
];

export function MobileNav() {
  const { pathname } = useLocation();

  // Hide on dashboard or checkout routes where we want focus
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/checkout")) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-border bg-background/95 backdrop-blur-md px-2 pb-safe pt-1 sm:hidden shadow-lg">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to));

        return (
          <Link
            key={item.label}
            to={item.to as any}
            search={{}}
            className={`relative flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors ${
              isActive ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <item.icon
              className={`h-5 w-5 transition-transform ${isActive ? "scale-110" : ""}`}
              strokeWidth={isActive ? 2.5 : 2}
            />
            <span className="text-[11px] font-medium tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
