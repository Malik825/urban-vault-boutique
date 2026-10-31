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
  SlidersHorizontal,
  Check,
  Save,
  Loader2,
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

import { useState, useEffect } from "react";
import { serverSaveOnboardingPreferences } from "@/lib/auth.functions";
import { BoutiqueOnboardingModal } from "@/components/auth/onboarding-modal";

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

function OrderStatusStepper({ status, deliveryMethod }: { status: string; deliveryMethod?: string }) {
  if (status === "cancelled") {
    return (
      <div className="px-5 py-2.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-1.5 border-b border-border">
        <span>Order was cancelled.</span>
      </div>
    );
  }

  const steps = [
    { key: "pending", label: "Confirmed" },
    { key: "processing", label: "Packed" },
    { key: "shipped", label: deliveryMethod === "pickup" ? "Ready for Pickup" : "In Transit" },
    { key: "delivered", label: deliveryMethod === "pickup" ? "Collected" : "Delivered" },
  ];

  const orderStatusIndex = steps.findIndex((s) => s.key === status);
  const currentIndex = orderStatusIndex >= 0 ? orderStatusIndex : 0;

  return (
    <div className="px-5 py-3 bg-surface-muted/30 border-b border-border">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-3 left-4 right-4 h-0.5 bg-border z-0" />
        <div
          className="absolute top-3 left-4 h-0.5 bg-primary z-0 transition-all duration-300"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 92}%` }}
        />

        {steps.map((step, idx) => {
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center gap-1">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
                  isDone
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-surface border border-border text-muted-foreground"
                } ${isCurrent ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
              >
                {isDone ? "✓" : idx + 1}
              </div>
              <span
                className={`text-[10px] whitespace-nowrap hidden sm:inline ${
                  isDone ? "text-foreground font-semibold" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const STYLE_AESTHETICS = [
  { id: "streetwear", label: "Streetwear & Oversized Fits", emoji: "🕶️" },
  { id: "linen", label: "Cuban Linen & Kaftans", emoji: "👔" },
  { id: "denim", label: "Vintage Denim & Cargo Pieces", emoji: "👖" },
  { id: "sneakers", label: "Designer Footwear & Kicks", emoji: "👟" },
  { id: "luxury", label: "Minimalist High Fashion", emoji: "✨" },
];

const TOP_SIZES = ["S", "M", "L", "XL", "XXL"];
const SHOE_SIZES = ["EU 40", "EU 41", "EU 42", "EU 43", "EU 44", "EU 45"];
const DEPARTMENTS = ["Unisex / All", "Men's Collection", "Women's Collection"];

function AccountPage() {
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();
  const { wishlist } = useWishlist();
  const { compareList } = useCompare();
  const { items: cartItems, count: cartCount } = useCart();
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Style & Fit Customization state
  const [selectedStyles, setSelectedStyles] = useState<string[]>(["streetwear", "sneakers"]);
  const [selectedTopSize, setSelectedTopSize] = useState<string>("L");
  const [selectedShoeSize, setSelectedShoeSize] = useState<string>("EU 42");
  const [selectedDept, setSelectedDept] = useState<string>("Unisex / All");
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("onboarding") === "true") {
        setShowOnboardingModal(true);
      }
    }
  }, []);

  // Admins can freely access /account to view their customer orders & profile

  useEffect(() => {
    if (user) {


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

  // Load saved preferences
  useEffect(() => {
    if (user) {
      const savedPrefs = (user.user_metadata as any)?.preferences;
      if (savedPrefs) {
        if (savedPrefs.styles) setSelectedStyles(savedPrefs.styles);
        if (savedPrefs.topSize) setSelectedTopSize(savedPrefs.topSize);
        if (savedPrefs.shoeSize) setSelectedShoeSize(savedPrefs.shoeSize);
        if (savedPrefs.department) setSelectedDept(savedPrefs.department);
      } else if (typeof window !== "undefined") {
        const local = localStorage.getItem("urban-vault-preferences");
        if (local) {
          try {
            const parsed = JSON.parse(local);
            if (parsed.styles) setSelectedStyles(parsed.styles);
            if (parsed.topSize) setSelectedTopSize(parsed.topSize);
            if (parsed.shoeSize) setSelectedShoeSize(parsed.shoeSize);
            if (parsed.department) setSelectedDept(parsed.department);
          } catch {}
        }
      }
    }
  }, [user]);

  const toggleStyle = (id: string) => {
    setSelectedStyles((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSavePreferences = async () => {
    if (!user) return;
    setSavingPrefs(true);
    const preferences = {
      styles: selectedStyles,
      topSize: selectedTopSize,
      shoeSize: selectedShoeSize,
      department: selectedDept,
    };
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("urban-vault-preferences", JSON.stringify(preferences));
      }
      await serverSaveOnboardingPreferences({
        data: {
          userId: user.id,
          preferences,
        },
      });
      toast.success("Boutique fit & style preferences saved successfully!");
    } catch (e) {
      console.warn("Could not sync preferences with server:", e);
      toast.success("Preferences saved to this device!");
    } finally {
      setSavingPrefs(false);
    }
  };

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "GH";
  const displayName =
    user?.user_metadata?.['full_name'] ?? user?.email?.split("@")[0] ?? "Guest";

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
              to={stat.to as any}
              search={stat.search as any}
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


        {/* Style & Fit Preferences Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5 mb-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <span className="h-8 w-8 rounded-lg bg-surface-muted text-primary border border-border flex items-center justify-center">
                  <SlidersHorizontal className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-display text-base font-bold text-foreground">
                    Fit &amp; Aesthetic Profile
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Customize your sizing for personalized drops and recommendations
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                onClick={handleSavePreferences}
                disabled={savingPrefs}
                className="rounded-xl shadow-xs font-semibold text-xs"
              >
                {savingPrefs ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5 mr-1" /> Save Profile
                  </>
                )}
              </Button>
            </div>

            {/* Sizing grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground block mb-1.5 font-semibold">
                  Top / Shirt Size
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {TOP_SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedTopSize(size)}
                      className={`h-8 w-10 rounded-lg text-xs font-bold transition-all ${
                        selectedTopSize === size
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "bg-surface-muted hover:bg-muted border border-border text-muted-foreground"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground block mb-1.5 font-semibold">
                  Footwear Size
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {SHOE_SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedShoeSize(size)}
                      className={`h-8 px-2 rounded-lg text-xs font-bold transition-all ${
                        selectedShoeSize === size
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "bg-surface-muted hover:bg-muted border border-border text-muted-foreground"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground block mb-1.5 font-semibold">
                Preferred Department
              </label>
              <div className="flex flex-wrap gap-1.5">
                {DEPARTMENTS.map((dept) => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => setSelectedDept(dept)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      selectedDept === dept
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-surface-muted hover:bg-muted border border-border text-muted-foreground"
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>

            {/* Aesthetics */}
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground block mb-1.5 font-semibold">
                Favorite Aesthetics
              </label>
              <div className="flex flex-wrap gap-1.5">
                {STYLE_AESTHETICS.map((style) => {
                  const isSelected = selectedStyles.includes(style.id);
                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => toggleStyle(style.id)}
                      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "bg-surface-muted hover:bg-muted border border-border text-muted-foreground"
                      }`}
                    >
                      <span>{style.emoji}</span>
                      <span>{style.label}</span>
                      {isSelected && <Check className="h-3 w-3 ml-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
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

                    {/* Visual Status Stepper */}
                    <OrderStatusStepper
                      status={order.status}
                      deliveryMethod={order.shipping_address?.deliveryMethod}
                    />

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
                search={{} as any}
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


      </div>

      {showOnboardingModal && (
        <BoutiqueOnboardingModal
          isOpen={showOnboardingModal}
          onOpenChange={setShowOnboardingModal}
          user={{
            id: user?.id || "preview-id",
            email: user?.email || "vip-member@urbanvaultgh.com",
            fullName: displayName,
          }}
        />
      )}

      <SiteFooter />
    </div>
  );
}
