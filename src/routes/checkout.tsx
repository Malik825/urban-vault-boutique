import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, ChevronRight, LayoutGrid, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/lib/cart";
import { formatPrice, STORE } from "@/lib/store-data";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const shipping = subtotal > 0 ? 5000 : 0; // Flat 5,000 GH₵ shipping for demo
  const total = subtotal + shipping;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    
    setIsSubmitting(true);
    // Simulate network request
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      clearCart();
      toast.success("Order placed successfully!");
    }, 2000);
  };

  if (success) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <header className="border-b border-border bg-background py-4">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <Link to="/" className="flex shrink-0 items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl w-fit">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-gradient text-primary-foreground shadow-glow">
                <LayoutGrid className="h-4 w-4" />
              </span>
              <span className="font-display text-lg font-extrabold tracking-tight">
                {STORE.name}
              </span>
            </Link>
          </div>
        </header>
        <main className="flex flex-1 flex-col items-center justify-center p-6 text-center">
          <div className="mx-auto max-w-md space-y-6">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary-soft">
              <CheckCircle2 className="h-12 w-12 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
              Thank you for your order!
            </h1>
            <p className="text-muted-foreground">
              We've received your order and will contact you on WhatsApp shortly to confirm delivery details.
            </p>
            <div className="pt-6">
              <Button asChild size="lg" className="w-full">
                <Link to="/">Continue Shopping</Link>
              </Button>
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
            <Link to="/cart" className="hover:text-foreground">Cart</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-semibold text-foreground">Checkout</span>
          </nav>

          <form onSubmit={handleSubmit} className="space-y-10">
            <section>
              <h2 className="font-display text-lg font-bold tracking-tight mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input id="email" type="email" placeholder="you@example.com" required className="bg-surface-muted" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone number (WhatsApp preferred)</Label>
                  <Input id="phone" type="tel" placeholder="+233..." required className="bg-surface-muted" />
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold tracking-tight mb-4">Shipping Address</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input id="firstName" required className="bg-surface-muted" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input id="lastName" required className="bg-surface-muted" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" required className="bg-surface-muted" placeholder="Street address or P.O. Box" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="apartment">Apartment, suite, etc. (optional)</Label>
                  <Input id="apartment" className="bg-surface-muted" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" required className="bg-surface-muted" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Region / State</Label>
                  <Input id="region" required className="bg-surface-muted" />
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold tracking-tight mb-4">Payment Method</h2>
              <div className="rounded-xl border border-border bg-surface-muted p-4">
                <RadioGroup defaultValue="momo">
                  <div className="flex items-center space-x-3 rounded-lg border border-border bg-background p-4 shadow-sm">
                    <RadioGroupItem value="momo" id="momo" />
                    <Label htmlFor="momo" className="flex-1 cursor-pointer font-medium">Mobile Money (MTN, Vodafone, AirtelTigo)</Label>
                  </div>
                  <div className="mt-3 flex items-center space-x-3 rounded-lg border border-border bg-background p-4 shadow-sm opacity-60">
                    <RadioGroupItem value="card" id="card" disabled />
                    <Label htmlFor="card" className="flex-1 font-medium">Credit / Debit Card (Coming soon)</Label>
                  </div>
                </RadioGroup>
              </div>
            </section>

            <div className="flex items-center justify-between pt-6 border-t border-border">
              <Link to="/" className="flex items-center text-sm font-medium text-primary hover:underline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to shopping
              </Link>
              <Button type="submit" size="lg" disabled={isSubmitting || items.length === 0} className="w-full sm:w-auto px-8">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing
                  </>
                ) : (
                  `Pay ${formatPrice(total)}`
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Column - Order Summary */}
      <div className="w-full border-t border-border bg-surface-muted px-4 py-8 sm:px-6 lg:w-[45%] lg:max-w-md lg:border-l lg:border-t-0 lg:px-12 xl:max-w-lg">
        <div className="sticky top-12 mx-auto max-w-2xl">
          <h2 className="font-display text-xl font-bold tracking-tight mb-6 lg:hidden">Order Summary</h2>
          
          <ul className="divide-y divide-border/50">
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
                <div className="ml-4 flex flex-1 flex-col justify-center">
                  <h3 className="text-sm font-medium">{item.product.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{item.product.condition}</p>
                </div>
                <div className="ml-4 flex items-center text-sm font-medium">
                  {formatPrice(item.product.price * item.qty)}
                </div>
              </li>
            ))}
          </ul>

          <Separator className="my-6" />

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <p>Subtotal</p>
              <p className="font-medium text-foreground">{formatPrice(subtotal)}</p>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <p>Shipping</p>
              <p className="font-medium text-foreground">{shipping > 0 ? formatPrice(shipping) : "Free"}</p>
            </div>
          </div>

          <Separator className="my-6" />

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
