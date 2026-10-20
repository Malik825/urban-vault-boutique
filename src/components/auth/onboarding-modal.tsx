import { useNavigate } from "@tanstack/react-router";
import {
  ShoppingBag,
  SlidersHorizontal,
  Crown,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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

export function BoutiqueOnboardingModal({
  isOpen,
  onOpenChange,
  user,
  redirectUrl,
}: OnboardingModalProps) {
  const navigate = useNavigate();

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
          Your account is active. Welcome to Urban Vault.
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
            Your boutique account is ready. Start shopping or set up your style preferences below.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
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
