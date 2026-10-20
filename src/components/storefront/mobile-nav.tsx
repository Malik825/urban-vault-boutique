import { Link, useLocation } from "@tanstack/react-router";
import { Home, ShoppingBag, ShoppingCart, Heart, User, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";

export function MobileNav() {
  const { pathname } = useLocation();
  const { isAdmin } = useAuth();
  const { count, openCart } = useCart();

  // Hide on dashboard or checkout routes where we want focus
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/checkout")) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-border bg-background/95 backdrop-blur-md px-1 pb-safe pt-1 sm:hidden shadow-lg">
      <Link
        to="/"
        className={`relative flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
          pathname === "/" ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Home className={`h-5 w-5 transition-transform ${pathname === "/" ? "scale-110" : ""}`} strokeWidth={pathname === "/" ? 2.5 : 2} />
        <span className="text-[10px] font-medium tracking-tight">Home</span>
      </Link>

      <Link
        to="/products"
        search={{}}
        className={`relative flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
          pathname.startsWith("/products") ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <ShoppingBag className={`h-5 w-5 transition-transform ${pathname.startsWith("/products") ? "scale-110" : ""}`} strokeWidth={pathname.startsWith("/products") ? 2.5 : 2} />
        <span className="text-[10px] font-medium tracking-tight">Shop</span>
      </Link>

      {/* Cart Button with real-time Badge */}
      <button
        type="button"
        onClick={openCart}
        aria-label={`Open shopping cart (${count} items)`}
        className="relative flex flex-col items-center justify-center gap-1 flex-1 h-full text-muted-foreground hover:text-foreground transition-colors group"
      >
        <div className="relative">
          <ShoppingCart className="h-5 w-5 transition-transform group-hover:scale-110" strokeWidth={2} />
          {count > 0 && (
            <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground shadow-xs animate-in zoom-in-75">
              {count}
            </span>
          )}
        </div>
        <span className="text-[10px] font-medium tracking-tight">Cart</span>
      </button>

      <Link
        to="/wishlist"
        className={`relative flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
          pathname === "/wishlist" ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Heart className={`h-5 w-5 transition-transform ${pathname === "/wishlist" ? "scale-110" : ""}`} strokeWidth={pathname === "/wishlist" ? 2.5 : 2} />
        <span className="text-[10px] font-medium tracking-tight">Saved</span>
      </Link>

      <Link
        to={isAdmin ? "/dashboard" : "/account"}
        className={`relative flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
          pathname.startsWith(isAdmin ? "/dashboard" : "/account") ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {isAdmin ? (
          <LayoutDashboard className={`h-5 w-5 transition-transform ${pathname.startsWith("/dashboard") ? "scale-110" : ""}`} strokeWidth={2} />
        ) : (
          <User className={`h-5 w-5 transition-transform ${pathname.startsWith("/account") ? "scale-110" : ""}`} strokeWidth={2} />
        )}
        <span className="text-[10px] font-medium tracking-tight">{isAdmin ? "Admin" : "Account"}</span>
      </Link>
    </nav>
  );
}
