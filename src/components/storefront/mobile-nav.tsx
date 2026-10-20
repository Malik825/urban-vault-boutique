import { Link, useLocation } from "@tanstack/react-router";
import { Home, Search, Heart, User, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/lib/auth";

export function MobileNav() {
  const { pathname } = useLocation();
  const { isAdmin } = useAuth();

  // Hide on dashboard or checkout routes where we want focus
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/checkout")) {
    return null;
  }

  const navItems = [
    { label: "Home", icon: Home, to: "/" as const },
    { label: "Shop", icon: Search, to: "/products" as const },
    { label: "Wishlist", icon: Heart, to: "/wishlist" as const },
    {
      label: isAdmin ? "Dashboard" : "Account",
      icon: isAdmin ? LayoutDashboard : User,
      to: (isAdmin ? "/dashboard" : "/account") as const,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-border bg-background/95 backdrop-blur-md px-2 pb-safe pt-1 sm:hidden shadow-lg">
      {navItems.map((item) => {
        const isActive = pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to));

        return (
          <Link
            key={item.label}
            to={item.to as any}
            search={{}}
            className={`relative flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors ${
              isActive ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
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
