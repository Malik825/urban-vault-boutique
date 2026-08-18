import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, Search, Heart, LayoutGrid, ArrowUpRight, ShoppingCart, Repeat2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { STORE } from "@/lib/store-data";
import { useCart } from "@/lib/cart";
import { SearchCommand } from "./search-command";
import { CartDrawer } from "./cart-drawer";

const nav = [
  { label: "Shop all", to: "/products" as const },
  { label: "Laptops", to: "/products" as const, search: { category: "Laptops" } },
  { label: "Phones", to: "/products" as const, search: { category: "Phones" } },
  { label: "Deals", to: "/products" as const, search: { deals: true } },
];

export function SiteHeader() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { count } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-500 ${scrolled ? "pt-4" : "pt-0"
          }`}
      >
        <div
          className={`mx-auto grid h-16 max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 transition-all duration-300 ${scrolled
            ? "glass rounded-full border border-border shadow-card px-4 w-[95%] sm:w-[90%]"
            : "border-b border-transparent bg-background px-4 sm:px-6 w-full"
            }`}
        >
          {/* Logo & Desktop Nav */}
          <div className="flex min-w-0 items-center gap-8">
            <Link to="/" className="flex shrink-0 items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl">
              <img src="/logo.jpg" alt="Voltix Logo" className="h-9 w-9 rounded-xl object-cover shadow-glow" />
              <span className="font-display text-base font-bold tracking-tight hidden sm:block">
                {STORE.name}
              </span>
            </Link>
            <nav className="hidden items-center gap-1 lg:flex">
              {nav.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  search={item.search as never}
                  className="rounded-full px-4 py-2 text-[13px] font-semibold text-muted-foreground transition-all hover:bg-surface-muted hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="flex justify-end lg:justify-center">
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden w-full max-w-md items-center gap-2 rounded-full border border-border bg-surface-muted px-4 py-2.5 text-sm text-muted-foreground transition-all hover:border-primary/40 hover:bg-surface md:flex shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Search className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left truncate font-medium">Search devices, brands, or specs…</span>
              <kbd className="hidden sm:inline-flex rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] font-bold shrink-0 shadow-xs">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            {/* Mobile Search Icon */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-full"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Desktop Quick Actions */}
            <div className="hidden items-center sm:flex gap-1">
              <Button variant="ghost" size="icon" aria-label="Compare" className="rounded-full" asChild>
                <Link to="/compare">
                  <Repeat2 className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" aria-label="Wishlist" className="rounded-full" asChild>
                <Link to="/wishlist">
                  <Heart className="h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Cart Drawer Toggle */}
            <CartDrawer open={cartOpen} onOpenChange={setCartOpen}>
              <Button variant="ghost" size="icon" aria-label="Cart" className="relative group rounded-full hidden sm:flex">
                <ShoppingCart className="h-5 w-5 transition-transform group-hover:scale-110" />
                {count > 0 && (
                  <Badge className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center p-0 text-[10px] shadow-xs border-transparent">
                    {count}
                  </Badge>
                )}
              </Button>
            </CartDrawer>

            {/* Dashboard Button */}
            <Button asChild size="sm" variant="hero" className="hidden lg:flex ml-2 rounded-full px-5">
              <Link to="/dashboard">
                Seller dashboard
                <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
