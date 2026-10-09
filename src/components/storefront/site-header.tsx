import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Menu, Search, Heart, LayoutGrid, ShoppingCart,
  Repeat2, Home, User
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { STORE } from "@/lib/store-data";
import { useCart } from "@/lib/cart";
import { SearchCommand } from "./search-command";
import { CartDrawer } from "./cart-drawer";
import { ThemeToggle } from "./theme-toggle";

const NAV_LINKS = [
  { label: "Home", to: "/" as const },
  { label: "Shop", to: "/products" as const, search: {} },
  { label: "Categories", to: "/products" as const, search: {} },
  { label: "About", to: "/about" as const },
];

/* ── Main header ─────────────────────────────────────────── */
export function SiteHeader() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const { count } = useCart();
  const navigate = useNavigate();

  /* Scroll effects */
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Spacer so page content clears fixed header */}
      <div className="h-16 w-full shrink-0" />

      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-200 ${
          scrolled ? "bg-background/95 backdrop-blur-md border-b border-border shadow-xs" : "bg-background/90 backdrop-blur-sm border-b border-border/50"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 sm:gap-6 container-x w-full">
          {/* Logo & Desktop Nav */}
          <div className="flex min-w-0 items-center gap-6 lg:gap-8">
            <Link to="/" className="flex shrink-0 items-center gap-2.5 outline-none rounded-xl">
              <img src="/logo.jpg" alt={`${STORE.name} logo`} className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl object-cover shadow-xs" />
              <span className="font-display text-base sm:text-lg font-bold tracking-tight text-foreground">
                {STORE.name}
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-5 lg:gap-7">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  search={item.search as never}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground [&.active]:text-foreground [&.active]:font-semibold"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Center/Right: Search pill (Desktop) */}
          <div
            onClick={() => setSearchOpen(true)}
            className="hidden md:flex flex-1 max-w-xs lg:max-w-sm items-center gap-2.5 rounded-full bg-slate-100/90 dark:bg-muted/60 px-4 py-2 text-sm text-muted-foreground border border-slate-200/60 dark:border-border/60 hover:border-slate-300 dark:hover:border-border transition-colors cursor-pointer"
          >
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate text-xs sm:text-sm">Search for products...</span>
          </div>

          {/* Right-side actions */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Search products"
              className="md:hidden rounded-full h-9 w-9 text-muted-foreground hover:text-foreground"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>

            <ThemeToggle />

            {/* Account Icon (Desktop) */}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Account"
              className="hidden sm:inline-flex rounded-full h-9 w-9 text-muted-foreground hover:text-foreground"
              asChild
            >
              <Link to="/account">
                <User className="h-5 w-5" />
              </Link>
            </Button>

            {/* Wishlist Icon (Desktop) */}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Wishlist"
              className="hidden sm:inline-flex rounded-full h-9 w-9 text-muted-foreground hover:text-foreground"
              asChild
            >
              <Link to="/wishlist">
                <Heart className="h-5 w-5" />
              </Link>
            </Button>

            {/* Cart Button */}
            <CartDrawer open={cartOpen} onOpenChange={setCartOpen}>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open cart"
                className="relative rounded-full h-9 w-9 text-muted-foreground hover:text-foreground group"
              >
                <ShoppingCart className="h-5 w-5 transition-transform group-hover:scale-110" />
                {count > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white shadow-xs">
                    {count}
                  </span>
                )}
              </Button>
            </CartDrawer>

            {/* Mobile hamburger menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full lg:hidden" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="flex w-[280px] flex-col p-0">
                <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
                  <img src="/logo.jpg" alt="Logo" className="h-8 w-8 rounded-lg object-cover" />
                  <span className="font-display text-sm font-extrabold">{STORE.name}</span>
                </div>

                <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
                  <button onClick={() => { setMobileOpen(false); navigate({ to: "/" }); }} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted">
                    <Home className="h-4 w-4 shrink-0 text-emerald-600" /> Home
                  </button>

                  <button onClick={() => { setMobileOpen(false); navigate({ to: "/products", search: {} }); }} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted">
                    <LayoutGrid className="h-4 w-4 shrink-0 text-emerald-600" /> All Products
                  </button>

                  <div className="mt-3 border-t border-border pt-3">
                    <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Quick Links</p>
                    <button onClick={() => { setMobileOpen(false); navigate({ to: "/wishlist" }); }} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted">
                      <Heart className="h-4 w-4 shrink-0 text-muted-foreground" /> Wishlist
                    </button>
                    <button onClick={() => { setMobileOpen(false); navigate({ to: "/account" }); }} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted">
                      <User className="h-4 w-4 shrink-0 text-muted-foreground" /> My Account
                    </button>
                    <button onClick={() => { setMobileOpen(false); navigate({ to: "/about" }); }} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted">
                      <LayoutGrid className="h-4 w-4 shrink-0 text-muted-foreground" /> About Us
                    </button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
