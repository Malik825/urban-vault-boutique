import { useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  Bell,
  Box,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Menu,
  Plus,
  Receipt,
  Search,
  Settings,
  Store,
  Users,
  Warehouse,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-0.5">
      {nav.map((item) => {
        const active = item.to === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
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

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex h-16 items-center gap-2.5 px-5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient text-primary-foreground shadow-glow">
            <LayoutGrid className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-extrabold">{STORE.name}</p>
            <p className="truncate text-[11px] text-muted-foreground">Ikeja flagship</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-2">
          <NavList />
        </div>
        <div className="border-t border-sidebar-border p-3">
          <Link
            to="/"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Store className="h-4 w-4" /> View storefront
          </Link>
          <div className="mt-2 flex items-center gap-3 rounded-xl bg-surface-muted p-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary-soft text-xs font-bold text-accent-foreground">
                AO
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold">Ada Okafor</p>
              <p className="truncate text-[11px] text-muted-foreground">Store owner</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="glass sticky top-0 z-30 border-b">
          <div className="grid h-16 grid-cols-[auto_1fr_auto] items-center gap-3 px-4 sm:px-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[80vw] max-w-xs bg-sidebar">
                <div className="mt-8">
                  <NavList />
                </div>
              </SheetContent>
            </Sheet>

            <button
              onClick={() => setCmdOpen(true)}
              className="flex w-full max-w-md items-center gap-2 rounded-xl border border-border bg-surface-muted px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface"
            >
              <Search className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate text-left">Search products, orders…</span>
              <kbd className="hidden rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] sm:inline">
                ⌘K
              </kbd>
            </button>

            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
              </Button>
              <Badge variant="outline" className="hidden rounded-full sm:flex">
                Pro plan
              </Badge>
            </div>
          </div>
        </header>

        <main className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-extrabold sm:text-3xl">{title}</h1>
                {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
              </div>
              {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
            </div>
            <div className="mt-8 animate-fade-up">{children}</div>
          </div>
        </main>
      </div>

      {/* Floating action button */}
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
          <CommandGroup heading="Storefront">
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
