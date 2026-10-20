import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Sparkles,
  Gift,
  Copy,
  Check,
  ArrowRight,
  ShoppingBag,
  User,
  Heart,
  Crown,
  Truck,
  MessageCircle,
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
import { STORE } from "@/lib/store-data";
import { serverSaveOnboardingPreferences } from "@/lib/auth.functions";

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

const STYLE_AESTHETICS = [
  { id: "streetwear", label: "Streetwear & Heavyweight Tees", emoji: "🕶️" },
  { id: "linen", label: "Cuban Linen & Kaftans", emoji: "👔" },
  { id: "denim", label: "Vintage Denim & Cargos", emoji: "👖" },
  { id: "sneakers", label: "Designer Footwear & Kicks", emoji: "👟" },
  { id: "luxury", label: "Minimalist High Fashion", emoji: "✨" },
];

const TOP_SIZES = ["S", "M", "L", "XL", "XXL"];
const SHOE_SIZES = ["EU 40", "EU 41", "EU 42", "EU 43", "EU 44", "EU 45"];
const DEPARTMENTS = ["Unisex / All", "Men's Collection", "Women's Collection"];

export function BoutiqueOnboardingModal({
  isOpen,
  onOpenChange,
  user,
  redirectUrl,
}: OnboardingModalProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);

  // Preference states
  const [selectedStyles, setSelectedStyles] = useState<string[]>([
    "streetwear",
    "sneakers",
  ]);
  const [selectedTopSize, setSelectedTopSize] = useState<string>("L");
  const [selectedShoeSize, setSelectedShoeSize] = useState<string>("EU 42");
  const [selectedDept, setSelectedDept] = useState<string>("Unisex / All");

  const promoCode = "VAULTVIP10";

  const handleCopyCode = () => {
    navigator.clipboard.writeText(promoCode);
    setCopiedCode(true);
    toast.success("Promo code VAULTVIP10 copied to clipboard!");
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const toggleStyle = (id: string) => {
    setSelectedStyles((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleFinish = async (targetRoute?: string) => {
    const destination = targetRoute || redirectUrl || "/products";
    try {
      const preferences = {
        styles: selectedStyles,
        topSize: selectedTopSize,
        shoeSize: selectedShoeSize,
        department: selectedDept,
        promoCode,
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("urban-vault-preferences", JSON.stringify(preferences));
      }

      await serverSaveOnboardingPreferences({
        data: {
          userId: user.id,
          preferences,
        },
      });
    } catch (e) {
      console.warn("Could not save onboarding preferences to server:", e);
    } finally {
      onOpenChange(false);
      navigate({ to: destination as any });
    }
  };

  const displayName = user.fullName || user.email.split("@")[0] || "Valued Guest";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl rounded-3xl">
        {/* Hidden titles for accessibility */}
        <DialogTitle className="sr-only">Urban Vault Member Onboarding</DialogTitle>
        <DialogDescription className="sr-only">
          Welcome to Urban Vault VIP Club. Customize your sizing and unlock your welcome discount.
        </DialogDescription>

        {/* Top Header / Progress Indicator */}
        <div className="relative bg-brand-dark p-6 text-white border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-7 w-7 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
                <Crown className="h-4 w-4" />
              </span>
              <span className="font-display text-sm font-extrabold tracking-wide uppercase text-primary">
                Urban Vault VIP Club
              </span>
            </div>

            {/* Stepper Dots */}
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    s === step
                      ? "w-6 bg-primary"
                      : s < step
                      ? "w-2 bg-primary/70"
                      : "w-2 bg-white/20"
                  }`}
                />
              ))}
            </div>
          </div>

          <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-white">
            {step === 0 && `Welcome to the Vault, ${displayName}!`}
            {step === 1 && "Personalize Your Curated Fits"}
            {step === 2 && "VIP Membership Activated"}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-300">
            {step === 0 && "Your account is verified. Enjoy your exclusive welcome gift."}
            {step === 1 && "Tell us your aesthetic and sizing for personalized recommendations."}
            {step === 2 && "Your 10% discount and VIP perks are ready to use."}
          </p>
        </div>

        {/* Step Contents */}
        <div className="p-6">
          {/* ── STEP 0: WELCOME & PROMO GIFT ── */}
          {step === 0 && (
            <div className="space-y-6">
              {/* VIP Welcome Voucher Card */}
              <div className="relative rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-background to-primary/5 p-5 shadow-inner">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <Badge className="bg-primary text-primary-foreground font-semibold text-[11px] px-2.5 py-0.5">
                      <Gift className="h-3 w-3 mr-1" /> Welcome Gift
                    </Badge>
                    <h3 className="font-display text-lg font-bold text-foreground mt-2">
                      10% OFF Your First Order
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Use code <span className="font-bold text-foreground">{promoCode}</span> at checkout for an instant 10% discount on clothing, accessories, and shoes.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="shrink-0 flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 hover:bg-primary/20 px-3.5 py-2 text-xs font-semibold text-primary transition-colors shadow-xs"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="h-3.5 w-3.5" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" /> Copy Code
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-4 pt-3 border-t border-border/50 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Truck className="h-3.5 w-3.5 text-primary" />
                    <span>Free Accra delivery over GH₵ 500</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-3.5 w-3.5 text-primary" />
                    <span>VIP WhatsApp Concierge</span>
                  </div>
                </div>
              </div>

              {/* What You Get Highlights */}
              <div className="space-y-2.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  What you unlock as an Urban Vault VIP:
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="flex items-center gap-2.5 rounded-xl border border-border p-3 text-xs bg-muted/30">
                    <Sparkles className="h-4 w-4 text-primary shrink-0" />
                    <span>Early drop alerts on new weekly lookbooks</span>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-xl border border-border p-3 text-xs bg-muted/30">
                    <Heart className="h-4 w-4 text-primary shrink-0" />
                    <span>Save your favorite grails in your Wishlist</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFinish("/products")}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Skip for now
                </Button>
                <Button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 shadow-md"
                >
                  Personalize Fits <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </div>
            </div>
          )}

          {/* ── STEP 1: STYLE & SIZING PREFERENCES ── */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Style Aesthetic Selector */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                  1. Select your favorite styles
                </label>
                <div className="flex flex-wrap gap-2">
                  {STYLE_AESTHETICS.map((style) => {
                    const isSelected = selectedStyles.includes(style.id);
                    return (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => toggleStyle(style.id)}
                        className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                          isSelected
                            ? "bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/20"
                            : "bg-muted/40 hover:bg-muted border border-border text-foreground"
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

              {/* Top & Shoe Sizing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                    2. Preferred Top Size
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {TOP_SIZES.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedTopSize(size)}
                        className={`h-9 w-11 rounded-lg text-xs font-bold transition-all ${
                          selectedTopSize === size
                            ? "bg-primary text-primary-foreground shadow-xs"
                            : "bg-muted/40 hover:bg-muted border border-border text-muted-foreground"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                    3. Footwear Size
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {SHOE_SIZES.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedShoeSize(size)}
                        className={`h-9 px-2.5 rounded-lg text-xs font-bold transition-all ${
                          selectedShoeSize === size
                            ? "bg-primary text-primary-foreground shadow-xs"
                            : "bg-muted/40 hover:bg-muted border border-border text-muted-foreground"
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
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                  4. Preferred Section
                </label>
                <div className="flex flex-wrap gap-2">
                  {DEPARTMENTS.map((dept) => (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => setSelectedDept(dept)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                        selectedDept === dept
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "bg-muted/40 hover:bg-muted border border-border text-muted-foreground"
                      }`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep(0)}
                  className="text-xs"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 shadow-md"
                >
                  Save & Complete <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </div>
            </div>
          )}

          {/* ── STEP 2: SUMMARY & READY TO SHOP ── */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Digital VIP Membership Pass */}
              <div className="relative rounded-2xl bg-brand-dark border border-primary/40 p-5 text-white shadow-xl overflow-hidden">
                <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-primary/10 blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between text-xs text-primary font-semibold uppercase tracking-wider">
                  <span>VIP Pass — Urban Vault</span>
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Active Member
                  </span>
                </div>

                <div className="mt-4">
                  <p className="font-display text-xl font-extrabold tracking-tight text-white">
                    {displayName}
                  </p>
                  <p className="text-xs text-white/70">{user.email}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Sizes</span>
                    <span className="font-semibold text-white">
                      Top: {selectedTopSize} · Shoe: {selectedShoeSize}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Welcome Code</span>
                    <span className="font-bold text-primary">{promoCode} (10% OFF)</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                {redirectUrl ? (
                  <>
                    <Button
                      type="button"
                      size="lg"
                      onClick={() => handleFinish(redirectUrl)}
                      className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 shadow-lg flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      {redirectUrl.startsWith("/checkout")
                        ? "Continue to Checkout (10% Discount Applied)"
                        : "Continue to Your Destination"}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => handleFinish("/account")}
                      className="w-full rounded-xl border-border py-3 flex items-center justify-center gap-2 text-foreground font-semibold"
                    >
                      <User className="h-4 w-4" /> Go to My Customer Account
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      type="button"
                      size="lg"
                      onClick={() => handleFinish("/products")}
                      className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 shadow-lg flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="h-4 w-4" /> Start Shopping Curated Pieces
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => handleFinish("/account")}
                      className="w-full rounded-xl border-border py-3 flex items-center justify-center gap-2 text-foreground font-semibold"
                    >
                      <User className="h-4 w-4" /> Go to My Customer Account
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
