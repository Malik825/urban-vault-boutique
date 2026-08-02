import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, Search, Heart, LayoutGrid, ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { STORE } from "@/lib/store-data";
import { SearchCommand } from "./search-command";

const nav = [
  { label: "Shop all", to: "/products" as const },
  { label: "Laptops", to: "/products" as const, search: { category: "Laptops" } },
  { label: "Phones", to: "/products" as const, search: { category: "Phones" } },
  { label: "Deals", to: "/products" as const, search: { deals: true } },
];

export function SiteHeader() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
        <div className="mx-auto grid h-16 max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-6">
            <Link to="/" className="flex shrink-0 items-center gap-2.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-gradient text-primary-foreground shadow-glow">
                <LayoutGrid className="h-4 w-4" />
              </span>
              <span className="font-display text-lg font-extrabold tracking-tight">
                {STORE.name}
              </span>
            </Link>
            <nav className="hidden items-center gap-1 lg:flex">
              {nav.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  search={item.search as never}
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden w-full max-w-xs items-center gap-2 rounded-xl border border-border bg-surface-muted px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-surface md:flex"
            >
              <Search className="h-4 w-4" />
              <span className="flex-1 text-left">Search devices…</span>
              <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] font-medium">
                ⌘K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Wishlist" className="hidden sm:flex">
              <Heart className="h-5 w-5" />
            </Button>
            <Button asChild size="sm" variant="hero" className="hidden sm:flex">
              <Link to="/dashboard">
                Seller dashboard
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[84vw] max-w-xs">
                <div className="mt-8 flex flex-col gap-1">
                  {nav.map((item) => (
                    <Link
                      key={item.label}
                      to={item.to}
                      search={item.search as never}
                      className="rounded-lg px-3 py-3 text-base font-medium transition-colors hover:bg-secondary"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <Link
                    to="/dashboard"
                    className="mt-4 rounded-lg bg-primary-soft px-3 py-3 text-base font-semibold text-accent-foreground"
                  >
                    Seller dashboard
                  </Link>
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
