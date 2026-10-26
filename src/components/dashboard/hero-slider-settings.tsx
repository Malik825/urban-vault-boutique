import { useState, useRef, useEffect } from "react";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_HERO_SLIDES, type HeroSlide } from "@/lib/hero";
import {
  adminGetHeroSlides,
  adminSaveHeroSlides,
  adminUploadHeroImage,
} from "@/lib/hero.functions";
import { STORE, whatsappLink } from "@/lib/store-data";

export function HeroSliderSettings() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Load current hero slides from server or storage
  useEffect(() => {
    let isMounted = true;
    adminGetHeroSlides()
      .then((data) => {
        if (isMounted) {
          if (Array.isArray(data) && data.length > 0) {
            setSlides(data);
          } else {
            setSlides(DEFAULT_HERO_SLIDES);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load hero slides:", err);
        if (isMounted) setSlides(DEFAULT_HERO_SLIDES);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Update a single property of a slide
  function updateSlide(index: number, patch: Partial<HeroSlide>) {
    setSlides((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }

  // Handle uploading an image for a specific slide
  async function handleImageFile(index: number, file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WEBP, AVIF).");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error(`${file.name} exceeds the 15 MB limit`);
      return;
    }

    setUploadingIndex(index);
    const toastId = toast.loading(`Uploading slide image "${file.name}"…`);

    try {
      let publicUrl: string | null = null;
      const ext = file.name.split(".").pop() || "webp";
      const path = `hero/hero_${Date.now()}_${Math.random().toString(36).substring(2, 6)}.${ext}`;

      // 1. Try client-side Supabase storage upload
      try {
        const { data: storageData, error: storageErr } = await supabase.storage
          .from("product-images")
          .upload(path, file, { contentType: file.type, upsert: true });

        if (!storageErr && storageData) {
          const { data: urlData } = supabase.storage
            .from("product-images")
            .getPublicUrl(path);
          publicUrl = urlData.publicUrl;
        }
      } catch {
        // Fall back to server function
      }

      // 2. Fall back to server-side upload with service role key
      if (!publicUrl) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const res = (reader.result as string) || "";
            resolve(res.split(",")[1] ?? "");
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const res = await adminUploadHeroImage({
          data: {
            base64,
            fileName: file.name,
            contentType: file.type,
          },
        });
        publicUrl = res.publicUrl;
      }

      if (publicUrl) {
        updateSlide(index, { image: publicUrl });
        toast.success(`Slide ${index + 1} image uploaded successfully!`, { id: toastId });
      } else {
        toast.error("Upload succeeded but no public URL was returned.", { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to upload slide image", { id: toastId });
    } finally {
      setUploadingIndex(null);
    }
  }

  // Move slide up/down
  function moveSlide(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;
    setSlides((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  }

  // Delete slide
  function deleteSlide(index: number) {
    if (slides.length <= 1) {
      toast.error("You must have at least one hero slide.");
      return;
    }
    const target = slides[index];
    const headline = `${target.headlineLine1} ${target.headlineHighlight}`.trim() || `Slide ${index + 1}`;
    setSlides((prev) => prev.filter((_, i) => i !== index));
    toast.info(`Removed "${headline}" from rotation`);
  }

  // Add new slide
  function addSlide() {
    const newSlide: HeroSlide = {
      id: `slide-${Date.now()}`,
      image: "/boutique/urban_vault_hero_1_1792394728170.webp",
      badge: "Exclusive Drop // Season 2026",
      headlineLine1: "NEW ARRIVAL",
      headlineHighlight: "COLLECTION.",
      subtitle:
        "Hand-picked unisex streetwear, oversized tees, and luxury silhouettes crafted for standout styling.",
      primaryCta: {
        text: "Shop Collection",
        to: "/products",
        search: {},
      },
      secondaryCta: {
        text: "WhatsApp Order",
        href: whatsappLink("Hello Urban Vault! I want to enquire about the latest collection."),
      },
      tabLabel: "New Drop",
      code: `0${slides.length + 1}`,
    };
    setSlides((prev) => [...prev, newSlide]);
    toast.success(`Added new slide (${newSlide.code})`);
  }

  // Reset to default slides
  function handleReset() {
    if (window.confirm("Reset all hero slides to the default boutique showcase?")) {
      setSlides(DEFAULT_HERO_SLIDES);
      toast.info("Hero slides reset to defaults. Click 'Save Hero Slides' to publish.");
    }
  }

  // Save changes to Supabase storage and localStorage
  async function handleSave() {
    setSaving(true);
    const toastId = toast.loading("Publishing hero slides to storefront…");

    try {
      const res = await adminSaveHeroSlides({ data: { slides } });
      if (res.ok) {
        // Broadcast custom event so storefront updates immediately if open in another tab
        if (typeof window !== "undefined") {
          localStorage.setItem("urban_vault_hero_slides", JSON.stringify(slides));
          window.dispatchEvent(
            new CustomEvent("uv-hero-slides-change", { detail: slides }),
          );
        }
        toast.success(`Published ${slides.length} hero slides live to homepage!`, { id: toastId });
      } else {
        toast.error("Failed to save slides.", { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save hero slides", { id: toastId });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading hero slider settings…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-w-0 max-w-full">
      {/* Top Banner & Action Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border border-primary/20 bg-primary/5 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm font-bold text-foreground truncate">
              Storefront Hero Carousel ({slides.length} Slide{slides.length !== 1 ? "s" : ""})
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure images, bold editorial headlines, highlighted accent words, and call-to-action buttons.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="text-xs h-8 flex-1 sm:flex-none justify-center"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1 shrink-0" /> Reset
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSlide}
            className="text-xs h-8 flex-1 sm:flex-none justify-center"
          >
            <Plus className="h-3.5 w-3.5 mr-1 shrink-0" /> Add Slide
          </Button>
          <Button
            type="button"
            variant="hero"
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="text-xs h-8 font-bold shadow-md shadow-primary/20 w-full sm:w-auto justify-center"
          >
            {saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1 shrink-0" /> Saving…
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5 mr-1 shrink-0" /> Save Hero Slides
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Slide Cards List */}
      <div className="space-y-5 min-w-0">
        {slides.map((slide, index) => {
          const isUploading = uploadingIndex === index;
          return (
            <div
              key={slide.id || index}
              className="rounded-2xl border border-border bg-card p-3.5 sm:p-5 shadow-xs transition-all hover:border-primary/40 space-y-4 min-w-0 max-w-full overflow-hidden"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-border/60 min-w-0">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-mono font-bold text-primary">
                    0{index + 1}
                  </span>
                  <span className="text-sm font-bold text-foreground truncate min-w-0">
                    {slide.headlineLine1 || "Slide"}{" "}
                    <span className="text-primary">{slide.headlineHighlight}</span>
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    title="Move up"
                    disabled={index === 0}
                    onClick={() => moveSlide(index, "up")}
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    title="Move down"
                    disabled={index === slides.length - 1}
                    onClick={() => moveSlide(index, "down")}
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                    title="Delete slide"
                    disabled={slides.length <= 1}
                    onClick={() => deleteSlide(index)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Main Grid: Left Image preview/upload | Right Fields */}
              <div className="grid gap-5 md:grid-cols-12 min-w-0">
                {/* Left Column: Image Area */}
                <div className="md:col-span-5 space-y-2.5 min-w-0">
                  <Label className="text-xs font-semibold flex items-center justify-between">
                    <span>Slide Image</span>
                    {slide.image && (
                      <span className="text-[10px] text-primary flex items-center gap-1 font-normal">
                        <CheckCircle2 className="h-3 w-3" /> Configured
                      </span>
                    )}
                  </Label>

                  {/* Image Preview Box */}
                  <div
                    className="group relative aspect-[4/3] rounded-xl border border-border bg-[#1a1714] overflow-hidden cursor-pointer"
                    onClick={() => fileInputRefs.current[index]?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files[0];
                      if (file) handleImageFile(index, file);
                    }}
                  >
                    <img
                      src={slide.image}
                      alt={`Hero slide ${index + 1}`}
                      className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-4 text-center">
                      {isUploading ? (
                        <>
                          <Loader2 className="h-7 w-7 text-white animate-spin" />
                          <span className="text-xs text-white font-medium">Uploading…</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="h-7 w-7 text-white" />
                          <span className="text-xs font-semibold text-white">
                            Click or drag to replace image
                          </span>
                          <span className="text-[10px] text-white/70">
                            Recommended: High-res portrait or 4:3 / 16:9
                          </span>
                        </>
                      )}
                    </div>

                    <input
                      ref={(el) => (fileInputRefs.current[index] = el)}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageFile(index, file);
                      }}
                    />
                  </div>

                  {/* Direct Image URL input */}
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">
                      Or paste direct image URL / path
                    </Label>
                    <Input
                      value={slide.image}
                      onChange={(e) => updateSlide(index, { image: e.target.value })}
                      placeholder="/boutique/hero.webp or https://..."
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Right Column: Slide Content */}
                <div className="md:col-span-7 space-y-3.5 min-w-0">
                  {/* Category / Badge */}
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">
                      Category Badge (Top Label)
                    </Label>
                    <Input
                      value={slide.badge}
                      onChange={(e) => updateSlide(index, { badge: e.target.value })}
                      placeholder="e.g. Season 2026 // Streetwear Drop"
                      className="h-8 text-xs"
                    />
                  </div>

                  {/* Headline Line 1 & Highlight Word */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">
                        Headline Line 1
                      </Label>
                      <Input
                        value={slide.headlineLine1}
                        onChange={(e) =>
                          updateSlide(index, { headlineLine1: e.target.value })
                        }
                        placeholder="e.g. DRESS THE"
                        className="h-8 text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-primary">
                        Accent / Highlight Word
                      </Label>
                      <Input
                        value={slide.headlineHighlight}
                        onChange={(e) =>
                          updateSlide(index, { headlineHighlight: e.target.value })
                        }
                        placeholder="e.g. CULTURE."
                        className="h-8 text-xs font-bold text-primary"
                      />
                    </div>
                  </div>

                  {/* Subtitle */}
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">
                      Subtitle / Editorial Description
                    </Label>
                    <Textarea
                      rows={2}
                      value={slide.subtitle}
                      onChange={(e) => updateSlide(index, { subtitle: e.target.value })}
                      placeholder="Brief luxury description of this drop or silhouette…"
                      className="text-xs"
                    />
                  </div>

                  {/* Primary CTA */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">
                        Primary Button Label
                      </Label>
                      <Input
                        value={slide.primaryCta?.text || ""}
                        onChange={(e) =>
                          updateSlide(index, {
                            primaryCta: {
                              ...slide.primaryCta,
                              text: e.target.value,
                              to: slide.primaryCta?.to || "/products",
                            },
                          })
                        }
                        placeholder="e.g. Shop New Drop"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">
                        Primary Button Link
                      </Label>
                      <Input
                        value={slide.primaryCta?.to || ""}
                        onChange={(e) =>
                          updateSlide(index, {
                            primaryCta: {
                              ...slide.primaryCta,
                              to: e.target.value,
                              text: slide.primaryCta?.text || "Shop Now",
                            },
                          })
                        }
                        placeholder="e.g. /products"
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Secondary CTA */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">
                        Secondary Button Label
                      </Label>
                      <Input
                        value={slide.secondaryCta?.text || ""}
                        onChange={(e) =>
                          updateSlide(index, {
                            secondaryCta: {
                              ...slide.secondaryCta,
                              text: e.target.value,
                              href: slide.secondaryCta?.href || "#",
                            },
                          })
                        }
                        placeholder="e.g. WhatsApp Concierge"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">
                        Secondary Button Link / WhatsApp
                      </Label>
                      <Input
                        value={slide.secondaryCta?.href || ""}
                        onChange={(e) =>
                          updateSlide(index, {
                            secondaryCta: {
                              ...slide.secondaryCta,
                              href: e.target.value,
                              text: slide.secondaryCta?.text || "WhatsApp",
                            },
                          })
                        }
                        placeholder="https://wa.me/233597489841..."
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Save Reminder */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 min-w-0">
        <p className="text-xs text-muted-foreground">
          Tip: Hit <span className="font-semibold text-foreground">Save Hero Slides</span> to immediately broadcast your changes to the live storefront homepage.
        </p>
        <Button
          type="button"
          variant="hero"
          onClick={handleSave}
          disabled={saving}
          className="font-bold text-xs h-9 px-5 w-full sm:w-auto shrink-0 justify-center"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> Saving…
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-1.5" /> Save Hero Slides
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
