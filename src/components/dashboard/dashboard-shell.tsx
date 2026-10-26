import { useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  Bell,
  Box,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Receipt,
  Search,
  Settings,
  Store,
  User,
  UserCircle2,
  Users,
  Warehouse,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/storefront/theme-toggle";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { supabase } from "@/integrations/supabase/client";
import { STORE } from "@/lib/store-data";

const nav = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Products", to: "/dashboard/products", icon: Box },
  { label: "Inventory", to: "/dashboard/inventory", icon: Warehouse },
  { label: "Add product", to: "/dashboard/new-product", icon: Plus },
  { label: "Orders", to: "/dashboard/orders", icon: Receipt },
  { label: "Customers", to: "/dashboard/customers", icon: Users },
  { label: "Analytics", to: "/dashboard/analytics", icon: BarChart3 },
  { label: "Settings", to: "/dashboard/settings", icon: Settings },
  { label: "Profile", to: "/dashboard/profile", icon: UserCircle2 },
] as const;

function NavList({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-0.5">
      {nav.map((item) => {
        const active =
          item.to === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
              collapsed ? "justify-center px-2" : ""
            } ${
              active
                ? "text-foreground bg-transparent"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            {active && !collapsed && (
              <div className="absolute inset-y-1.5 left-0 w-1 rounded-r-full bg-primary" />
            )}
            {active && collapsed && (
              <div className="absolute inset-x-1.5 bottom-0 h-1 rounded-t-full bg-primary" />
            )}
            <item.icon
              className={`h-4 w-4 shrink-0 transition-transform ${active ? "scale-110" : ""}`}
            />
            {!collapsed && item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [cmdOpen, setCmdOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("gh-sidebar");
      if (saved !== null) return saved === "1";
    }
    return true;
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const showFab =
    pathname === "/dashboard" ||
    pathname === "/dashboard/products" ||
    pathname === "/dashboard/inventory";

  function toggleSidebar() {
    setSidebarOpen((prev) => {
      const next = !prev;
      localStorage.setItem("gh-sidebar", next ? "1" : "0");
      return next;
    });
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCmdOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      setAvatarUrl(data.user?.user_metadata?.avatar_url ?? null);
    });
  }, []);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  // Sidebar widths
  const sidebarW = sidebarOpen ? "w-64" : "w-[68px]";
  const mainPl = sidebarOpen ? "lg:pl-64" : "lg:pl-[68px]";

  return (
    <div className="min-h-screen bg-background">
      {/* ── Desktop Sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-300 ease-in-out lg:flex ${sidebarW}`}
      >
        {/* Logo row */}
        <div className="flex h-16 shrink-0 items-center gap-2.5 overflow-hidden px-4">
          <Link to="/" aria-label="Home" className="flex items-center gap-2.5">
            <img
              src="/urban-vault-logo.jpg"
              alt={STORE.name}
              className="h-9 w-9 shrink-0 rounded-full object-cover shadow-glow"
            />
          </Link>
          {sidebarOpen && (
            <div className="min-w-0 animate-fade-up">
              <p className="truncate font-display text-sm font-extrabold">{STORE.name}</p>
              <p className="truncate text-[11px] text-muted-foreground">Assin Fosu</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          <NavList collapsed={!sidebarOpen} />
        </div>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-3">
          {sidebarOpen ? (
            <>
              <Link
                to="/account"
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <User className="h-4 w-4 shrink-0 text-primary" /> My Customer Account
              </Link>
              <Link
                to="/"
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <Store className="h-4 w-4 shrink-0" /> View storefront
              </Link>
              <div className="mt-1 flex items-center gap-3 rounded-lg bg-surface-muted p-3">
                <Link to="/dashboard/profile">
                  <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent transition-all hover:ring-primary">
                    {avatarUrl && (
                      <AvatarImage src={avatarUrl} alt="Profile" className="object-cover" />
                    )}
                    <AvatarFallback className="bg-primary-soft text-xs font-bold text-accent-foreground">
                      {(email ?? "S").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold">{email ?? "Signed in"}</p>
                  <p className="truncate text-[11px] text-muted-foreground">Store owner</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Sign out"
                  onClick={() => void signOut()}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            /* Collapsed footer — just the account + avatar + storefront + sign-out stacked */
            <div className="flex flex-col items-center gap-2">
              <Link to="/account" title="My Customer Account">
                <User className="h-5 w-5 text-muted-foreground transition-colors hover:text-primary" />
              </Link>
              <Link to="/" title="View storefront">
                <Store className="h-5 w-5 text-muted-foreground transition-colors hover:text-foreground" />
              </Link>
              <Link to="/dashboard/profile" title="Profile">
                <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent transition-all hover:ring-primary">
                  {avatarUrl && (
                    <AvatarImage src={avatarUrl} alt="Profile" className="object-cover" />
                  )}
                  <AvatarFallback className="bg-primary-soft text-xs font-bold text-accent-foreground">
                    {(email ?? "S").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Sign out"
                onClick={() => void signOut()}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className={`transition-[padding] duration-300 ease-in-out ${mainPl}`}>
        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b border-border bg-background">
          <div className="flex h-16 items-center gap-2 px-4 sm:px-6">

            {/* Desktop sidebar toggle */}
            <Button
              variant="ghost"
              size="icon"
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              onClick={toggleSidebar}
              className="hidden shrink-0 lg:flex"
            >
              {sidebarOpen ? (
                <PanelLeftClose className="h-5 w-5" />
              ) : (
                <PanelLeftOpen className="h-5 w-5" />
              )}
            </Button>

            {/* Mobile sheet trigger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 lg:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[80vw] max-w-xs bg-sidebar">
                {/* Mobile sidebar logo */}
                <div className="flex items-center gap-2.5 px-1 pb-4 pt-2 border-b border-sidebar-border">
                  <img
                    src="/urban-vault-logo.jpg"
                    alt={STORE.name}
                    className="h-9 w-9 shrink-0 rounded-full object-cover shadow-glow"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-display text-sm font-extrabold">{STORE.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground">Admin Panel</p>
                  </div>
                </div>
                <div className="mt-4">
                  <NavList onNavigate={() => setMobileOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>

            {/* Page title */}
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-base font-extrabold leading-tight sm:text-lg">
                {title}
              </p>
              {subtitle && (
                <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
              )}
            </div>

            {/* Right icons */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search — compact on sm, full pill on lg */}
              <button
                onClick={() => setCmdOpen(true)}
                className="hidden sm:flex items-center gap-2 rounded-xl border border-border bg-surface-muted px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-surface"
                aria-label="Search"
              >
                <Search className="h-4 w-4 shrink-0" />
                <span className="hidden lg:inline text-sm">Search…</span>
                <kbd className="hidden rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] lg:inline">
                  ⌘K
                </kbd>
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="sm:hidden"
                aria-label="Search"
                onClick={() => setCmdOpen(true)}
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Theme toggle */}
              <ThemeToggle />

              {/* My Customer Account button */}
              <Button
                variant="outline"
                size="sm"
                asChild
                className="hidden sm:inline-flex h-8 gap-1.5 text-xs font-semibold rounded-lg border-border hover:bg-surface-muted"
              >
                <Link to="/account">
                  <User className="h-3.5 w-3.5 text-primary" /> My Account
                </Link>
              </Button>

              {/* Notifications */}
              <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
              </Button>

              {/* Avatar → profile */}
              <Link to="/dashboard/profile" aria-label="Profile">
                <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent transition-all hover:ring-primary">
                  {avatarUrl && (
                    <AvatarImage src={avatarUrl} alt="Profile" className="object-cover" />
                  )}
                  <AvatarFallback className="bg-primary-soft text-xs font-bold text-accent-foreground">
                    {(email ?? "A").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </div>
        </header>

        <main className="px-3.5 py-6 sm:px-6 lg:px-8 sm:py-8 min-w-0 max-w-full overflow-x-hidden">
          <div className="mx-auto max-w-7xl min-w-0">
            {actions && (
              <div className="mb-4 sm:mb-6 flex flex-wrap items-center justify-end gap-2">{actions}</div>
            )}
            <div className="animate-fade-up min-w-0">{children}</div>
          </div>
        </main>
      </div>

      {/* Mobile FAB - only on products, inventory and home dashboard */}
      {showFab && (
        <Button
          asChild
          variant="hero"
          size="lg"
          className="fixed bottom-6 right-6 z-40 rounded-full shadow-glow lg:hidden"
        >
          <Link to="/dashboard/new-product">
            <Plus className="h-5 w-5" /> Add
          </Link>
        </Button>
      )}

      {/* Command palette */}
      <CommandDialog open={cmdOpen} onOpenChange={setCmdOpen}>
        <CommandInput placeholder="Jump to a page or action…" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup heading="Navigate">
            {nav.map((item) => (
              <CommandItem key={item.to} value={item.label} asChild>
                <Link to={item.to} onClick={() => setCmdOpen(false)}>
                  <item.icon className="text-muted-foreground" />
                  {item.label}
                </Link>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Storefront & Account">
            <CommandItem value="customer account my account orders" asChild>
              <Link to="/account" onClick={() => setCmdOpen(false)}>
                <User className="text-muted-foreground" />
                Go to customer account &amp; orders
              </Link>
            </CommandItem>
            <CommandItem value="view store" asChild>
              <Link to="/" onClick={() => setCmdOpen(false)}>
                <Store className="text-muted-foreground" />
                View live storefront
              </Link>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
