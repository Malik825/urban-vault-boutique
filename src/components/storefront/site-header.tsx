import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import {
  Menu, Search, Heart, LayoutGrid, ShoppingCart,
  Repeat2, Home, User, LayoutDashboard, LogOut, ShieldCheck
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { STORE } from "@/lib/store-data";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { SearchCommand } from "./search-command";
import { CartDrawer } from "./cart-drawer";
import { ThemeToggle } from "./theme-toggle";

const NAV_LINKS = [
  { label: "All Collections", to: "/products" as const, search: {} },
  { label: "Men's Wear", to: "/products" as const, search: { department: "Men" } },
  { label: "Women's Wear", to: "/products" as const, search: { department: "Women" } },
  { label: "African & Traditional", to: "/products" as const, search: { category: "African & Traditional Wear" } },
  { label: "About", to: "/about" as const, search: {} },
];

/* ── Main header ─────────────────────────────────────────── */
export function SiteHeader() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const { count, isOpen: cartOpen, setIsOpen: setCartOpen } = useCart();
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname + (location.searchStr || "");
  const smartAuthRedirect = currentPath !== "/auth" ? currentPath : undefined;

  const userAvatar = user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture ?? null;
  const userInitials = user?.email ? user.email.slice(0, 2).toUpperCase() : "GH";

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
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 sm:gap-6 px-3.5 sm:px-6 lg:px-8 w-full">
          {/* Logo & Desktop Nav */}
          <div className="flex min-w-0 items-center gap-3 sm:gap-6 lg:gap-8">
            <Link to="/" className="flex min-w-0 items-center gap-2 outline-none rounded-full">
              <img
                src={STORE.logoUrl || "/logo.jpg"}
                alt={`${STORE.name} logo`}
                width={36}
                height={36}
                fetchPriority="high"
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover shadow-xs border border-border/40 shrink-0"
              />
              <span className="font-display text-xs sm:text-base font-semibold sm:font-bold tracking-tight text-foreground truncate max-w-[120px] xs:max-w-[170px] sm:max-w-none">
                Unisex Boutique
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
          <div className="flex shrink-0 items-center gap-0.5 sm:gap-2">
            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Search products"
              className="md:hidden rounded-full h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-4 w-4" />
            </Button>

            <ThemeToggle />

            {/* Account & Admin Dropdown */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="User Account Menu"
                    className="hidden sm:inline-flex rounded-full h-8 w-8 p-0 overflow-hidden ring-1 ring-border/80 hover:ring-primary/60 transition-all relative shrink-0"
                  >
                    <Avatar className="h-full w-full">
                      {userAvatar && <AvatarImage src={userAvatar} alt={user.email ?? "Avatar"} className="object-cover" />}
                      <AvatarFallback className="bg-primary/15 text-primary font-bold text-[11px]">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    {isAdmin && (
                      <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background z-10" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[265px] rounded-2xl p-2 shadow-xl border border-border/80 bg-background/95 backdrop-blur-md">
                  <DropdownMenuLabel className="font-normal p-2 pb-1.5">
                    <div className="flex items-start gap-2.5">
                      <Avatar className="h-8 w-8 shrink-0 ring-1 ring-primary/30">
                        {userAvatar && <AvatarImage src={userAvatar} alt="Avatar" className="object-cover" />}
                        <AvatarFallback className="bg-primary/15 text-primary font-bold text-xs">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-0.5 min-w-0 flex-1">
                        <p className="text-xs font-bold text-foreground truncate">
                          {user.user_metadata?.full_name ?? "User Account"}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                        {isAdmin && (
                          <div className="pt-1">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/25">
                              <ShieldCheck className="h-3 w-3" /> Admin User
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-1.5" />
                  <DropdownMenuItem asChild className="rounded-xl px-2.5 py-2 cursor-pointer text-xs font-medium focus:bg-muted/80">
                    <Link to={isAdmin ? "/dashboard" : "/account"} className="flex items-center gap-2.5">
                      {isAdmin ? (
                        <LayoutDashboard className="h-4 w-4 text-primary shrink-0" />
                      ) : (
                        <User className="h-4 w-4 text-primary shrink-0" />
                      )}
                      <span>{isAdmin ? "Admin Dashboard" : "My Account"}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1.5" />
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="rounded-xl px-2.5 py-2 cursor-pointer text-xs font-medium text-rose-500 hover:text-rose-600 focus:bg-rose-500/10 focus:text-rose-600"
                  >
                    <LogOut className="mr-2.5 h-4 w-4 shrink-0" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Sign in"
                className="hidden sm:inline-flex rounded-full h-9 w-9 text-muted-foreground hover:text-foreground"
                asChild
              >
                <Link to="/auth" search={{ redirect: smartAuthRedirect }}>
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            )}

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
                className="relative rounded-full h-8 w-8 sm:h-9 sm:w-9 text-muted-foreground hover:text-foreground group shrink-0"
              >
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:scale-110" />
                {count > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] sm:h-4.5 sm:min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[9px] sm:text-[10px] font-bold text-primary-foreground shadow-xs">
                    {count}
                  </span>
                )}
              </Button>
            </CartDrawer>

            {/* Mobile hamburger menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 sm:h-9 sm:w-9 lg:hidden shrink-0" aria-label="Open menu">
                  <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="flex w-[290px] flex-col p-0">
                <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
                  <img src={STORE.logoUrl || "/logo.jpg"} alt="Logo" className="h-8 w-8 rounded-full object-cover" />
                  <span className="font-display text-sm font-bold">Unisex Boutique</span>
                </div>

                <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
                  <button onClick={() => { setMobileOpen(false); navigate({ to: "/" }); }} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted">
                    <Home className="h-4 w-4 shrink-0 text-primary" /> Home
                  </button>

                  <button onClick={() => { setMobileOpen(false); navigate({ to: "/products", search: {} }); }} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted">
                    <LayoutGrid className="h-4 w-4 shrink-0 text-primary" /> All Collections
                  </button>

                  <button onClick={() => { setMobileOpen(false); navigate({ to: "/products", search: { department: "Men" } }); }} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted">
                    <span className="text-sm">👔</span> Men's Wear
                  </button>

                  <button onClick={() => { setMobileOpen(false); navigate({ to: "/products", search: { department: "Women" } }); }} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted">
                    <span className="text-sm">👗</span> Women's Wear
                  </button>

                  <button onClick={() => { setMobileOpen(false); navigate({ to: "/products", search: { category: "African & Traditional Wear" } }); }} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted">
                    <span className="text-sm">✨</span> African & Traditional Wear
                  </button>

                  <div className="mt-3 border-t border-border pt-3">
                    <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Quick Links</p>
                    <button onClick={() => { setMobileOpen(false); navigate({ to: "/wishlist" }); }} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted">
                      <Heart className="h-4 w-4 shrink-0 text-muted-foreground" /> Wishlist
                    </button>
                    {user ? (
                      <button onClick={() => { setMobileOpen(false); navigate({ to: isAdmin ? "/dashboard" : "/account" }); }} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted">
                        {isAdmin ? <LayoutDashboard className="h-4 w-4 shrink-0 text-primary" /> : <User className="h-4 w-4 shrink-0 text-muted-foreground" />}
                        {isAdmin ? "Admin Dashboard" : "My Account"}
                      </button>
                    ) : (
                      <button onClick={() => { setMobileOpen(false); navigate({ to: "/auth", search: { redirect: smartAuthRedirect } }); }} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted">
                        <User className="h-4 w-4 shrink-0 text-muted-foreground" /> Sign In / Register
                      </button>
                    )}
                    {isAdmin && (
                      <button onClick={() => { setMobileOpen(false); navigate({ to: "/dashboard" }); }} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20">
                        <LayoutDashboard className="h-4 w-4 shrink-0" /> Admin Dashboard
                      </button>
                    )}
                    <button onClick={() => { setMobileOpen(false); navigate({ to: "/about" }); }} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted">
                      <LayoutGrid className="h-4 w-4 shrink-0 text-muted-foreground" /> About Us
                    </button>

                    <div className="mt-2 flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm">
                      <span className="text-xs font-medium text-muted-foreground">Theme Mode</span>
                      <ThemeToggle />
                    </div>
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
