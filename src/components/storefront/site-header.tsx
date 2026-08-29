import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Menu, Search, Heart, LayoutGrid, ShoppingCart,
  Repeat2, ChevronDown, Info, Phone, HelpCircle, Home, X, Tag
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { STORE, whatsappLink } from "@/lib/store-data";
import { useCart } from "@/lib/cart";
import { SearchCommand } from "./search-command";
import { CartDrawer } from "./cart-drawer";
import { ThemeToggle } from "./theme-toggle";

/* ── Navigation data ──────────────────────────────────────── */
const categoryNav = [
  { label: "Laptops",     search: { category: "Laptops" } },
  { label: "Phones",      search: { category: "Phones" } },
  { label: "Tablets",     search: { category: "Tablets" } },
  { label: "Accessories", search: { category: "Accessories" } },
  { label: "Deals 🔥",   search: { deals: true } },
];

const companyLinks = [
  { icon: Info,       label: "About us", description: "Our story and values",          to: "/about" as const },
  { icon: HelpCircle, label: "FAQs",     description: "Answers to common questions",   to: "/faqs"  as const },
  { icon: Phone,      label: "Contact",  description: "Get in touch with our team",    href: whatsappLink("Hi Voltix, I'd like to get in touch.") },
];

/* ── Company mega-dropdown ───────────────────────────────── */
function CompanyDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className={`cat-nav__link flex items-center gap-1 ${open ? "text-foreground" : ""}`}
      >
        Company
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-3 w-3" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 top-full mt-2 z-50 w-64 overflow-hidden rounded-2xl border border-border bg-card shadow-xl ring-1 ring-black/5 dark:ring-white/5"
          >
            <div className="p-2">
              {companyLinks.map((item) => {
                const Icon = item.icon;
                const inner = (
                  <div className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-surface-muted group cursor-pointer">
                    <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                );
                return "href" in item ? (
                  <a key={item.label} href={item.href} target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>{inner}</a>
                ) : (
                  <Link key={item.label} to={item.to!} onClick={() => setOpen(false)}>{inner}</Link>
                );
              })}
            </div>
            <div className="border-t border-border bg-surface-muted px-4 py-3">
              <p className="text-[11px] text-muted-foreground">
                Need help?{" "}
                <a href={whatsappLink("Hi Voltix!")} target="_blank" rel="noreferrer" className="font-semibold text-primary hover:underline">
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

/* ── Main header ─────────────────────────────────────────── */
export function SiteHeader() {
  const [searchOpen, setSearchOpen]     = useState(false);
  const [cartOpen, setCartOpen]         = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [announcementOn, setAnnounce]   = useState(true);
  const [scrolled, setScrolled]         = useState(false);
  const [scrollProgress, setProgress]   = useState(0);
  const { count } = useCart();
  const navigate   = useNavigate();

  /* Persist dismissal across soft navigations */
  useEffect(() => {
    if (sessionStorage.getItem("voltix-ann-off")) setAnnounce(false);
  }, []);

  /* Scroll effects */
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
      const scrolled = document.documentElement.scrollTop;
      const height   = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setProgress(height > 0 ? (scrolled / height) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function dismiss() {
    setAnnounce(false);
    sessionStorage.setItem("voltix-ann-off", "1");
  }

  /* Total header height for the spacer div (Announcement bar + 64px main header) */
  const HEADER_H = announcementOn ? 100 : 64;

  return (
    <>
      {/* Spacer so page content clears the fixed header */}
      <div style={{ height: HEADER_H }} className="w-full shrink-0 transition-all duration-300" />

      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
          scrolled ? "glass border-b border-border shadow-sm" : "bg-background border-b border-transparent"
        }`}
      >
        {/* ── ROW 1 · Announcement bar ── */}
        <AnimatePresence initial={false}>
          {announcementOn && (
            <motion.div
              key="ann"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="announcement-bar">
                <div className="mx-auto flex max-w-7xl items-center justify-between container-x">
                  <div className="announcement-bar__content">
                    <Tag className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="hidden sm:inline font-semibold">Special Offer: Get 10% off your first order!</span>
                    <span className="announcement-bar__dot hidden sm:inline" aria-hidden="true">·</span>
                    <span>Use code <span className="font-bold">VOLTIX10</span></span>
                  </div>
                  <button
                    onClick={dismiss}
                    aria-label="Dismiss announcement"
                    className="announcement-bar__close ml-4 shrink-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── ROW 2 · Main Header (Original Layout) ── */}
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 container-x w-full">
          {/* Logo & Desktop Nav */}
          <div className="flex min-w-0 items-center gap-8">
            <Link to="/" className="flex shrink-0 items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl">
              <img src="/logo.jpg" alt={`${STORE.name} logo`} className="h-9 w-9 rounded-xl object-cover shadow-glow" />
              <span className="font-display text-base font-bold tracking-tight hidden sm:block">
                {STORE.name}
              </span>
            </Link>
            <nav className="hidden items-center gap-1 lg:flex">
              {categoryNav.map((item) => (
                <Link
                  key={item.label}
                  to="/products"
                  search={item.search as never}
                  className="rounded-full px-4 py-2 text-[13px] font-semibold text-muted-foreground transition-all hover:bg-surface-muted hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
              <CompanyDropdown />
            </nav>
          </div>

          {/* Right-side actions */}
          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
            <ThemeToggle />

            {/* Search Action */}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Search products"
              className="rounded-full"
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

            {/* Cart – desktop & mobile */}
            <CartDrawer open={cartOpen} onOpenChange={setCartOpen}>
              <Button variant="ghost" size="icon" aria-label="Open cart" className="relative rounded-full group">
                <ShoppingCart className="h-5 w-5 transition-transform group-hover:scale-110" />
                {count > 0 && (
                  <Badge className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center p-0 text-[10px] border-transparent">
                    {count}
                  </Badge>
                )}
              </Button>
            </CartDrawer>

            {/* Mobile hamburger */}
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

                <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
                  <button onClick={() => { setMobileOpen(false); navigate({ to: "/" }); }} className="mobile-nav-item">
                    <Home className="h-4 w-4 shrink-0" /> Home
                  </button>

                  <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Shop</p>
                  {categoryNav.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => { setMobileOpen(false); navigate({ to: "/products", search: item.search as never }); }}
                      className="mobile-nav-item"
                    >
                      {item.label}
                    </button>
                  ))}

                  <div className="mt-2 border-t border-border pt-3">
                    <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Account</p>
                    <button onClick={() => { setMobileOpen(false); navigate({ to: "/wishlist" }); }} className="mobile-nav-item">
                      <Heart className="h-4 w-4 shrink-0" /> Wishlist
                    </button>
                    <button onClick={() => { setMobileOpen(false); navigate({ to: "/compare" }); }} className="mobile-nav-item">
                      <Repeat2 className="h-4 w-4 shrink-0" /> Compare
                    </button>
                    <button onClick={() => { setMobileOpen(false); navigate({ to: "/account" }); }} className="mobile-nav-item">
                      <LayoutGrid className="h-4 w-4 shrink-0" /> My Account
                    </button>
                  </div>

                  <div className="mt-2 border-t border-border pt-3">
                    <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Company</p>
                    {companyLinks.map((item) => {
                      const Icon = item.icon;
                      return "href" in item ? (
                        <a key={item.label} href={item.href} target="_blank" rel="noreferrer"
                          onClick={() => setMobileOpen(false)} className="mobile-nav-item">
                          <Icon className="h-4 w-4 shrink-0" />{item.label}
                        </a>
                      ) : (
                        <button key={item.label} onClick={() => { setMobileOpen(false); navigate({ to: item.to! }); }} className="mobile-nav-item">
                          <Icon className="h-4 w-4 shrink-0" />{item.label}
                        </button>
                      );
                    })}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Scroll-progress bar — sits just below the header */}
      <div
        className="fixed left-0 right-0 z-50 h-[2px]"
        style={{ top: HEADER_H }}
      >
        <div
          className="h-full bg-primary transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
