import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, Search, Heart, LayoutGrid, ArrowUpRight, ShoppingCart } from "lucide-react";

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
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
          scrolled ? "glass border-border shadow-xs" : "border-transparent bg-background"
        }`}
      >
        <div className="mx-auto grid h-16 max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 container-x">
          {/* Logo & Desktop Nav */}
          <div className="flex min-w-0 items-center gap-8">
            <Link to="/" className="flex shrink-0 items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-gradient text-primary-foreground shadow-glow">
                <LayoutGrid className="h-4 w-4" />
              </span>
              <span className="font-display text-base font-bold tracking-tight">
                {STORE.name}
              </span>
            </Link>
            <nav className="hidden items-center gap-2 lg:flex">
              {nav.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  search={item.search as never}
                  className="rounded-md px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
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
              className="hidden w-full max-w-sm items-center gap-2 rounded-xl border border-border bg-surface-muted px-3 py-2.5 text-sm text-muted-foreground transition-all hover:border-primary/40 hover:bg-surface md:flex shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Search className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left truncate">Search devices…</span>
              <kbd className="hidden sm:inline-flex rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] font-medium shrink-0">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            {/* Mobile Search Icon */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Desktop Quick Actions */}
            <div className="hidden items-center sm:flex">
              <Button variant="ghost" size="icon" aria-label="Wishlist">
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            {/* Cart Drawer Toggle */}
            <CartDrawer open={cartOpen} onOpenChange={setCartOpen}>
              <Button variant="ghost" size="icon" aria-label="Cart" className="relative group">
                <ShoppingCart className="h-5 w-5 transition-transform group-hover:scale-110" />
                {count > 0 && (
                  <Badge className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center p-0 text-[10px] shadow-xs">
                    {count}
                  </Badge>
                )}
              </Button>
            </CartDrawer>

            {/* Dashboard Button */}
            <Button asChild size="sm" variant="hero" className="hidden sm:flex ml-1">
              <Link to="/dashboard">
                Seller dashboard
                <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden ml-1" aria-label="Menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[84vw] max-w-xs p-6">
                <div className="mt-8 flex flex-col gap-2">
                  {nav.map((item) => (
                    <Link
                      key={item.label}
                      to={item.to}
                      search={item.search as never}
                      className="rounded-lg px-4 py-3 text-base font-medium transition-colors hover:bg-secondary active:bg-secondary/80"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className="mt-4 border-t border-border pt-4">
                    <Link
                      to="/dashboard"
                      className="flex items-center justify-between rounded-lg bg-primary-soft px-4 py-3 text-base font-semibold text-accent-foreground"
                    >
                      Seller dashboard
                      <ArrowUpRight className="h-4 w-4 opacity-50" />
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
