import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, Search, Heart, LayoutGrid, ArrowUpRight, ShoppingCart, Repeat2, ChevronDown, Info, Briefcase, Phone, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { STORE, whatsappLink } from "@/lib/store-data";
import { useCart } from "@/lib/cart";
import { SearchCommand } from "./search-command";
import { CartDrawer } from "./cart-drawer";
import { ThemeToggle } from "./theme-toggle";

const nav = [
  { label: "Shop all", to: "/products" as const },
  { label: "Laptops", to: "/products" as const, search: { category: "Laptops" } },
  { label: "Phones", to: "/products" as const, search: { category: "Phones" } },
  { label: "Deals", to: "/products" as const, search: { deals: true } },
];

const companyLinks = [
  {
    icon: Info,
    label: "About us",
    description: "Our story and values",
    to: "/about" as const,
  },
  {
    icon: Briefcase,
    label: "Services",
    description: "What we offer retailers",
    to: "/services" as const,
  },
  {
    icon: HelpCircle,
    label: "FAQs",
    description: "Answers to common questions",
    to: "/faqs" as const,
  },
  {
    icon: Phone,
    label: "Contact",
    description: "Get in touch with our team",
    href: whatsappLink("Hi Voltix, I'd like to get in touch."),
  },
];

function CompanyDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 rounded-full px-4 py-2 text-[13px] font-semibold transition-all hover:bg-surface-muted hover:text-foreground ${
          open ? "bg-surface-muted text-foreground" : "text-muted-foreground"
        }`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        Company
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-3.5 w-3.5" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute left-0 top-full mt-2 w-64 overflow-hidden rounded-2xl border border-border bg-card shadow-xl ring-1 ring-black/5 dark:ring-white/5 z-50"
          >
            <div className="p-2">
              {companyLinks.map((item) => {
                const Icon = item.icon;
                const inner = (
                  <div className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-surface-muted group cursor-pointer">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                );

                return item.href ? (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setOpen(false)}
                  >
                    {inner}
                  </a>
                ) : (
                  <Link
                    key={item.label}
                    to={item.to!}
                    onClick={() => setOpen(false)}
                  >
                    {inner}
                  </Link>
                );
              })}
            </div>

            {/* Footer row */}
            <div className="border-t border-border bg-surface-muted px-4 py-3">
              <p className="text-[11px] text-muted-foreground">
                Need help?{" "}
                <a
                  href={whatsappLink("Hi Voltix!")}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-primary hover:underline"
                >
                  Chat on WhatsApp
                </a>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SiteHeader() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { count } = useCart();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (height > 0) {
        setScrollProgress((winScroll / height) * 100);
      } else {
        setScrollProgress(0);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div className="h-16 w-full shrink-0" />
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
          scrolled ? "glass border-b border-border shadow-sm" : "border-b border-transparent bg-background"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 container-x w-full">
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
              <CompanyDropdown />
            </nav>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />

            {/* Search Icon */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
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

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full lg:hidden" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] pt-10">
                <nav className="flex flex-col gap-1">
                  {nav.map((item) => (
                    <Link
                      key={item.label}
                      to={item.to}
                      search={item.search as never}
                      className="rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className="mt-2 border-t border-border pt-3">
                    <p className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Company</p>
                    {companyLinks.map((item) => {
                      const Icon = item.icon;
                      const inner = (
                        <div className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground">
                          <Icon className="h-4 w-4 shrink-0" />
                          {item.label}
                        </div>
                      );
                      return item.href ? (
                        <a key={item.label} href={item.href} target="_blank" rel="noreferrer">{inner}</a>
                      ) : (
                        <Link key={item.label} to={item.to!}>{inner}</Link>
                      );
                    })}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Scroll Progress Indicator */}
      <div className="fixed top-16 left-0 z-50 w-full h-[2px]">
        <div
          className="h-full bg-primary transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
