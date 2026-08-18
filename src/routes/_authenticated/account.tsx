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

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [{ title: "My Account — Voltix" }],
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
  const { user, signOut } = useAuth();
  const { wishlist } = useWishlist();
  const { compareList } = useCompare();
  const { items: cartItems, count: cartCount } = useCart();

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "GH";
  const displayName =
    user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "Guest";

  async function handleSignOut() {
    await signOut();
    toast.success("Signed out successfully");
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-5xl container-x pb-20 pt-10">
        {/* Profile header */}
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary-soft font-display text-xl font-extrabold text-accent-foreground">
              {initials}
            </div>
            <div>
              <p className="font-display text-xl font-extrabold">{displayName}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>

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
      </div>

      <SiteFooter />
    </div>
  );
}
