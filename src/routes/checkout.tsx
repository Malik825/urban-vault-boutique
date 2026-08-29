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
  ShieldCheck
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/cart";
import { formatPrice, STORE, whatsappLink } from "@/lib/store-data";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { getReferralCode, clearReferralCode } from "@/lib/referral";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});

interface OrderConfirmationData {
  orderId: string;
  customerName: string;
  email: string;
  phone: string;
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
  createdAt: string;
  storeCreditUsed: number;
  referralCodeUsed: string | null;
}

const PROMO_CODES: Record<string, { discountPercent?: number; freeShipping?: boolean; label: string }> = {
  WELCOME10: { discountPercent: 10, label: "10% off welcome discount" },
  GADGET5: { discountPercent: 5, label: "5% off gadget promo" },
  FREESHIP: { freeShipping: true, label: "Free Express Shipping" },
};

function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmation, setOrderConfirmation] = useState<OrderConfirmationData | null>(null);
  const [copied, setCopied] = useState(false);

  // Profile / Credit
  const [storeCredit, setStoreCredit] = useState(0);
  const [useStoreCredit, setUseStoreCredit] = useState(false);
  
  useEffect(() => {
    if (user) {
      supabase.from("profiles").select("store_credit").eq("id", user.id).single()
        .then(({ data }) => { if (data) setStoreCredit(data.store_credit || 0); });
    }
  }, [user]);

  // Form Fields
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("momo");

  // Promo Code State
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);

  const initialShipping = subtotal > 0 ? 5000 : 0;
  const isFreeShipping = appliedPromo === "FREESHIP";
  const shipping = isFreeShipping ? 0 : initialShipping;

  const discountPercent = appliedPromo && PROMO_CODES[appliedPromo]?.discountPercent ? PROMO_CODES[appliedPromo].discountPercent! : 0;
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  
  let totalBeforeCredit = Math.max(0, subtotal - discountAmount + shipping);
  const creditApplied = useStoreCredit ? Math.min(storeCredit, totalBeforeCredit) : 0;
  const total = totalBeforeCredit - creditApplied;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    if (PROMO_CODES[code]) {
      setAppliedPromo(code);
      toast.success(`Coupon applied: ${PROMO_CODES[code].label}`);
    } else {
      toast.error("Invalid coupon code. Try WELCOME10 or FREESHIP");
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
      const confirmation: OrderConfirmationData = {
        orderId: generatedId,
        customerName: `${firstName} ${lastName}`.trim(),
        email,
        phone,
        address: apartment ? `${address}, ${apartment}` : address,
        city,
        region,
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
        paymentMethod: paymentMethod === "momo" ? "Mobile Money (MTN / Vodafone / AirtelTigo)" : "Card Payment",
        createdAt: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        storeCreditUsed: creditApplied,
        referralCodeUsed: getReferralCode(),
      };

      setOrderConfirmation(confirmation);
      setIsSubmitting(false);
      clearCart();
      clearReferralCode();
      toast.success("Order placed successfully!");
    }, 1500);
  };

  const copyOrderId = () => {
    if (!orderConfirmation) return;
    navigator.clipboard.writeText(orderConfirmation.orderId);
    setCopied(true);
    toast.success("Order ID copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  if (orderConfirmation) {
    const waText = encodeURIComponent(
      `Hello ${STORE.name}! I just placed an order:\n\n*Order ID:* ${orderConfirmation.orderId}\n*Customer:* ${orderConfirmation.customerName}\n*Phone:* ${orderConfirmation.phone}\n*Delivery Address:* ${orderConfirmation.address}, ${orderConfirmation.city}\n*Total:* ${formatPrice(orderConfirmation.total)}\n\nPlease confirm availability and delivery dispatch.`
    );

    return (
      <div className="min-h-screen bg-surface-muted">
        {/* Header */}
        <header className="border-b border-border bg-background py-4 sticky top-0 z-30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl">
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

        {/* Confirmation Content */}
        <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-10 space-y-8">
            {/* Top Success Badge */}
            <div className="text-center space-y-3">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary-soft text-primary animate-in zoom-in-50 duration-300">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                Thank You For Your Order!
              </h1>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Your order has been recorded. Our logistics team will review and contact you on WhatsApp to confirm delivery details.
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
                  href={`https://wa.me/${STORE.whatsapp.replace(/[^0-9]/g, "")}?text=${waText}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  Confirm via WhatsApp
                </a>
              </div>
            </div>

            {/* Two Column Details */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Customer & Shipping Details */}
              <div className="space-y-4 rounded-2xl border border-border bg-surface-muted/50 p-5">
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Shipping &amp; Contact
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Recipient</p>
                    <p className="font-semibold text-foreground">{orderConfirmation.customerName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Phone &amp; Email</p>
                    <p className="font-medium text-foreground">{orderConfirmation.phone} · {orderConfirmation.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Delivery Destination</p>
                    <p className="font-medium text-foreground">{orderConfirmation.address}, {orderConfirmation.city}, {orderConfirmation.region}</p>
                  </div>
                  <div className="pt-2 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    <Truck className="h-4 w-4" /> Same-day / Next-day dispatch
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="space-y-4 rounded-2xl border border-border bg-surface-muted/50 p-5">
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Payment Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Payment Method</p>
                    <p className="font-semibold text-foreground">{orderConfirmation.paymentMethod}</p>
                  </div>
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>{formatPrice(orderConfirmation.subtotal)}</span>
                    </div>
                    {orderConfirmation.discount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>Discount ({orderConfirmation.promoCode})</span>
                        <span>-{formatPrice(orderConfirmation.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping Fee</span>
                      <span>{orderConfirmation.shipping > 0 ? formatPrice(orderConfirmation.shipping) : "Free"}</span>
                    </div>
                    {orderConfirmation.storeCreditUsed > 0 && (
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>Store Credit Applied</span>
                        <span>-{formatPrice(orderConfirmation.storeCreditUsed)}</span>
                      </div>
                    )}
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold text-base text-foreground">
                      <span>Total Paid</span>
                      <span className="font-display text-lg text-primary">{formatPrice(orderConfirmation.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items List */}
            <div className="space-y-3 pt-2">
              <h3 className="font-display text-base font-bold tracking-tight">Ordered Items</h3>
              <div className="divide-y divide-border/60 rounded-2xl border border-border overflow-hidden">
                {orderConfirmation.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-card">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-16 w-16 rounded-xl object-cover border border-border shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Condition: {item.condition} · Qty: {item.qty}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{formatPrice(item.price * item.qty)}</p>
                      <p className="text-xs text-muted-foreground">{formatPrice(item.price)} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust Footer */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>All devices backed by Voltix Warranty &amp; Authenticity Guarantee</span>
              </div>
              <p>Questions? Call/WhatsApp: {STORE.phone}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface-muted lg:flex-row">
      {/* Left Column - Form */}
      <div className="flex-1 bg-background px-4 py-8 sm:px-6 lg:px-12 lg:py-16 xl:px-24">
        <div className="mx-auto max-w-2xl">
          <Link to="/" className="flex shrink-0 items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl w-fit mb-8 lg:mb-12">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-gradient text-primary-foreground shadow-glow">
              <LayoutGrid className="h-4 w-4" />
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight">
              {STORE.name}
            </span>
          </Link>

          <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/products" className="hover:text-foreground">Store</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-semibold text-foreground">Checkout</span>
          </nav>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Contact Info */}
            <section>
              <h2 className="font-display text-lg font-bold tracking-tight mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-surface-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone number (WhatsApp preferred)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+233 24 000 0000"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-surface-muted"
                  />
                </div>
              </div>
            </section>

            {/* Shipping Address */}
            <section>
              <h2 className="font-display text-lg font-bold tracking-tight mb-4">Shipping Address</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="bg-surface-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    id="lastName"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="bg-surface-muted"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="address">Street address</Label>
                  <Input
                    id="address"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="bg-surface-muted"
                    placeholder="e.g. 14 Oxford Street, Osu"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="apartment">Apartment, suite, landmark (optional)</Label>
                  <Input
                    id="apartment"
                    value={apartment}
                    onChange={(e) => setApartment(e.target.value)}
                    className="bg-surface-muted"
                    placeholder="Near Total Filling Station"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City / Town</Label>
                  <Input
                    id="city"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="bg-surface-muted"
                    placeholder="Accra / Lagos"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Region / State</Label>
                  <Input
                    id="region"
                    required
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="bg-surface-muted"
                    placeholder="Greater Accra"
                  />
                </div>
              </div>
            </section>

            {/* Payment Method */}
            <section>
              <h2 className="font-display text-xl font-bold tracking-tight mb-4">Payment Method</h2>
              <div className="rounded-xl border border-border bg-surface-muted p-4">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-3 rounded-lg border border-border bg-background p-4 shadow-sm">
                    <RadioGroupItem value="momo" id="momo" />
                    <Label htmlFor="momo" className="flex-1 cursor-pointer font-medium">
                      Mobile Money (MTN MoMo, Vodafone Cash, AirtelTigo)
                    </Label>
                  </div>
                  <div className="mt-3 flex items-center space-x-3 rounded-lg border border-border bg-background p-4 shadow-sm opacity-60">
                    <RadioGroupItem value="card" id="card" disabled />
                    <Label htmlFor="card" className="flex-1 font-medium">
                      Debit / Credit Card (Coming soon)
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </section>

            <div className="flex items-center justify-between pt-6 border-t border-border">
              <Link to="/products" className="flex items-center text-sm font-medium text-primary hover:underline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to shopping
              </Link>
              <Button type="submit" size="lg" disabled={isSubmitting || items.length === 0} className="w-full sm:w-auto px-8">
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

      {/* Right Column - Order Summary & Promo Code */}
      <div className="w-full border-t border-border bg-surface-muted px-4 py-8 sm:px-6 lg:w-[45%] lg:max-w-md lg:border-l lg:border-t-0 lg:px-12 xl:max-w-lg">
        <div className="sticky top-12 mx-auto max-w-2xl space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold tracking-tight">Order Summary</h2>
            <Badge variant="secondary" className="gap-1 font-semibold">
              <ShoppingBag className="h-3.5 w-3.5" />
              {items.reduce((acc, i) => acc + i.qty, 0)} items
            </Badge>
          </div>

          <ul className="divide-y divide-border/50 max-h-72 overflow-y-auto pr-1">
            {items.map((item) => (
              <li key={item.product.id} className="flex py-4">
                <div className="relative h-16 w-16 shrink-0 rounded-lg border border-border bg-background p-1">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="h-full w-full rounded-md object-cover"
                  />
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm">
                    {item.qty}
                  </span>
                </div>
                <div className="ml-4 flex flex-1 flex-col justify-center min-w-0">
                  <h3 className="text-sm font-medium truncate">{item.product.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{item.product.condition}</p>
                </div>
                <div className="ml-4 flex items-center text-sm font-semibold">
                  {formatPrice(item.product.price * item.qty)}
                </div>
              </li>
            ))}
          </ul>

          {/* Promo Code Box */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <Label htmlFor="promo" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
              <Tag className="h-3.5 w-3.5" /> Promo or Discount Code
            </Label>
            {appliedPromo ? (
              <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-2.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>Code {appliedPromo} applied ({PROMO_CODES[appliedPromo]?.label})</span>
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
                  className="h-10 uppercase text-xs font-mono"
                />
                <Button type="submit" variant="secondary" className="h-10 text-xs px-4">
                  Apply
                </Button>
              </form>
            )}
            <p className="mt-2 text-[11px] text-muted-foreground">
              Try <code className="font-semibold text-foreground">WELCOME10</code> (10% off) or <code className="font-semibold text-foreground">FREESHIP</code>
            </p>
          </div>

          <Separator />

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <p>Subtotal</p>
              <p className="font-medium text-foreground">{formatPrice(subtotal)}</p>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                <p>Discount ({appliedPromo})</p>
                <p>-{formatPrice(discountAmount)}</p>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <p>Shipping (Ghana / Nigeria)</p>
              <p className="font-medium text-foreground">
                {shipping > 0 ? formatPrice(shipping) : "Free"}
              </p>
            </div>
            
            {storeCredit > 0 && (
              <div className="pt-3 border-t border-border mt-3">
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={useStoreCredit}
                      onChange={(e) => setUseStoreCredit(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                    />
                    <div>
                      <p className="font-semibold group-hover:text-primary transition-colors">Apply Store Credit</p>
                      <p className="text-xs text-muted-foreground">Balance: {formatPrice(storeCredit)}</p>
                    </div>
                  </div>
                  {useStoreCredit && (
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">-{formatPrice(creditApplied)}</span>
                  )}
                </label>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <p className="text-base font-medium">Total</p>
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-muted-foreground">GHS</span>
              <p className="font-display text-2xl font-extrabold tracking-tight">
                {formatPrice(total)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
