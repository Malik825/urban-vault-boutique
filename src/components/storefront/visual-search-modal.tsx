import { useState, useRef } from "react";
import { Link } from "@tanstack/react-router";
import {
  Camera,
  UploadCloud,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  MessageCircle,
  CheckCircle2,
  X,
  Search,
  Loader2,
  ArrowRight,
  Layers,
  HelpCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatPrice, STORE } from "@/lib/store-data";
import { useCart } from "@/lib/cart";
import {
  searchSimilarProducts,
  submitSourcingRequest,
  type VisualMatchResult,
  type VisualAnalysis,
} from "@/lib/visual-search.functions";

interface VisualSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SAMPLE_INSPIRATIONS = [
  { label: "Oversized Vintage Tee", hint: "Tops & Shirts", icon: "👕" },
  { label: "Retro Chunky Dunks", hint: "Footwear & Sneakers", icon: "👟" },
  { label: "Cuban Linen Shirt", hint: "Tops & Shirts", icon: "👔" },
  { label: "Utility Cargo Pants", hint: "Bottoms & Shorts", icon: "👖" },
  { label: "Streetwear Hoodie", hint: "Luxury Hoodies & Sweats", icon: "🧥" },
];

export function VisualSearchModal({ open, onOpenChange }: VisualSearchModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { addItem } = useCart();

  const [activeTab, setActiveTab] = useState<"search" | "sourcing">("search");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState("");
  const [matches, setMatches] = useState<VisualMatchResult[]>([]);
  const [analysis, setAnalysis] = useState<VisualAnalysis | null>(null);

  // Sourcing form state
  const [customerName, setCustomerName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [preferredSize, setPreferredSize] = useState("");
  const [budget, setBudget] = useState("");
  const [notes, setNotes] = useState("");
  const [submittingSourcing, setSubmittingSourcing] = useState(false);

  function resetState() {
    setSelectedImage(null);
    setIsScanning(false);
    setScanStep("");
    setMatches([]);
    setAnalysis(null);
    setActiveTab("search");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  }

  function handleFileSelect(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPG, PNG, or WebP)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image file is too large (max 10 MB)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = (e.target?.result as string) || "";
      setSelectedImage(base64);
      triggerScan(base64);
    };
    reader.readAsDataURL(file);
  }

function extractDominantColorsFromImage(base64: string): Promise<string[]> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve([]);
        const size = 48;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);
        const imgData = ctx.getImageData(0, 0, size, size).data;

        const buckets: Record<string, number> = {
          Black: 0,
          White: 0,
          Grey: 0,
          Blue: 0,
          Green: 0,
          Brown: 0,
          Red: 0,
          Yellow: 0,
        };

        for (let i = 0; i < imgData.length; i += 16) {
          const r = imgData[i] ?? 0;
          const g = imgData[i + 1] ?? 0;
          const b = imgData[i + 2] ?? 0;
          const a = imgData[i + 3] ?? 255;
          if (a < 128) continue;

          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const delta = max - min;
          const lightness = (max + min) / (2 * 255);

          if (lightness < 0.2) {
            buckets.Black = (buckets.Black || 0) + 1;
          } else if (lightness > 0.85 && delta < 25) {
            buckets.White = (buckets.White || 0) + 1;
          } else if (delta < 20) {
            buckets.Grey = (buckets.Grey || 0) + 1;
          } else {
            if (r > g && r > b) {
              if (g > b && r - g < 40) buckets.Brown = (buckets.Brown || 0) + 1;
              else buckets.Red = (buckets.Red || 0) + 1;
            } else if (g > r && g > b) {
              buckets.Green = (buckets.Green || 0) + 1;
            } else if (b > r && b > g) {
              buckets.Blue = (buckets.Blue || 0) + 1;
            } else {
              buckets.Brown = (buckets.Brown || 0) + 1;
            }
          }
        }

        const sorted = Object.entries(buckets)
          .sort((a, b) => b[1] - a[1])
          .filter((entry) => entry[1] > 4)
          .map((entry) => entry[0]);

        resolve(sorted.slice(0, 2));
      };
      img.onerror = () => resolve([]);
      img.src = base64;
    } catch {
      resolve([]);
    }
  });
}

  async function triggerScan(base64: string, hintCategory?: string) {
    setIsScanning(true);
    setMatches([]);
    setAnalysis(null);

    setScanStep("Analyzing garment silhouette & cut…");
    const t1 = setTimeout(() => setScanStep("Detecting color palette & style markers…"), 600);
    const t2 = setTimeout(() => setScanStep("Searching Urban Vault boutique catalogue…"), 1200);

    try {
      const extractedColors = await extractDominantColorsFromImage(base64);

      const res = await searchSimilarProducts({
        data: {
          imageBase64: base64,
          hintCategory,
          clientDetectedColors: extractedColors,
        },
      });

      setMatches(res.matches);
      setAnalysis(res.analysis);
      toast.success(
        res.matches.length > 0
          ? `Found ${res.matches.length} matching boutique items!`
          : "Photo analyzed — check out the closest matches.",
      );
    } catch (err: any) {
      console.error("[VisualSearch] Error:", err);
      toast.error(err?.message || "Failed to search catalogue with photo.");
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      setIsScanning(false);
      setScanStep("");
    }
  }

  function handleTryInspiration(hint: string) {
    // Generate a placeholder SVG data URL representing the selected silhouette
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="100%" height="100%" fill="#18181b"/><text x="50%" y="45%" font-family="sans-serif" font-size="20" fill="#f43f5e" text-anchor="middle" font-weight="bold">${hint}</text><text x="50%" y="55%" font-family="sans-serif" font-size="13" fill="#a1a1aa" text-anchor="middle">Urban Vault Visual Inspiration</text></svg>`;
    const base64 = `data:image/svg+xml;base64,${btoa(svg)}`;
    setSelectedImage(base64);
    triggerScan(base64, hint);
  }

  async function handleSourcingSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!whatsappNumber.trim()) {
      toast.error("Please enter your WhatsApp number");
      return;
    }

    setSubmittingSourcing(true);
    try {
      const res = await submitSourcingRequest({
        data: {
          customerName: customerName.trim() || "Valued Customer",
          whatsappNumber: whatsappNumber.trim(),
          preferredSize: preferredSize.trim() || undefined,
          budget: budget.trim() || undefined,
          notes: notes.trim() || undefined,
          imageBase64: selectedImage || undefined,
        },
      });

      toast.success("Sourcing request logged! Opening WhatsApp concierge…");
      // Launch WhatsApp chat
      window.open(res.whatsappUrl, "_blank", "noopener,noreferrer");
      onOpenChange(false);
      resetState();
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit sourcing request");
    } finally {
      setSubmittingSourcing(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) resetState();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-2xl sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl sm:rounded-3xl border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl">
        <DialogHeader className="p-4 sm:p-6 pb-2 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
                <Camera className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="font-display text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
                  Snap &amp; Find Similar
                  <Badge variant="outline" className="border-primary/30 text-primary text-[10px] uppercase font-bold py-0.5">
                    AI Visual Search
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Upload any photo from Instagram, Pinterest, or your gallery to match our boutique collection.
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as any)}
            className="w-full mt-3"
          >
            <TabsList className="grid w-full grid-cols-2 rounded-xl bg-muted/70 p-1">
              <TabsTrigger
                value="search"
                className="rounded-lg text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary" />
                Find in Store
              </TabsTrigger>
              <TabsTrigger
                value="sourcing"
                className="rounded-lg text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
              >
                <MessageCircle className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
                Sourcing Concierge
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </DialogHeader>

        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFileSelect(f);
          }}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFileSelect(f);
          }}
        />

        <div className="p-4 sm:p-6 pt-3">
          {activeTab === "search" ? (
            <div className="space-y-5">
              {/* Photo Upload Area */}
              {!selectedImage ? (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const f = e.dataTransfer.files?.[0];
                    if (f) handleFileSelect(f);
                  }}
                  className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border hover:border-primary/60 bg-muted/20 hover:bg-muted/40 p-6 sm:p-8 text-center transition-all cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-3.5 group-hover:scale-110 transition-transform">
                    <UploadCloud className="h-7 w-7" />
                  </div>
                  <h4 className="font-semibold text-sm sm:text-base text-foreground mb-1">
                    Drop a photo here or click to browse
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-sm mb-4">
                    Take a snapshot of clothing, sneakers, or street style to find exact or similar items in our boutique.
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      className="rounded-full text-xs font-semibold px-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      <UploadCloud className="h-3.5 w-3.5 mr-1.5" />
                      Upload Photo
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-full text-xs font-semibold px-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        cameraInputRef.current?.click();
                      }}
                    >
                      <Camera className="h-3.5 w-3.5 mr-1.5" />
                      Take Photo
                    </Button>
                  </div>
                </div>
              ) : (
                /* Selected Photo & Scanning HUD */
                <div className="relative rounded-2xl border border-border/70 bg-card overflow-hidden p-4">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative h-32 w-32 shrink-0 rounded-xl overflow-hidden border border-border bg-black/80">
                      <img
                        src={selectedImage}
                        alt="Uploaded garment"
                        className="h-full w-full object-cover"
                      />

                      {/* Animated Laser Scanning Line */}
                      {isScanning && (
                        <motion.div
                          initial={{ top: "0%" }}
                          animate={{ top: "100%" }}
                          transition={{
                            repeat: Infinity,
                            duration: 1.2,
                            ease: "linear",
                            repeatType: "reverse",
                          }}
                          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_12px_rgba(244,63,94,0.9)]"
                        />
                      )}
                    </div>

                    <div className="flex-1 text-center sm:text-left min-w-0">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
                        <Badge variant="secondary" className="text-[11px] font-semibold">
                          {isScanning ? "Scanning garment…" : "Photo analyzed"}
                        </Badge>
                        {analysis && (
                          <Badge variant="outline" className="border-primary/40 text-primary text-[11px] font-semibold">
                            {analysis.detectedCategory}
                          </Badge>
                        )}
                      </div>

                      {isScanning ? (
                        <p className="text-xs text-primary font-medium flex items-center justify-center sm:justify-start gap-1.5 animate-pulse">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          {scanStep || "Analyzing your style…"}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {analysis
                            ? `Identified ${analysis.itemType} in ${analysis.colors.join(", ")} palette.`
                            : "Showing the closest items matching your photo."}
                        </p>
                      )}

                      <div className="mt-2.5 flex items-center justify-center sm:justify-start gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs rounded-full px-3"
                          onClick={() => {
                            resetState();
                            fileInputRef.current?.click();
                          }}
                        >
                          Change Photo
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs rounded-full text-muted-foreground hover:text-foreground"
                          onClick={resetState}
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sample Inspiration Chips (Shown when no image is uploaded yet) */}
              {!selectedImage && (
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Or test with popular streetwear vibes
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SAMPLE_INSPIRATIONS.map((sample) => (
                      <button
                        key={sample.label}
                        type="button"
                        onClick={() => handleTryInspiration(sample.hint)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/40 hover:bg-muted px-3 py-1.5 text-xs text-foreground font-medium transition-all hover:scale-102 hover:border-primary/40"
                      >
                        <span>{sample.icon}</span>
                        <span>{sample.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Products Grid */}
              {matches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-display text-sm font-bold text-foreground flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Closest Matches in Store ({matches.length})
                    </h4>
                    <span className="text-[11px] text-muted-foreground">Ranked by visual similarity</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {matches.map(({ product, score, matchReason }) => {
                      const imageSrc =
                        Array.isArray(product.images) && product.images[0]
                          ? product.images[0]
                          : "/placeholder.svg";

                      return (
                        <div
                          key={product.id}
                          className="group relative flex flex-col justify-between rounded-xl border border-border bg-card overflow-hidden hover:border-primary/50 transition-all duration-200 hover:shadow-md"
                        >
                          <div className="relative aspect-square overflow-hidden bg-muted">
                            <img
                              src={imageSrc}
                              alt={product.name}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              loading="lazy"
                            />
                            {/* Similarity Badge */}
                            <div className="absolute top-1.5 left-1.5">
                              <span className="inline-flex items-center rounded-md bg-black/75 backdrop-blur-xs px-1.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                                {score}% Match
                              </span>
                            </div>
                          </div>

                          <div className="p-2.5 flex-1 flex flex-col justify-between">
                            <div>
                              <p className="text-[10px] uppercase font-semibold text-muted-foreground truncate">
                                {product.brand}
                              </p>
                              <h5 className="font-medium text-xs text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                {product.name}
                              </h5>
                              <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                                {matchReason}
                              </p>
                            </div>

                            <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between gap-1">
                              <span className="font-bold text-xs text-foreground">
                                {formatPrice(product.price)}
                              </span>
                              <div className="flex items-center gap-1">
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6 rounded-md hover:bg-primary hover:text-white"
                                  title="Add to cart"
                                  onClick={() => {
                                    addItem(product as any, 1);
                                    toast.success(`Added ${product.name} to cart!`);
                                  }}
                                >
                                  <ShoppingBag className="h-3 w-3" />
                                </Button>
                                <Link
                                  to="/product/$slug"
                                  params={{ slug: product.slug }}
                                  onClick={() => onOpenChange(false)}
                                  className="h-6 w-6 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
                                  title="View product"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sourcing Bridge Callout */}
              {selectedImage && !isScanning && (
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-center sm:text-left">
                    <h5 className="font-semibold text-xs sm:text-sm text-foreground flex items-center justify-center sm:justify-start gap-1.5">
                      <HelpCircle className="h-4 w-4 text-primary" />
                      Can't find the exact piece you're looking for?
                    </h5>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Our styling team can source this item directly for you in Ghana.
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="rounded-full text-xs font-semibold px-4 shrink-0 bg-primary hover:bg-primary/90 text-white"
                    onClick={() => setActiveTab("sourcing")}
                  >
                    Request Sourcing
                    <ArrowRight className="h-3 w-3 ml-1.5" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            /* Boutique Sourcing Concierge Form */
            <form onSubmit={handleSourcingSubmit} className="space-y-4">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <div className="text-xs">
                  <p className="font-semibold text-foreground">
                    Direct VIP WhatsApp Concierge Sourcing
                  </p>
                  <p className="text-muted-foreground mt-0.5">
                    Submit your photo and details. We will check our designer warehouse and notify you instantly on WhatsApp with availability &amp; pricing.
                  </p>
                </div>
              </div>

              {selectedImage && (
                <div className="flex items-center gap-3 p-2.5 rounded-xl border border-border bg-muted/30">
                  <img
                    src={selectedImage}
                    alt="Sourcing garment"
                    className="h-14 w-14 rounded-lg object-cover border border-border shrink-0"
                  />
                  <div className="text-xs min-w-0">
                    <p className="font-semibold text-foreground truncate">Reference Photo Attached</p>
                    <p className="text-muted-foreground text-[11px]">
                      Will be included in your WhatsApp request
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="customerName" className="text-xs font-medium">
                    Your Name
                  </Label>
                  <Input
                    id="customerName"
                    placeholder="e.g. Kwame or Sarah"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="mt-1 h-9 text-xs rounded-xl"
                  />
                </div>

                <div>
                  <Label htmlFor="whatsapp" className="text-xs font-medium">
                    WhatsApp Number <span className="text-primary">*</span>
                  </Label>
                  <Input
                    id="whatsapp"
                    placeholder="e.g. 055 475 3212"
                    required
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="mt-1 h-9 text-xs rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="prefSize" className="text-xs font-medium">
                    Preferred Size
                  </Label>
                  <Input
                    id="prefSize"
                    placeholder="e.g. L, XL, or EU 43"
                    value={preferredSize}
                    onChange={(e) => setPreferredSize(e.target.value)}
                    className="mt-1 h-9 text-xs rounded-xl"
                  />
                </div>

                <div>
                  <Label htmlFor="budget" className="text-xs font-medium">
                    Target Budget (GH₵)
                  </Label>
                  <Input
                    id="budget"
                    placeholder="e.g. 250 - 400"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="mt-1 h-9 text-xs rounded-xl"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="sourcingNotes" className="text-xs font-medium">
                  Additional Notes / Specific Color Preferences
                </Label>
                <textarea
                  id="sourcingNotes"
                  rows={2}
                  placeholder="e.g. I prefer heavyweight vintage cotton, preferably in faded black or grey."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-input bg-background p-2.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-xs"
                  onClick={() => setActiveTab("search")}
                >
                  Back to Search
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submittingSourcing}
                  className="rounded-full text-xs font-semibold px-5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                >
                  {submittingSourcing ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                      Send &amp; Chat on WhatsApp
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
