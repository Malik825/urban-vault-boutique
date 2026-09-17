import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
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
    ],
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
  promoCode: string | null;
  shipping: number;
  total: number;
  paymentMethod: string;
  momoProvider?: string;
  createdAt: string;
}

const PROMO_CODES: Record<string, { discountPercent?: number; freeShipping?: boolean; label: string }> = {
  WELCOME10: { discountPercent: 10, label: "10% off welcome discount" },
  GHANA10: { discountPercent: 10, label: "10% African retail promo" },
  FREESHIP: { freeShipping: true, label: "Free shipping across Ghana" },
};

function CheckoutPage() {
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
  const [region, setRegion] = useState("Greater Accra");
  const [paymentMethod, setPaymentMethod] = useState("momo");
  const [momoProvider, setMomoProvider] = useState("MTN Mobile Money");
  const [momoNumber, setMomoNumber] = useState("");

  // Promo Code State
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);

  // Shipping Calculation
  const selectedRegionData = GHANA_REGIONS.find((r) => r.name === region) || GHANA_REGIONS[0];
  const baseShipping = deliveryMethod === "pickup" ? 0 : (selectedRegionData?.deliveryFee ?? 40);
  const isFreeShipping = appliedPromo === "FREESHIP";
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsSubmitting(true);
    const generatedId = `GH-${Math.floor(100000 + Math.random() * 900000)}`;

    setTimeout(() => {
      let paymentLabel = "Mobile Money";
      if (paymentMethod === "momo") paymentLabel = `Mobile Money (${momoProvider})`;
      else if (paymentMethod === "card") paymentLabel = "Debit/Credit Card (Paystack)";
      else if (paymentMethod === "whatsapp") paymentLabel = "WhatsApp Direct Order";

      const confirmation: OrderConfirmationData = {
        orderId: generatedId,
        customerName: `${firstName} ${lastName}`.trim() || "Customer",
        email: email || "customer@example.com",
        phone: phone || "+233 24 000 0000",
        deliveryMethod,
        address: deliveryMethod === "pickup" ? STORE.pickupLocation : address,
        city: deliveryMethod === "pickup" ? "Accra" : city,
        region: deliveryMethod === "pickup" ? "Greater Accra" : region,
        items: items.map((i) => ({
          id: i.product.id,
          name: i.product.name,
          price: i.product.price,
          qty: i.qty,
          image: i.product.images[0] || "/placeholder.jpg",
          condition: i.product.condition,
        })),
        subtotal,
        discount: discountAmount,
        promoCode: appliedPromo,
        shipping,
        total,
        paymentMethod: paymentLabel,
        momoProvider,
        createdAt: new Date().toLocaleDateString("en-GH", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setOrderConfirmation(confirmation);
      setIsSubmitting(false);
      clearCart();
      toast.success("Order placed! We'll confirm via WhatsApp shortly.");
    }, 1200);
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
    const waText = encodeURIComponent(
      `Hello ${STORE.name}! I just placed an order:\n\n*Order ID:* ${orderConfirmation.orderId}\n*Customer:* ${orderConfirmation.customerName}\n*Phone:* ${orderConfirmation.phone}\n*Delivery Method:* ${orderConfirmation.deliveryMethod === "pickup" ? "Pickup in Osu" : `Delivery to ${orderConfirmation.address}, ${orderConfirmation.city} (${orderConfirmation.region})`}\n*Payment Method:* ${orderConfirmation.paymentMethod}\n*Total:* ${formatPrice(orderConfirmation.total)}\n\nPlease confirm my order and provide dispatch details.`
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
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 animate-in zoom-in-50 duration-300">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                Thank You For Your Order!
              </h1>
              <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
                Your order has been placed. Our logistics team will contact you on WhatsApp to confirm delivery details and dispatch.
              </p>
            </div>

            {/* Order Reference Box */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-primary-soft/40 p-4 sm:p-5">
              <div className="space-y-0.5 text-center sm:text-left">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Order Reference Number</p>
                <p className="font-mono text-xl font-extrabold text-foreground">{orderConfirmation.orderId}</p>
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
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  Confirm via WhatsApp
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
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Payment Summary
                </h3>
                <div className="space-y-1.5">
                  <p className="font-semibold text-foreground">{orderConfirmation.paymentMethod}</p>
                  <div className="flex justify-between text-muted-foreground text-xs pt-1">
                    <span>Subtotal:</span>
                    <span>{formatPrice(orderConfirmation.subtotal)}</span>
                  </div>
                  {orderConfirmation.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 text-xs">
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
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="kwame@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
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
                        <Label htmlFor="momo" className="font-bold text-sm cursor-pointer block">
                          Mobile Money (MoMo)
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          MTN Mobile Money, Telecel Cash &amp; AirtelTigo Money
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
                          Instant USSD confirmation prompt will be sent to your phone.
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
                        <Label htmlFor="card" className="font-bold text-sm cursor-pointer block">
                          Debit / Credit Card (Paystack)
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Visa, Mastercard, GH-Link &amp; Bank Transfer
                        </p>
                      </div>
                    </div>
                    <CreditCard className="h-5 w-5 text-blue-500 shrink-0" />
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
                    <MessageCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                  </div>
                </div>
              </RadioGroup>
            </section>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border">
              <Link to="/products" className="flex items-center text-xs font-medium text-primary hover:underline">
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                Return to catalogue
              </Link>
              <Button type="submit" size="lg" disabled={isSubmitting || items.length === 0} className="w-full sm:w-auto px-8 font-bold">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Confirming Order...
                  </>
                ) : (
                  `Place Order (${formatPrice(total)})`
                )}
              </Button>
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
              <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-2.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
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
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                <span>Discount ({appliedPromo})</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>
                {deliveryMethod === "pickup" ? "In-Store Pickup" : `Delivery (${region})`}
              </span>
              <span className="font-medium text-foreground">
                {shipping > 0 ? formatPrice(shipping) : "Free"}
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
              🛡️ Secure Checkout · Backed by GadgetHaus warranty &amp; authenticity guarantee
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
