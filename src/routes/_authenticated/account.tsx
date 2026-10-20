import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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
import { formatPrice, STORE } from "@/lib/store-data";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [{ title: `My Account — ${STORE.name}` }],
  }),
  component: AccountPage,
});

import { listCustomerOrders } from "@/lib/order.functions";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800",
  processing: "bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950 dark:text-sky-200 dark:border-sky-800",
  shipped: "bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800",
  delivered: "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800",
  cancelled: "bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-800",
};

function AccountPage() {
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();
  const { wishlist } = useWishlist();
  const { compareList } = useCompare();
  const { items: cartItems, count: cartCount } = useCart();
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    if (user && !isAdmin) {
      supabase
        .from("profiles")
        .select("referral_code, store_credit")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data) setProfile(data);
        });

      listCustomerOrders({ data: { userId: user.id } })
        .then((data) => {
          setOrders(data || []);
        })
        .catch((err) => {
          console.error("Failed to load customer orders:", err);
        })
        .finally(() => {
          setLoadingOrders(false);
        });
    }
  }, [user]);

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "GH";
  const displayName =
    user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "Guest";

  async function handleSignOut() {
    await signOut();
    toast.success("Signed out successfully");
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-5xl container-x pb-20 pt-10">
        {/* Profile header */}
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-xl bg-card text-foreground font-display text-xl font-bold border border-border shadow-xs">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-display text-xl font-extrabold">{displayName}</p>
                {isAdmin && (
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/25 text-[11px] font-semibold">
                    <ShieldCheck className="mr-1 h-3 w-3" /> Admin
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Button variant="default" className="shadow-xs font-semibold" asChild>
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

        {/* Admin Quick Banner - Clean Solid Card (No Glassmorphism) */}
        {isAdmin && (
          <div className="mt-6 rounded-xl border border-border bg-card p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-surface-muted text-primary border border-border">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground">Administrator Control Panel</h3>
                <p className="text-xs text-muted-foreground">Manage store products, stock inventory, customer orders, and sales analytics.</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="border-border hover:bg-muted text-foreground shrink-0 font-medium" asChild>
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
              value: orders.length,
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
              className="hover-lift flex flex-col gap-2 rounded-xl border border-border bg-card p-5 shadow-xs"
            >
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-surface-muted text-primary border border-border">
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

          {loadingOrders ? (
            <div className="mt-6 flex flex-col gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-28 rounded-xl border border-border bg-surface-muted/40 animate-pulse" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="mt-8 flex flex-col items-center gap-4 rounded-xl border border-dashed border-border py-16 text-center">
              <Clock className="h-10 w-10 text-muted-foreground" />
              <p className="font-medium">No orders yet</p>
              <p className="text-sm text-muted-foreground">
                Orders you place will appear here in real time.
              </p>
              <Button asChild size="sm">
                <Link to="/products" search={{}}>
                  Shop now
                </Link>
              </Button>
            </div>
          ) : (
            <div className="mt-6 flex flex-col gap-4">
              {orders.map((order) => {
                const orderNumber =
                  order.shipping_address?.orderNumber ||
                  `UV-${order.id.slice(0, 8).toUpperCase()}`;

                const orderItems =
                  order.order_items && order.order_items.length > 0
                    ? order.order_items
                    : order.shipping_address?.items || [];

                return (
                  <div
                    key={order.id}
                    className="overflow-hidden rounded-xl border border-border bg-card shadow-xs"
                  >
                    {/* Order header */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-surface-muted px-5 py-3">
                      <div className="flex items-center gap-4">
                        <p className="font-mono text-xs font-semibold text-muted-foreground">
                          {orderNumber}
                        </p>
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
                            STATUS_COLORS[order.status] ?? "bg-surface-muted text-muted-foreground"
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
                      {orderItems.map((item: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-center justify-between gap-4 px-5 py-3"
                        >
                          <div>
                            <p className="text-sm font-semibold">{item.product_name || item.name}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity || item.qty}</p>
                          </div>
                          <p className="font-display text-sm font-bold">
                            {formatPrice(item.unit_price || item.price || 0)}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Order footer */}
                    <div className="flex items-center justify-between gap-4 border-t border-border px-5 py-3 bg-surface-muted/30">
                      <div>
                        {order.shipping_address?.deliveryMethod && (
                          <p className="text-xs text-muted-foreground">
                            {order.shipping_address.deliveryMethod === "pickup"
                              ? "Showroom Pickup"
                              : `Delivery: ${order.shipping_address.city || "Ghana"}`}
                          </p>
                        )}
                        {order.shipping_address?.paymentMethod && (
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <span>{order.shipping_address.paymentMethod}</span>
                            {order.shipping_address?.paymentStatus === "paid" && (
                              <span className="font-bold text-primary text-[10px]">
                                &bull; Paid (Paystack)
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Order total</p>
                        <p className="font-display text-base font-extrabold">
                          {formatPrice(order.total)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <Separator className="my-8" />

        {/* Quick links */}
        <div>
          <h2 className="font-display text-xl font-extrabold">Quick links</h2>
          <div className="mt-4 flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-xs">
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
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-surface-muted text-primary border border-border">
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
            <div className="rounded-xl border border-border bg-card shadow-xs p-6 flex flex-col items-center text-center justify-center">
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
            <div className="rounded-xl border border-border bg-card shadow-xs p-6 flex flex-col justify-center">
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
