import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
  User,
  Package,
  LogOut,
  ShoppingBag,
  Heart,
  Repeat2,
  ChevronRight,
  Clock,
  ShieldCheck,
  LayoutDashboard,
} from "lucide-react";
import { toast } from "sonner";

import { SiteHeader } from "@/components/storefront/site-header";
import { SiteFooter } from "@/components/storefront/site-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth";
import { useWishlist } from "@/lib/user-store";
import { useCompare } from "@/lib/user-store";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/store-data";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [{ title: "My Account — GadgetHaus" }],
  }),
  component: AccountPage,
});

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-warning/20 text-warning-foreground border-warning/30",
  processing: "bg-info/20 text-info border-info/30",
  shipped: "bg-primary-soft text-accent-foreground border-primary/30",
  delivered: "bg-success/20 text-success-foreground border-success/30",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

// Placeholder orders — swap with real Supabase fetch once migration is run
const PLACEHOLDER_ORDERS = [
  {
    id: "ORD-001",
    status: "delivered",
    total: 2450000,
    created_at: "2026-08-10T09:30:00Z",
    items: [{ name: "MacBook Pro 14 M3 Pro", qty: 1, price: 2450000 }],
  },
  {
    id: "ORD-002",
    status: "shipped",
    total: 1590000,
    created_at: "2026-08-15T14:10:00Z",
    items: [{ name: "iPhone 15 Pro Max 256GB", qty: 1, price: 1590000 }],
  },
];

function AccountPage() {
  const { user, isAdmin, signOut } = useAuth();
  const { wishlist } = useWishlist();
  const { compareList } = useCompare();
  const { items: cartItems, count: cartCount } = useCart();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("referral_code, store_credit")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data) setProfile(data);
        });
    }
  }, [user]);

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "GH";
  const displayName =
    user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "Guest";

  async function handleSignOut() {
    await signOut();
    toast.success("Signed out successfully");
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-5xl container-x pb-20 pt-10">
        {/* Profile header */}
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-display text-xl font-extrabold border border-emerald-500/20">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-display text-xl font-extrabold">{displayName}</p>
                {isAdmin && (
                  <Badge variant="outline" className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[11px] font-semibold">
                    <ShieldCheck className="mr-1 h-3 w-3" /> Admin
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Button variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs" asChild>
                <Link to="/dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4" /> Admin Dashboard
                </Link>
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </Button>
          </div>
        </div>

        {/* Admin Quick Banner */}
        {isAdmin && (
          <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 dark:bg-emerald-950/40 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground">Administrator Control Panel</h3>
                <p className="text-xs text-muted-foreground">Manage store products, stock inventory, customer orders, and sales analytics.</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="border-emerald-500/40 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0" asChild>
              <Link to="/dashboard">
                Open Admin Console <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}

        <Separator className="my-8" />

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            {
              icon: ShoppingBag,
              label: "Cart items",
              value: cartCount,
              to: "/checkout",
              search: {},
            },
            {
              icon: Package,
              label: "Orders",
              value: PLACEHOLDER_ORDERS.length,
              to: "/account" as any,
              search: {},
            },
            {
              icon: Heart,
              label: "Wishlisted",
              value: wishlist.length,
              to: "/wishlist",
              search: {},
            },
            {
              icon: Repeat2,
              label: "Comparing",
              value: compareList.length,
              to: "/compare",
              search: {},
            },
          ].map((stat) => (
            <Link
              key={stat.label}
              to={stat.to}
              search={stat.search}
              className="hover-lift flex flex-col gap-2 rounded-2xl border border-border bg-card p-5 shadow-card"
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-accent-foreground">
                <stat.icon className="h-5 w-5" />
              </div>
              <p className="font-display text-2xl font-extrabold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </Link>
          ))}
        </div>

        <Separator className="my-8" />

        {/* Order history */}
        <div>
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-xl font-extrabold">Order History</h2>
          </div>

          {PLACEHOLDER_ORDERS.length === 0 ? (
            <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border py-16 text-center">
              <Clock className="h-10 w-10 text-muted-foreground" />
              <p className="font-medium">No orders yet</p>
              <p className="text-sm text-muted-foreground">
                Orders you place will appear here.
              </p>
              <Button asChild size="sm">
                <Link to="/products" search={{}}>
                  Shop now
                </Link>
              </Button>
            </div>
          ) : (
            <div className="mt-6 flex flex-col gap-4">
              {PLACEHOLDER_ORDERS.map((order) => (
                <div
                  key={order.id}
                  className="overflow-hidden rounded-2xl border border-border bg-card shadow-card"
                >
                  {/* Order header */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-surface-muted px-5 py-3">
                    <div className="flex items-center gap-4">
                      <p className="font-mono text-xs font-semibold text-muted-foreground">
                        {order.id}
                      </p>
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
                          STATUS_COLORS[order.status] ?? ""
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("en-GH", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  {/* Order items */}
                  <div className="divide-y divide-border">
                    {order.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-4 px-5 py-3"
                      >
                        <div>
                          <p className="text-sm font-semibold">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.qty}</p>
                        </div>
                        <p className="font-display text-sm font-bold">
                          {formatPrice(item.price)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Order footer */}
                  <div className="flex items-center justify-between gap-4 border-t border-border px-5 py-3">
                    <p className="text-sm text-muted-foreground">Order total</p>
                    <p className="font-display text-base font-extrabold">
                      {formatPrice(order.total)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator className="my-8" />

        {/* Quick links */}
        <div>
          <h2 className="font-display text-xl font-extrabold">Quick links</h2>
          <div className="mt-4 flex flex-col divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            {[
              { icon: Heart, label: "My wishlist", description: `${wishlist.length} saved items`, to: "/wishlist" },
              { icon: Repeat2, label: "Compare products", description: `${compareList.length} in compare`, to: "/compare" },
              { icon: ShoppingBag, label: "Shopping cart", description: `${cartCount} item${cartCount !== 1 ? "s" : ""}`, to: "/checkout" },
            ].map((link) => (
              <Link
                key={link.label}
                to={link.to as any}
                search={{}}
                className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-surface-muted"
              >
                <div className="flex items-center gap-4">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary-soft text-accent-foreground">
                    <link.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{link.label}</p>
                    <p className="text-xs text-muted-foreground">{link.description}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>

        <Separator className="my-8" />

        {/* Refer & Earn Section */}
        <div>
          <h2 className="font-display text-xl font-extrabold flex items-center gap-2">
            <span className="text-xl">🎁</span> Refer & Earn
          </h2>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Share your link with friends. They get a discount, and you earn store credit when they order!
          </p>
          
          <div className="grid gap-6 md:grid-cols-2">
            {/* Wallet Card */}
            <div className="rounded-2xl border border-border bg-card shadow-card p-6 flex flex-col items-center text-center justify-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Available Store Credit</p>
              {profile ? (
                <p className="font-display text-4xl font-extrabold text-primary">
                  {formatPrice(profile.store_credit || 0)}
                </p>
              ) : (
                <div className="h-10 w-24 bg-muted animate-pulse rounded-full mt-1"></div>
              )}
              <p className="text-xs text-muted-foreground mt-3">
                Credit automatically applies at checkout.
              </p>
            </div>

            {/* Share Link Card */}
            <div className="rounded-2xl border border-border bg-card shadow-card p-6 flex flex-col justify-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Your Referral Link</p>
              
              {profile?.referral_code ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1 truncate rounded-lg bg-surface-muted px-4 py-3 text-sm font-mono border border-border">
                    {typeof window !== 'undefined' ? `${window.location.origin}/?ref=${profile.referral_code}` : ''}
                  </div>
                  <Button 
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/?ref=${profile.referral_code}`);
                      toast.success("Referral link copied!");
                    }}
                  >
                    Copy
                  </Button>
                </div>
              ) : (
                <div className="h-11 w-full bg-muted animate-pulse rounded-lg"></div>
              )}
              <p className="text-xs text-muted-foreground mt-4">
                Code: <strong className="font-mono text-foreground">{profile?.referral_code || '...'}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
