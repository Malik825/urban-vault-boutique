import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  LayoutGrid,
  Loader2,
  Copy,
  Check,
  MessageCircle,
  Printer,
  ShoppingBag,
  Tag,
  Truck,
  ShieldCheck,
  Building2,
  CreditCard,
  Smartphone,
  Info,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { createCustomerOrder } from "@/lib/order.functions";
import { initializePaystackCheckout, PAYSTACK_PUBLIC_KEY } from "@/lib/paystack";
import { formatPrice, STORE, GHANA_REGIONS, whatsappLink } from "@/lib/store-data";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: `Checkout — ${STORE.name}` },
      {
        name: "description",
        content:
          "Secure checkout with Ghana Mobile Money (MTN MoMo, Telecel Cash), cards via Paystack, and direct WhatsApp order confirmation.",
      },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: `${STORE.siteUrl}/checkout` }],
  }),
  component: CheckoutPage,
});

interface OrderConfirmationData {
  orderId: string;
  customerName: string;
  email: string;
  phone: string;
  deliveryMethod: "delivery" | "pickup";
  address: string;
  city: string;
  region: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    qty: number;
    image: string;
    condition: string;
  }>;
  subtotal: number;
  discount: number;
  promoCode: string | null | undefined;
  shipping: number;
  total: number;
  paymentMethod: string;
  momoProvider?: string | undefined;
  paymentReference?: string | null | undefined;
  paymentStatus?: string | undefined;
  createdAt: string;
}

const PROMO_CODES: Record<string, { discountPercent?: number; freeShipping?: boolean; label: string }> = {
  VAULTVIP10: { discountPercent: 10, label: "VIP Club 10% Welcome Discount" },
  WELCOME10: { discountPercent: 10, label: "10% off welcome discount" },
  GHANA10: { discountPercent: 10, label: "10% African retail promo" },
  FREESHIP: { freeShipping: true, label: "Free shipping across Ghana" },
};

function CheckoutPage() {
  const { user } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmation, setOrderConfirmation] = useState<OrderConfirmationData | null>(null);
  const [copied, setCopied] = useState(false);

  // Form Fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Accra");
  const [region, setRegion] = useState(GHANA_REGIONS[0]?.name || "Greater Accra");
  const [paymentMethod, setPaymentMethod] = useState("momo");
  const [momoProvider, setMomoProvider] = useState("MTN Mobile Money");
  const [momoNumber, setMomoNumber] = useState("");

  // Pre-fill user data if authenticated
  useEffect(() => {
    if (user) {
      if (user.email && !email) setEmail(user.email);
      const fullName = (user.user_metadata?.["full_name"] as string) || "";
      if (fullName) {
        const parts = fullName.split(" ");
        if (!firstName) setFirstName(parts[0] || "");
        if (!lastName) setLastName(parts.slice(1).join(" ") || "");
      }
      const userPhone = (user.user_metadata?.["phone"] as string) || "";
      if (userPhone && !phone) setPhone(userPhone);
    }
  }, [user]);

  // Promo Code State
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);

  // Shipping Calculation
  const selectedRegionData = GHANA_REGIONS.find((r) => r.name === region) || GHANA_REGIONS[0];
  const baseShipping = deliveryMethod === "pickup" ? 0 : (selectedRegionData?.deliveryFee ?? 40);
  const isAccraFreeShipping = deliveryMethod === "delivery" && region === "Greater Accra" && subtotal >= 500;
  const isFreeShipping = appliedPromo === "FREESHIP" || isAccraFreeShipping;
  const shipping = isFreeShipping ? 0 : baseShipping;

  const discountPercent = appliedPromo && PROMO_CODES[appliedPromo]?.discountPercent ? PROMO_CODES[appliedPromo].discountPercent! : 0;
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const total = Math.max(0, subtotal - discountAmount + shipping);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    if (PROMO_CODES[code]) {
      setAppliedPromo(code);
      toast.success(`Coupon applied: ${PROMO_CODES[code].label}`);
    } else {
      toast.error("Invalid promo code. Try WELCOME10 or FREESHIP");
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput("");
    toast.info("Coupon removed");
  };

  const executeOrderCreation = async (paymentRef?: string, paidStatus: "paid" | "pending" = "pending") => {
    let paymentLabel = "Cash on Delivery";
    if (paymentMethod === "cod") paymentLabel = "Cash on Delivery (Pay on Arrival)";
    else if (paymentMethod === "card") paymentLabel = "Debit/Credit Card (Paystack)";
    else if (paymentMethod === "momo") paymentLabel = `Mobile Money via Paystack (${momoProvider})`;
    else if (paymentMethod === "whatsapp") paymentLabel = "WhatsApp Direct Order";

    const customerEmail = email.trim() || (user?.email ?? "orders@urbanvaultgh.com");

    const res = await createCustomerOrder({
      data: {
        userId: user?.id,
        firstName: firstName.trim() || "Customer",
        lastName: lastName.trim(),
        email: customerEmail,
        phone: phone.trim(),
        deliveryMethod,
        address: deliveryMethod === "pickup" ? STORE.pickupLocation : address,
        city: deliveryMethod === "pickup" ? "Accra" : city,
        region: deliveryMethod === "pickup" ? "Greater Accra" : region,
        paymentMethod: paymentLabel,
        momoProvider: paymentMethod === "momo" ? momoProvider : undefined,
        promoCode: appliedPromo || undefined,
        paymentReference: paymentRef,
        paymentStatus: paidStatus,
        items: items.map((i) => ({
          id: (i.product as any).dbId || i.product.id || (i.product as any).sku,
          qty: i.qty,
          name: i.product.name,
          price: i.product.price,
          image: i.product.images[0] || "/placeholder.jpg",
        })),
      },
    });

    const confirmation: OrderConfirmationData = {
      orderId: res.orderNumber,
      customerName: res.customerName,
      email: res.email,
      phone: res.phone,
      deliveryMethod: res.deliveryMethod,
      address: res.address,
      city: res.city,
      region: res.region,
      items: res.items.map((i: any) => ({
        id: i.product_id,
        name: i.product_name,
        price: i.unit_price,
        qty: i.quantity,
        image: i.image || "/placeholder.jpg",
        condition: "New",
      })),
      subtotal: res.subtotal,
      discount: res.discount,
      promoCode: res.promoCode,
      shipping: res.shipping,
      total: res.total,
      paymentMethod: res.paymentMethod,
      momoProvider: res.momoProvider,
      paymentReference: paymentRef || null,
      paymentStatus: paidStatus,
      createdAt: res.createdAt,
    };

    setOrderConfirmation(confirmation);
    clearCart();
    toast.success(`Order ${res.orderNumber} successfully registered!`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!phone.trim()) {
      toast.error("Please enter a valid Ghana phone or WhatsApp number");
      return;
    }

    if (deliveryMethod === "delivery") {
      if (!region || !region.trim()) {
        toast.error("Please select a delivery region");
        return;
      }
      if (!city.trim()) {
        toast.error("Please enter a city or town for delivery");
        return;
      }
      if (!address.trim()) {
        toast.error("Please provide a delivery street address or landmark");
        return;
      }
    }

    setIsSubmitting(true);

    // Paystack Payment Flow for Cards & MoMo
    if (paymentMethod === "card" || paymentMethod === "momo") {
      const customerEmail = email.trim() || user?.email;
      if (!customerEmail) {
        toast.error("Please enter an email address for your Paystack payment receipt.");
        setIsSubmitting(false);
        return;
      }

      try {
        await initializePaystackCheckout({
          email: customerEmail,
          amount: total,
          firstName: firstName.trim() || "Customer",
          lastName: lastName.trim(),
          phone: phone.trim() || momoNumber.trim(),
          channels: paymentMethod === "card" ? ["card"] : ["mobile_money", "card"],
          onSuccess: async (paystackRes) => {
            try {
              await executeOrderCreation(paystackRes.reference, "paid");
            } catch (err: any) {
              toast.error(err.message || "Failed to finalize order after payment.");
            } finally {
              setIsSubmitting(false);
            }
          },
          onClose: () => {
            setIsSubmitting(false);
            toast.info("Paystack checkout was closed. Your cart is preserved.");
          },
        });
      } catch (err: any) {
        setIsSubmitting(false);
        toast.error(err.message || "Could not launch Paystack checkout. Please try again.");
      }
    } else {
      // Offline / COD / WhatsApp flows
      try {
        await executeOrderCreation(undefined, "pending");
      } catch (err: any) {
        toast.error(err.message || "Failed to process order. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const copyOrderId = () => {
    if (!orderConfirmation) return;
    navigator.clipboard.writeText(orderConfirmation.orderId);
    setCopied(true);
    toast.success("Order ID copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  // Order Confirmation View
  if (orderConfirmation) {
    const isPaid = orderConfirmation.paymentStatus === "paid";
    const waText = encodeURIComponent(
      `Hello ${STORE.name}! I just placed an order:\n\n*Order ID:* ${orderConfirmation.orderId}\n*Customer:* ${orderConfirmation.customerName}\n*Phone:* ${orderConfirmation.phone}\n*Delivery Method:* ${orderConfirmation.deliveryMethod === "pickup" ? "Showroom Pickup" : `Delivery to ${orderConfirmation.address}, ${orderConfirmation.city} (${orderConfirmation.region})`}\n*Payment Method:* ${orderConfirmation.paymentMethod}${orderConfirmation.paymentReference ? `\n*Paystack Ref:* ${orderConfirmation.paymentReference}` : ""}\n*Status:* ${isPaid ? "PAID (Paystack Verified)" : "Pending Payment"}\n*Total:* ${formatPrice(orderConfirmation.total)}\n\nPlease confirm my order and provide dispatch details.`
    );

    return (
      <div className="min-h-screen bg-surface-muted text-foreground">
        <header className="border-b border-border bg-background py-4 sticky top-0 z-30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 outline-none">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-gradient text-primary-foreground shadow-glow">
                <LayoutGrid className="h-4 w-4" />
              </span>
              <span className="font-display text-lg font-extrabold tracking-tight">
                {STORE.name}
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5 hidden sm:flex">
                <Printer className="h-4 w-4" /> Print Receipt
              </Button>
              <Button asChild size="sm" variant="default">
                <Link to="/products">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-10 space-y-8">
            <div className="text-center space-y-3">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary animate-in zoom-in-50 duration-300">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                {isPaid ? "Payment Successful & Order Confirmed!" : "Thank You For Your Order!"}
              </h1>
              <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
                {isPaid
                  ? "Your payment was securely verified via Paystack Ghana. Our concierge logistics team is already preparing your boutique order."
                  : "Your order has been registered. Our logistics team will contact you to verify delivery and finalize dispatch."}
              </p>
            </div>

            {/* Order Reference Box */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-primary-soft/40 p-4 sm:p-5">
              <div className="space-y-1 text-center sm:text-left">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Order Reference</p>
                  {isPaid && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary border border-primary/30">
                      <ShieldCheck className="h-3 w-3" /> Paystack Paid
                    </span>
                  )}
                </div>
                <p className="font-mono text-xl font-extrabold text-foreground">{orderConfirmation.orderId}</p>
                {orderConfirmation.paymentReference && (
                  <p className="text-xs font-mono text-muted-foreground">
                    Paystack Ref: <span className="font-semibold text-foreground">{orderConfirmation.paymentReference}</span>
                  </p>
                )}
                <p className="text-xs text-muted-foreground">Placed on {orderConfirmation.createdAt}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={copyOrderId} className="gap-1.5 bg-background">
                  {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy ID"}
                </Button>
                <a
                  href={`https://wa.me/${STORE.whatsappRaw}?text=${waText}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  Track on WhatsApp
                </a>
              </div>
            </div>

            {/* Summary Details */}
            <div className="grid gap-6 sm:grid-cols-2 text-sm">
              <div className="space-y-3 rounded-2xl border border-border bg-surface-muted/50 p-5">
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Delivery &amp; Customer
                </h3>
                <div className="space-y-1.5">
                  <p className="font-semibold text-foreground">{orderConfirmation.customerName}</p>
                  <p className="text-muted-foreground">{orderConfirmation.phone} · {orderConfirmation.email}</p>
                  <p className="text-muted-foreground">
                    {orderConfirmation.deliveryMethod === "pickup" ? (
                      <span className="font-medium text-foreground">In-Store Pickup ({STORE.pickupLocation})</span>
                    ) : (
                      <span>{orderConfirmation.address}, {orderConfirmation.city}, {orderConfirmation.region}</span>
                    )}
                  </p>
                  <p className="text-xs text-primary font-medium pt-1">
                    {orderConfirmation.deliveryMethod === "pickup" ? "Ready in 2–4 hours" : "Estimated dispatch: 24–48 hours"}
                  </p>
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-border bg-surface-muted/50 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Payment Summary
                  </h3>
                  {isPaid ? (
                    <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary font-bold text-[10px]">
                      PAID
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">
                      Pending
                    </Badge>
                  )}
                </div>
                <div className="space-y-1.5">
                  <p className="font-semibold text-foreground text-xs">{orderConfirmation.paymentMethod}</p>
                  <div className="flex justify-between text-muted-foreground text-xs pt-1">
                    <span>Subtotal:</span>
                    <span>{formatPrice(orderConfirmation.subtotal)}</span>
                  </div>
                  {orderConfirmation.discount > 0 && (
                    <div className="flex justify-between text-primary text-xs">
                      <span>Discount ({orderConfirmation.promoCode}):</span>
                      <span>-{formatPrice(orderConfirmation.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-foreground text-xs">
                    <span>Shipping Fee:</span>
                    <span>{orderConfirmation.shipping > 0 ? formatPrice(orderConfirmation.shipping) : "Free Pickup"}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-foreground pt-1 border-t border-border">
                    <span>Total Amount:</span>
                    <span className="text-primary font-display text-base">{formatPrice(orderConfirmation.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ordered Items */}
            <div className="space-y-3">
              <h3 className="font-display text-base font-bold">Ordered Products</h3>
              <div className="divide-y divide-border rounded-2xl border border-border overflow-hidden">
                {orderConfirmation.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-3.5 bg-card">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-14 w-14 rounded-lg object-cover border border-border shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Grade: {item.condition} · Qty: {item.qty}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{formatPrice(item.price * item.qty)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface-muted lg:flex-row text-foreground">
      {/* Left Column - Form */}
      <div className="flex-1 bg-background px-4 py-8 sm:px-6 lg:px-12 lg:py-12 xl:px-20">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="flex items-center gap-2.5 outline-none">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-gradient text-primary-foreground shadow-glow">
                <LayoutGrid className="h-4 w-4" />
              </span>
              <span className="font-display text-lg font-extrabold tracking-tight">
                {STORE.name}
              </span>
            </Link>
          </div>

          <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
            <Link to="/products" className="hover:text-foreground">Products</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-semibold text-foreground">Checkout</span>
          </nav>

          {/* Account status banner */}
          {user ? (
            <div className="mb-6 rounded-2xl border border-primary/30 bg-primary/5 p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs sm:text-sm text-foreground">
                  Signed in as <strong>{user.email}</strong> — order will be linked to your account.
                </span>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-xs text-primary font-semibold shrink-0">
                <Link to="/account">My Account</Link>
              </Button>
            </div>
          ) : (
            <div className="mb-6 rounded-2xl border border-amber-400/40 bg-amber-400/8 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="text-xs sm:text-sm text-foreground">
                  <strong>Sign in to complete checkout.</strong>{" "}
                  Fill your details below, then sign in at the bottom to place your order.
                </span>
              </div>
              <Button asChild variant="outline" size="sm" className="text-xs shrink-0 font-semibold border-amber-400/60 text-amber-700 dark:text-amber-400 hover:bg-amber-400/10">
                <Link to="/auth" search={{ redirect: "/checkout" }}>
                  Sign In / Register
                </Link>
              </Button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. Contact Information */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-bold tracking-tight flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/10 text-primary text-xs font-bold">1</span>
                  Contact Information
                </h2>
                <span className="text-xs text-muted-foreground">No account required</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">First name *</Label>
                  <Input
                    id="firstName"
                    required
                    placeholder="Kwame"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName">Last name *</Label>
                  <Input
                    id="lastName"
                    required
                    placeholder="Mensah"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone / WhatsApp Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    placeholder="+233 24 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <p className="text-[11px] text-muted-foreground">Used for delivery updates &amp; WhatsApp receipt</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="flex items-center justify-between">
                    <span>Email address</span>
                    {(paymentMethod === "card" || paymentMethod === "momo") && (
                      <span className="text-[10px] font-semibold text-primary">Required for Paystack receipt</span>
                    )}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="kwame@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <p className="text-[11px] text-muted-foreground">Order confirmation &amp; Paystack payment receipt</p>
                </div>
              </div>
            </section>

            {/* 2. Delivery Experience - Requirement 7 */}
            <section className="space-y-4 pt-4 border-t border-border">
              <h2 className="font-display text-base font-bold tracking-tight flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/10 text-primary text-xs font-bold">2</span>
                Delivery Details
              </h2>

              {/* Delivery vs Pickup Toggle */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod("delivery")}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    deliveryMethod === "delivery"
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border bg-card hover:bg-surface-muted"
                  }`}
                >
                  <Truck className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">Delivery</p>
                    <p className="text-xs text-muted-foreground">Doorstep dispatch</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryMethod("pickup")}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    deliveryMethod === "pickup"
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border bg-card hover:bg-surface-muted"
                  }`}
                >
                  <Building2 className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">In-Store Pickup</p>
                    <p className="text-xs text-muted-foreground">Free in Osu, Accra</p>
                  </div>
                </button>
              </div>

              {deliveryMethod === "delivery" ? (
                <div className="grid gap-3 sm:grid-cols-2 pt-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="region">Region *</Label>
                    <Select value={region} onValueChange={setRegion}>
                      <SelectTrigger id="region" className="w-full">
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        {GHANA_REGIONS.map((r) => (
                          <SelectItem key={r.name} value={r.name}>
                            {r.name} ({formatPrice(r.deliveryFee)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="city">City / Town *</Label>
                    <Input
                      id="city"
                      required
                      placeholder="e.g. Accra / Kumasi / Tema"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="address">Street Address / Landmark *</Label>
                    <Input
                      id="address"
                      required
                      placeholder="e.g. 14 Ring Road Central, near Total Station"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-surface-muted p-4 text-xs space-y-1">
                  <p className="font-semibold text-foreground">Pickup Location:</p>
                  <p className="text-muted-foreground">{STORE.pickupLocation}</p>
                  <p className="text-primary font-medium pt-1">
                    Pickup is free. Orders are prepared within 2 hours of confirmation.
                  </p>
                </div>
              )}
            </section>

            {/* 3. Ghana Payment Experience - Requirement 6 */}
            <section className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-bold tracking-tight flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/10 text-primary text-xs font-bold">3</span>
                  Payment Method
                </h2>
              </div>

              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                {/* Mobile Money */}
                <div
                  className={`rounded-2xl border p-4 transition-all ${
                    paymentMethod === "momo" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-start justify-between cursor-pointer" onClick={() => setPaymentMethod("momo")}>
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="momo" id="momo" className="mt-1" />
                      <div>
                        <div className="flex items-center gap-2">
                          <Label htmlFor="momo" className="font-bold text-sm cursor-pointer block">
                            Mobile Money (MoMo via Paystack)
                          </Label>
                          <span className="rounded bg-primary/10 border border-primary/30 px-1.5 py-0.2 text-[10px] font-bold text-primary">
                            Instant Prompt
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          MTN Mobile Money, Telecel Cash &amp; AirtelTigo Money via Paystack Ghana
                        </p>
                      </div>
                    </div>
                    <Smartphone className="h-5 w-5 text-amber-500 shrink-0" />
                  </div>

                  {paymentMethod === "momo" && (
                    <div className="mt-4 pt-3 border-t border-border/80 space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        {["MTN Mobile Money", "Telecel Cash", "AirtelTigo"].map((provider) => (
                          <button
                            type="button"
                            key={provider}
                            onClick={() => setMomoProvider(provider)}
                            className={`rounded-lg border px-2 py-1.5 text-xs font-semibold text-center transition-colors ${
                              momoProvider === provider
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-card text-foreground hover:bg-surface-muted border-border"
                            }`}
                          >
                            {provider}
                          </button>
                        ))}
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="momoNumber" className="text-xs">
                          {momoProvider} Number
                        </Label>
                        <Input
                          id="momoNumber"
                          placeholder="e.g. 024 123 4567"
                          value={momoNumber}
                          onChange={(e) => setMomoNumber(e.target.value)}
                          className="text-xs"
                        />
                        <p className="text-[10px] text-muted-foreground">
                          Paystack will launch the secure prompt directly to your device.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card / Paystack */}
                <div
                  className={`rounded-2xl border p-4 transition-all ${
                    paymentMethod === "card" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-start justify-between cursor-pointer" onClick={() => setPaymentMethod("card")}>
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="card" id="card" className="mt-1" />
                      <div>
                        <div className="flex items-center gap-2">
                          <Label htmlFor="card" className="font-bold text-sm cursor-pointer block">
                            Debit / Credit Card (Paystack)
                          </Label>
                          <span className="rounded bg-blue-500/10 border border-blue-500/30 px-1.5 py-0.2 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                            Visa &bull; Mastercard
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Instant card payment secured by Paystack (Ghana &amp; International cards)
                        </p>
                      </div>
                    </div>
                    <CreditCard className="h-5 w-5 text-blue-500 shrink-0" />
                  </div>
                </div>

                {/* Cash on Delivery */}
                <div
                  className={`rounded-2xl border p-4 transition-all ${
                    paymentMethod === "cod" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-start justify-between cursor-pointer" onClick={() => setPaymentMethod("cod")}>
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="cod" id="cod" className="mt-1" />
                      <div>
                        <Label htmlFor="cod" className="font-bold text-sm cursor-pointer block">
                          Cash on Delivery (Pay upon Arrival)
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Inspect your boutique items in person and pay cash or MoMo directly to the courier rider.
                        </p>
                      </div>
                    </div>
                    <Truck className="h-5 w-5 text-primary shrink-0" />
                  </div>
                </div>

                {/* WhatsApp Order Option */}
                <div
                  className={`rounded-2xl border p-4 transition-all ${
                    paymentMethod === "whatsapp" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-start justify-between cursor-pointer" onClick={() => setPaymentMethod("whatsapp")}>
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="whatsapp" id="whatsapp" className="mt-1" />
                      <div>
                        <Label htmlFor="whatsapp" className="font-bold text-sm cursor-pointer block">
                          Order Directly via WhatsApp
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Confirm specs, negotiate bulk discount, or pay cash upon physical verification
                        </p>
                      </div>
                    </div>
                    <MessageCircle className="h-5 w-5 text-primary shrink-0" />
                  </div>
                </div>
              </RadioGroup>
            </section>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border">
              <Link to="/products" className="flex items-center text-xs font-medium text-primary hover:underline">
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                Return to catalogue
              </Link>
              {!user ? (
                /* Auth gate — shown instead of submit when guest */
                <div className="w-full sm:w-auto flex flex-col items-stretch sm:items-end gap-2">
                  <div className="rounded-2xl border border-amber-400/40 bg-amber-400/8 px-5 py-4 text-center sm:text-right">
                    <p className="text-sm font-bold text-foreground">Ready to order?</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Create a free account or sign in to place your order and track delivery.
                    </p>
                    <div className="mt-3 flex flex-col sm:flex-row gap-2 justify-center sm:justify-end">
                      <Button asChild variant="outline" size="sm" className="text-xs font-semibold">
                        <Link to="/auth" search={{ redirect: "/checkout" }}>Sign In</Link>
                      </Button>
                      <Button asChild size="sm" className="text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground">
                        <Link to="/auth" search={{ redirect: "/checkout", mode: "register" }}>Create Account — it's free</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <Button type="submit" size="lg" disabled={isSubmitting || items.length === 0} className="w-full sm:w-auto px-8 font-bold">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {paymentMethod === "card" || paymentMethod === "momo" ? "Connecting to Paystack..." : "Confirming Order..."}
                    </>
                  ) : paymentMethod === "card" ? (
                    `Pay with Card (Paystack) · ${formatPrice(total)}`
                  ) : paymentMethod === "momo" ? (
                    `Pay with MoMo (Paystack) · ${formatPrice(total)}`
                  ) : paymentMethod === "whatsapp" ? (
                    `Order via WhatsApp · ${formatPrice(total)}`
                  ) : (
                    `Place Order · ${formatPrice(total)}`
                  )}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Right Column - Order Summary */}
      <div className="w-full border-t border-border bg-surface-muted px-4 py-8 sm:px-6 lg:w-[42%] lg:max-w-md lg:border-l lg:border-t-0 lg:px-8 xl:max-w-lg">
        <div className="sticky top-12 mx-auto max-w-2xl space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold tracking-tight">Order Summary</h2>
            <Badge variant="secondary" className="gap-1 font-semibold text-xs">
              <ShoppingBag className="h-3.5 w-3.5" />
              {items.reduce((acc, i) => acc + i.qty, 0)} items
            </Badge>
          </div>

          <ul className="divide-y divide-border/60 max-h-72 overflow-y-auto pr-1">
            {items.map((item) => (
              <li key={item.product.id} className="flex py-3.5 items-center">
                <div className="relative h-14 w-14 shrink-0 rounded-lg border border-border bg-background p-1">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="h-full w-full rounded-md object-cover"
                  />
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm">
                    {item.qty}
                  </span>
                </div>
                <div className="ml-3.5 flex flex-1 flex-col justify-center min-w-0">
                  <h3 className="text-sm font-semibold truncate">{item.product.name}</h3>
                  <p className="text-xs text-muted-foreground">{item.product.condition}</p>
                </div>
                <div className="ml-3 text-right">
                  <p className="text-sm font-bold">{formatPrice(item.product.price * item.qty)}</p>
                </div>
              </li>
            ))}
          </ul>

          {/* Promo Code Box */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <Label htmlFor="promo" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
              <Tag className="h-3.5 w-3.5" /> Coupon / Promo Code
            </Label>
            {appliedPromo ? (
              <div className="flex items-center justify-between rounded-xl bg-primary/10 border border-primary/30 p-2.5 text-xs text-primary font-semibold">
                <span>Applied: {appliedPromo} ({PROMO_CODES[appliedPromo]?.label})</span>
                <button
                  type="button"
                  onClick={handleRemovePromo}
                  className="text-muted-foreground hover:text-foreground font-bold ml-2 underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <Input
                  id="promo"
                  placeholder="e.g. WELCOME10"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  className="h-9 uppercase text-xs font-mono"
                />
                <Button type="submit" variant="secondary" className="h-9 text-xs px-3 font-semibold">
                  Apply
                </Button>
              </form>
            )}
            <p className="mt-2 text-[11px] text-muted-foreground">
              Available promo codes: <code className="font-semibold text-foreground">WELCOME10</code> or <code className="font-semibold text-foreground">FREESHIP</code>
            </p>
          </div>

          <Separator />

          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="font-medium text-foreground">{formatPrice(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-primary font-medium">
                <span>Discount ({appliedPromo})</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>
                {deliveryMethod === "pickup" ? "In-Store Pickup" : `Delivery (${region})`}
              </span>
              <span className={`font-medium ${isFreeShipping || shipping === 0 ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-foreground"}`}>
                {shipping > 0
                  ? formatPrice(shipping)
                  : isAccraFreeShipping
                  ? "FREE (Accra GH₵ 500+ promo)"
                  : "Free"}
              </span>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <span className="text-base font-semibold">Total Amount</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs text-muted-foreground">GHS</span>
              <span className="font-display text-2xl font-extrabold tracking-tight text-primary">
                {formatPrice(total)}
              </span>
            </div>
          </div>

          <div className="pt-2 text-center">
            <p className="text-[11px] text-muted-foreground">
              🛡️ Secure Checkout · Backed by {STORE.name} quality &amp; authenticity guarantee
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
