import { useState, useRef } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, ImagePlus, ArrowLeft, ArrowRight, Plus, Star, UploadCloud, Loader2 } from "lucide-react";
import { SortableImageGrid } from "@/components/dashboard/sortable-image-grid";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { adminGetProduct, adminUpdateProduct, adminUploadProductImage } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES_TAXONOMY, DEPARTMENTS } from "@/lib/store-data";
import { useDynamicCategories } from "@/lib/categories";
import { QuickAddCategoryDialog } from "@/components/dashboard/quick-add-category-dialog";

export const Route = createFileRoute("/_authenticated/dashboard/product/$id/edit")({
  head: () => ({
    meta: [{ title: "Edit Boutique Product — Urban Vault Admin" }],
  }),
  loader: async ({ params }) => {
    try {
      return await adminGetProduct({ data: { id: params.id } });
    } catch (e) {
      console.error("[EditProductLoader] Error:", e);
      throw e;
    }
  },
  component: EditProduct,
});

const steps = [
  "General",
  "Apparel Imagery",
  "Fashion Specs",
  "Pricing & Badges",
  "Inventory",
  "SEO & Handle",
  "Preview",
];

const BOUTIQUE_BRANDS = [
  "Urban Vault Co.",
  "Zara",
  "Daily Paper",
  "H&M",
  "Represent Clo",
  "Casablanca",
  "Nike Sportswear",
  "Essentials FOG",
  "Asante Tailors",
  "Custom / In-House",
];

const BOUTIQUE_CONDITIONS = [
  "Brand New",
  "New Season",
  "Limited Edition",
  "Exclusive Release",
  "Pre-Order",
];

const BOUTIQUE_BADGES = [
  "None",
  "Trending",
  "Best seller",
  "New",
  "-10%",
  "-15%",
  "-20%",
  "-25%",
  "Exclusive",
  "Flash deal",
];

export function EditProduct() {
  const product = Route.useLoaderData();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const { categories: dynamicCategories } = useDynamicCategories();
  const [quickCatOpen, setQuickCatOpen] = useState(false);

  const [imageUrlInput, setImageUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);

  const handleImageFilesUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const remainingSlots = 5 - formData.images.length;
    if (remainingSlots <= 0) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    const filesToUpload = Array.from(fileList).slice(0, remainingSlots);
    setIsUploadingFiles(true);
    const toastId = toast.loading(`Uploading ${filesToUpload.length} image(s)...`);

    try {
      const uploadedUrls: string[] = [];

      for (const file of filesToUpload) {
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not a valid image format`);
          continue;
        }

        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} exceeds 10 MB limit`);
          continue;
        }

        let publicUrl: string | null = null;
        const ext = file.name.split(".").pop() || "jpg";
        const cleanName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
        const filePath = `products/${cleanName}`;

        // 1. Try client-side Supabase storage upload
        try {
          const { data: storageData, error: storageErr } = await supabase.storage
            .from("product-images")
            .upload(filePath, file, { contentType: file.type, upsert: true });

          if (!storageErr && storageData) {
            const { data: urlData } = supabase.storage
              .from("product-images")
              .getPublicUrl(filePath);
            publicUrl = urlData.publicUrl;
          }
        } catch {
          // Ignore and try server fallback
        }

        // 2. Fallback to server function using service role
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

          const res = await adminUploadProductImage({
            data: {
              base64,
              fileName: file.name,
              contentType: file.type,
            },
          });
          publicUrl = res.publicUrl;
        }

        if (publicUrl) {
          uploadedUrls.push(publicUrl);
        }
      }

      if (uploadedUrls.length > 0) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...uploadedUrls].slice(0, 5),
        }));
        toast.success(`Successfully uploaded ${uploadedUrls.length} image(s)!`, { id: toastId });
      } else {
        toast.error("Failed to upload image(s). Please try again.", { id: toastId });
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(err.message || "Failed to upload image", { id: toastId });
    } finally {
      setIsUploadingFiles(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const existingSpecs = (product.specs as Record<string, string>) || {};

  const [formData, setFormData] = useState({
    name: product.name || "",
    brand: product.brand || "Urban Vault Co.",
    category: product.category || "Tops & Shirts",
    department: existingSpecs["Department"] || "Unisex",
    blurb: product.blurb || "",
    price: (product.price ?? "").toString(),
    compareAt: product.compareAt != null ? product.compareAt.toString() : "",
    sku: product.sku || product.id || "",
    stock: product.stock != null ? product.stock.toString() : "",
    condition: product.condition || "Brand New",
    badge: product.badge || "None",
    isTrending:
      product.badge === "Trending" ||
      existingSpecs["is_trending"] === "true" ||
      (existingSpecs["trending"] as unknown) === true ||
      existingSpecs["trending"] === "true",
    isBestSeller:
      product.badge === "Best seller" ||
      existingSpecs["is_bestseller"] === "true" ||
      (existingSpecs["best_seller"] as unknown) === true ||
      existingSpecs["best_seller"] === "true",
    slug: product.slug || "",
    seoTitle: `${product.name} — Urban Vault Unisex Boutique`,
    flashDeal: product.badge === "Flash Deal" || product.badge === "Flash deal",
    images: (product.images as string[]) || [],
    specs: {
      Sizes: existingSpecs["Sizes"] || "S, M, L, XL",
      Color: existingSpecs["Color"] || "",
      Material: existingSpecs["Material"] || "",
      Fit: existingSpecs["Fit"] || "Regular Fit",
      Care: existingSpecs["Care"] || "Machine wash cold",
      Origin: existingSpecs["Origin"] || "",
      ...existingSpecs,
    } as Record<string, string>,
  });

  const updateField = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateSpec = (specKey: string, val: string) => {
    setFormData((prev) => ({
      ...prev,
      specs: { ...prev.specs, [specKey]: val },
    }));
  };

  const handleAddImageUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    if (formData.images.length >= 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }
    setFormData((prev) => ({ ...prev, images: [...prev.images, url] }));
    setImageUrlInput("");
    toast.success("Image URL added");
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const reorderImages = (reordered: string[]) => {
    setFormData((prev) => ({ ...prev, images: reordered }));
  };

  const handleUpdate = async () => {
    try {
      const priceNum = formData.price !== "" ? Number(formData.price) : undefined;
      const compareAtNum = formData.compareAt !== "" ? Number(formData.compareAt) : null;
      const stockNum = formData.stock !== "" ? Number(formData.stock) : undefined;

      const enrichedSpecs = {
        ...formData.specs,
        Department: formData.department,
        images: formData.images,
        is_trending: formData.isTrending ? "true" : "false",
        is_bestseller: formData.isBestSeller ? "true" : "false",
      };

      await adminUpdateProduct({
        data: {
          id: product.dbId || product.id,
          name: formData.name,
          brand: formData.brand,
          category: formData.category,
          blurb: formData.blurb,
          price: priceNum,
          compare_at: compareAtNum,
          sku: formData.sku || undefined,
          stock: stockNum,
          condition: formData.condition,
          slug: formData.slug || undefined,
          badge:
            formData.badge && formData.badge !== "None"
              ? formData.badge
              : formData.isTrending
              ? "Trending"
              : formData.isBestSeller
              ? "Best seller"
              : formData.flashDeal
              ? "Flash deal"
              : null,
          specs: enrichedSpecs,
        },
      });

      toast.success("Product updated successfully");
      navigate({ to: "/dashboard/products" });
    } catch (err: any) {
      console.error("[handleUpdate] Error:", err);
      toast.error(err?.message || "Failed to update product");
    }
  };

  return (
    <DashboardShell
      title={`Edit: ${product.name}`}
      subtitle="Update boutique apparel details, imagery, pricing, and stock."
    >
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Step Navigation Sidebar */}
        <ol className="flex gap-2 overflow-x-auto no-scrollbar lg:flex-col lg:gap-1.5">
          {steps.map((s, i) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => setStep(i)}
                className={`flex w-full shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors text-left ${
                  i === step
                    ? "bg-primary/15 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <span
                  className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                    i < step
                      ? "bg-primary text-primary-foreground"
                      : i === step
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-card text-muted-foreground"
                  }`}
                >
                  {i < step ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                <span className="truncate">{s}</span>
              </button>
            </li>
          ))}
        </ol>

        {/* Form Container */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-7">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Step {step + 1} of {steps.length}
              </span>
              <h2 className="font-display text-xl font-bold mt-0.5">{steps[step]}</h2>
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              SKU: {formData.sku}
            </span>
          </div>

          <div className="mt-6">
            {/* Step 0: General Product Info */}
            {step === 0 && (
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Product Title"
                  value={formData.name}
                  onChange={(v) => updateField("name", v)}
                  placeholder="e.g. Luxury Cuban Collar Linen Shirt"
                  full
                />

                <div className="space-y-2">
                  <Label>Brand / Label</Label>
                  <Select
                    value={formData.brand}
                    onValueChange={(v) => updateField("brand", v)}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {BOUTIQUE_BRANDS.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Boutique Category</Label>
                    <button
                      type="button"
                      onClick={() => setQuickCatOpen(true)}
                      className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" /> Add category
                    </button>
                  </div>
                  <Select
                    value={formData.category}
                    onValueChange={(v) => {
                      if (v === "__ADD_NEW__") {
                        setQuickCatOpen(true);
                      } else {
                        updateField("category", v);
                      }
                    }}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__ADD_NEW__" className="text-primary font-bold">
                        + Add new category on the fly…
                      </SelectItem>
                      {dynamicCategories.map((c) => (
                        <SelectItem key={c.name} value={c.name}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Target Department</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(v) => {
                      updateField("department", v);
                      updateSpec("Department", v);
                    }}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.filter((d) => d !== "All").map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}'s Wear
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Condition Tag</Label>
                  <Select
                    value={formData.condition}
                    onValueChange={(v) => updateField("condition", v)}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {BOUTIQUE_CONDITIONS.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="desc">Product Description & Styling Notes</Label>
                  <Textarea
                    id="desc"
                    rows={4}
                    value={formData.blurb}
                    onChange={(e) => updateField("blurb", e.target.value)}
                    placeholder="Describe the fabric, cut, and occasion..."
                    className="rounded-xl"
                  />
                </div>
              </div>
            )}

            {/* Step 1: Apparel Imagery */}
            {step === 1 && (
              <div className="space-y-6">
                {/* 1. Direct File Upload Dropzone / Button */}
                <div>
                  <Label className="mb-2 block font-semibold text-sm">
                    Upload Product Images from Device
                  </Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageFilesUpload(e.target.files)}
                  />

                  <div
                    onClick={() => {
                      if (!isUploadingFiles && formData.images.length < 5) {
                        fileInputRef.current?.click();
                      }
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!isUploadingFiles && formData.images.length < 5) {
                        handleImageFilesUpload(e.dataTransfer.files);
                      }
                    }}
                    className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl transition-all cursor-pointer ${
                      isUploadingFiles
                        ? "opacity-70 pointer-events-none border-primary/50 bg-primary/5"
                        : formData.images.length >= 5
                        ? "opacity-50 cursor-not-allowed border-border bg-muted/20"
                        : "border-primary/40 hover:border-primary bg-primary/5 hover:bg-primary/10 shadow-xs"
                    }`}
                  >
                    {isUploadingFiles ? (
                      <div className="flex flex-col items-center gap-2 text-center py-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm font-semibold text-foreground">Uploading images...</p>
                        <p className="text-xs text-muted-foreground">Uploading directly to Supabase storage CDN</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-center py-2">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-1">
                          <UploadCloud className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-bold text-foreground">
                          Click to browse or drag &amp; drop files here
                        </p>
                        <p className="text-xs text-muted-foreground max-w-sm">
                          Upload high-resolution photography (PNG, JPG, WEBP up to 10MB each). Up to 5 images.
                        </p>
                        <Button
                          type="button"
                          size="sm"
                          disabled={formData.images.length >= 5}
                          className="mt-2 rounded-xl font-semibold shadow-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                        >
                          <UploadCloud className="h-4 w-4 mr-1.5" /> Choose Image Files
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Direct Image URL as alternative */}
                <div className="pt-2 border-t border-border/60">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    Or Add Direct Image URL (Unsplash / Hosted CDN)
                  </Label>
                  <div className="mt-2 flex gap-2">
                    <Input
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="rounded-xl"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddImageUrl();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddImageUrl}
                      className="rounded-xl shrink-0"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add URL
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">
                    Product Images ({formData.images.length}/5){" "}
                    <span className="text-xs text-muted-foreground font-normal">
                      — drag to reorder, first image is the cover
                    </span>
                  </Label>
                  <SortableImageGrid
                    images={formData.images}
                    onChange={reorderImages}
                    onRemove={removeImage}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Fashion Specs */}
            {step === 2 && (
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Available Sizes"
                  value={formData.specs["Sizes"] || ""}
                  onChange={(v) => updateSpec("Sizes", v)}
                  placeholder="e.g. S, M, L, XL, XXL (or EU 40, 41, 42, 43, 44, 45)"
                />

                <Field
                  label="Color / Shade"
                  value={formData.specs["Color"] || ""}
                  onChange={(v) => updateSpec("Color", v)}
                  placeholder="e.g. Washed Charcoal, Vintage Black, Sand Dune Beige, Olive"
                />

                <Field
                  label="Material & Fabric"
                  value={formData.specs["Material"] || ""}
                  onChange={(v) => updateSpec("Material", v)}
                  placeholder="e.g. 100% French Terry Cotton (450 GSM), Pure Italian Linen, Raw Denim"
                />

                <Field
                  label="Silhouette & Fit"
                  value={formData.specs["Fit"] || ""}
                  onChange={(v) => updateSpec("Fit", v)}
                  placeholder="e.g. Boxy Drop Shoulder, Tailored Slim Fit, Relaxed Straight"
                />

                <Field
                  label="Care Instructions"
                  value={formData.specs["Care"] || ""}
                  onChange={(v) => updateSpec("Care", v)}
                  placeholder="e.g. Machine wash cold with like colors, Hang dry in shade"
                />

                <Field
                  label="Country of Origin / Tailoring"
                  value={formData.specs["Origin"] || ""}
                  onChange={(v) => updateSpec("Origin", v)}
                  placeholder="e.g. Handcrafted in Accra, Ghana / Imported (Portugal)"
                />
              </div>
            )}

            {/* Step 3: Pricing & Badges */}
            {step === 3 && (
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Selling Price (GH₵)"
                  value={formData.price}
                  onChange={(v) => updateField("price", v)}
                  placeholder="e.g. 350"
                />

                <Field
                  label="Compare-at Price (GH₵) (Optional strikethrough)"
                  value={formData.compareAt}
                  onChange={(v) => updateField("compareAt", v)}
                  placeholder="e.g. 420 (Original price for discount tag)"
                />

                <div className="space-y-2">
                  <Label>Marketing Badge</Label>
                  <Select
                    value={formData.badge}
                    onValueChange={(v) => updateField("badge", v)}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Badge" />
                    </SelectTrigger>
                    <SelectContent>
                      {BOUTIQUE_BADGES.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border p-4">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-amber-500">🔥</span>
                      <p className="text-sm font-semibold">Trending Item</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Feature this product in the homepage "Trending Now" section.
                    </p>
                  </div>
                  <Switch
                    checked={formData.isTrending}
                    onCheckedChange={(v) => {
                      updateField("isTrending", v);
                      if (v && (!formData.badge || formData.badge === "None" || formData.badge === "New")) {
                        updateField("badge", "Trending");
                      }
                    }}
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border p-4">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-primary">★</span>
                      <p className="text-sm font-semibold">Best Seller Item</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Feature this product in the homepage "Best Sellers" section.
                    </p>
                  </div>
                  <Switch
                    checked={formData.isBestSeller}
                    onCheckedChange={(v) => {
                      updateField("isBestSeller", v);
                      if (v && (!formData.badge || formData.badge === "None" || formData.badge === "New")) {
                        updateField("badge", "Best seller");
                      }
                    }}
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border p-4">
                  <div>
                    <p className="text-sm font-semibold">Homepage Flash Deal</p>
                    <p className="text-xs text-muted-foreground">
                      Feature on promotional banner and deal lists.
                    </p>
                  </div>
                  <Switch
                    checked={formData.flashDeal}
                    onCheckedChange={(v) => updateField("flashDeal", v)}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Inventory */}
            {step === 4 && (
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Product SKU"
                  value={formData.sku}
                  onChange={(v) => updateField("sku", v)}
                  placeholder="e.g. UVB-TEE-042"
                />

                <Field
                  label="Units in Stock"
                  value={formData.stock}
                  onChange={(v) => updateField("stock", v)}
                  placeholder="e.g. 25"
                />
              </div>
            )}

            {/* Step 5: SEO & URL Handle */}
            {step === 5 && (
              <div className="grid gap-5">
                <Field
                  label="URL Handle (Slug)"
                  value={formData.slug}
                  onChange={(v) => updateField("slug", v)}
                  placeholder="e.g. luxury-cuban-collar-linen-shirt"
                  full
                />
              </div>
            )}

            {/* Step 6: Preview & Update */}
            {step === 6 && (
              <div className="space-y-6">
                <div className="mx-auto max-w-xs rounded-2xl border border-slate-200/80 dark:border-border/70 bg-card p-0 overflow-hidden shadow-sm">
                  <div className="relative aspect-[4/5] bg-muted w-full overflow-hidden">
                    {formData.images[0] ? (
                      <img
                        src={formData.images[0]}
                        alt={formData.name}
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div className="w-full h-full grid place-items-center text-muted-foreground">
                        <ImagePlus className="h-8 w-8" />
                      </div>
                    )}
                    {formData.badge && formData.badge !== "None" && (
                      <span className="absolute left-2.5 top-2.5 rounded-lg bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground shadow-xs">
                        {formData.badge}
                      </span>
                    )}
                  </div>

                  <div className="p-3.5 flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold uppercase tracking-wider text-muted-foreground truncate">
                        {formData.brand}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-foreground">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        5.0
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-foreground truncate mt-0.5">
                      {formData.name}
                    </h4>

                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="font-bold text-base text-primary">
                        GH₵ {formData.price || "0"}
                      </span>
                      {formData.compareAt && (
                        <span className="text-xs text-muted-foreground line-through">
                          GH₵ {formData.compareAt}
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-primary">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>{Number(formData.stock) > 0 ? "In stock" : "Out of stock"}</span>
                    </div>

                    <div className="mt-2.5 w-full rounded-xl bg-primary text-primary-foreground text-xs font-semibold py-2 text-center">
                      Add to cart
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="font-display text-lg font-bold">Ready to Save Changes</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    Updates will sync immediately to the live storefront and inventory reports.
                  </p>
                  <Button
                    type="button"
                    onClick={handleUpdate}
                    className="mt-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-2.5"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Stepper Footer */}
          <div className="mt-8 flex items-center justify-between border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={step === 0}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className="rounded-xl"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
            </Button>

            {step < steps.length - 1 ? (
              <Button
                type="button"
                onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
                className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                Continue <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleUpdate}
                className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                Save Changes
              </Button>
            )}
          </div>
        </div>
      </div>
      <QuickAddCategoryDialog
        open={quickCatOpen}
        onOpenChange={setQuickCatOpen}
        onCategoryCreated={(name) => updateField("category", name)}
      />
    </DashboardShell>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  full,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  full?: boolean;
}) {
  return (
    <div className={`space-y-2 ${full ? "sm:col-span-2" : ""}`}>
      <Label>{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-xl"
      />
    </div>
  );
}
