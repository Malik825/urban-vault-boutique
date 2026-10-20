import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Gift,
  Copy,
  Check,
  ShoppingBag,
  SlidersHorizontal,
  Truck,
  MessageCircle,
  Crown,
} from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface OnboardingModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    email: string;
    fullName?: string | undefined;
  };
  redirectUrl?: string | undefined;
}

export const PROMO_WELCOME_CODE = "VAULTVIP10";

export function BoutiqueOnboardingModal({
  isOpen,
  onOpenChange,
  user,
  redirectUrl,
}: OnboardingModalProps) {
  const navigate = useNavigate();
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(PROMO_WELCOME_CODE);
    setCopiedCode(true);
    toast.success(`Promo code ${PROMO_WELCOME_CODE} copied to clipboard!`);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleDismiss = (destination?: string) => {
    onOpenChange(false);
    const target = destination || redirectUrl || "/products";
    navigate({ to: target as any });
  };

  const displayName = user.fullName || user.email.split("@")[0] || "Valued Member";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-border/80 bg-background shadow-2xl rounded-2xl">
        <DialogTitle className="sr-only">Welcome to Urban Vault VIP</DialogTitle>
        <DialogDescription className="sr-only">
          Your account is active. Enjoy your 10% welcome discount.
        </DialogDescription>

        {/* Clean Header */}
        <div className="relative bg-card p-6 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-7 w-7 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center text-primary">
              <Crown className="h-4 w-4" />
            </span>
            <span className="font-mono text-xs font-semibold tracking-widest uppercase text-primary">
              Urban Vault VIP Club
            </span>
          </div>

          <h2 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
            Welcome to the Vault, {displayName}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your boutique account is ready. Here is an exclusive welcome gift to celebrate your first drop.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* 10% Welcome Gift Card */}
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <Badge className="bg-primary text-primary-foreground font-semibold text-[11px] px-2.5 py-0.5">
                  <Gift className="h-3 w-3 mr-1" /> Welcome Voucher
                </Badge>
                <h3 className="font-display text-lg font-bold text-foreground mt-2">
                  10% OFF Your First Order
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Apply voucher <strong className="font-mono text-foreground font-bold">{PROMO_WELCOME_CODE}</strong> at checkout for 10% off apparel, sneakers, and accessories.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyCode}
                className="shrink-0 rounded-lg border-primary/30 bg-background hover:bg-primary/10 text-primary font-semibold text-xs"
              >
                {copiedCode ? (
                  <>
                    <Check className="h-3.5 w-3.5 mr-1" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 mr-1" /> Copy Code
                  </>
                )}
              </Button>
            </div>

            <div className="mt-4 pt-3 border-t border-border/60 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-primary" />
                <span>Free delivery &gt; GH₵ 500</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MessageCircle className="h-3.5 w-3.5 text-primary" />
                <span>WhatsApp VIP Support</span>
              </div>
            </div>
          </div>

          {/* Quick Note about Account Customization */}
          <div className="rounded-xl border border-border bg-surface-muted/40 p-3.5 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <SlidersHorizontal className="h-4 w-4 text-primary shrink-0" />
              <span>You can configure your sizes, footwear fit &amp; aesthetics in your Account.</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch gap-2.5 pt-2">
            <Button
              type="button"
              size="lg"
              onClick={() => handleDismiss(redirectUrl || "/products")}
              className="flex-1 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-sm"
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              {redirectUrl?.startsWith("/checkout") ? "Continue to Checkout" : "Start Shopping"}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => handleDismiss("/account")}
              className="rounded-xl border-border hover:bg-surface-muted text-foreground font-semibold"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Customize in Account
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
