import { useState, useRef } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, ImagePlus, ArrowLeft, ArrowRight, X } from "lucide-react";
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
import { brands, categories } from "@/lib/store-data";
import { adminGetProduct, adminUpdateProduct } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/dashboard/product/$id/edit")({
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

const steps = ["General", "Images", "Specifications", "Pricing", "Inventory", "SEO", "Preview"];

function EditProduct() {
  const product = Route.useLoaderData();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  
  // State for all form fields
  const [formData, setFormData] = useState({
    name: product.name || "",
    brand: product.brand || "",
    category: product.category || "",
    blurb: product.blurb || "",
    price: (product.price ?? "").toString(),
    compareAt: product.compareAt != null ? product.compareAt.toString() : "",
    cost: "", // not saved yet
    sku: product.sku || product.id || "",
    stock: product.stock != null ? product.stock.toString() : "",
    condition: product.condition || "New",
    warranty: "", // not saved yet
    slug: product.slug || "",
    seoTitle: "", // maybe map from name
    seoDesc: "",
    flashDeal: product.badge === "Flash Deal" || product.badge === "Flash deal",
    images: product.images || [],
    specs: product.specs || {},
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateField = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files).map((f) => URL.createObjectURL(f));
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...newImages].slice(0, 3) }));
      toast.success("Images uploaded");
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleUpdate = async () => {
    try {
      const priceNum = formData.price !== "" ? Number(formData.price) : undefined;
      const compareAtNum = formData.compareAt !== "" ? Number(formData.compareAt) : null;
      const stockNum = formData.stock !== "" ? Number(formData.stock) : undefined;

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
          badge: formData.flashDeal ? "Flash Deal" : null,
          specs: formData.specs,
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
    <DashboardShell title="Edit product" subtitle="Update your listing details.">
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <ol className="flex gap-2 overflow-x-auto no-scrollbar lg:flex-col lg:gap-1">
          {steps.map((s, i) => (
            <li key={s}>
              <button
                onClick={() => setStep(i)}
                className={`flex w-full shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  i === step
                    ? "bg-primary-soft text-accent-foreground"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                <span
                  className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                    i < step
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-surface"
                  }`}
                >
                  {i < step ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                {s}
              </button>
            </li>
          ))}
        </ol>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
          <h2 className="font-display text-lg font-bold">{steps[step]}</h2>

          <div className="mt-6 animate-fade-in">
            {step === 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field 
                  label="Product name" 
                  value={formData.name}
                  onChange={(v) => updateField("name", v)}
                  placeholder="MacBook Pro 14 M3 Pro" 
                  full 
                />
                <div className="space-y-2">
                  <Label>Brand</Label>
                  <Select value={formData.brand} onValueChange={(v) => updateField("brand", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((b) => (
                        <SelectItem key={b.name} value={b.name}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(v) => updateField("category", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.name} value={c.name}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="desc">Description</Label>
                  <Textarea 
                    id="desc" 
                    rows={5} 
                    value={formData.blurb}
                    onChange={(e) => updateField("blurb", e.target.value)}
                    placeholder="What makes this unit worth buying…" 
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-4 sm:grid-cols-3">
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                />
                {[0, 1, 2].map((i) => (
                  formData.images[i] ? (
                    <div key={i} className="relative grid aspect-square overflow-hidden rounded-2xl border border-border group">
                      <img src={formData.images[i]} alt="Upload preview" className="object-cover w-full h-full" />
                      <button 
                        onClick={() => removeImage(i)}
                        className="absolute top-2 right-2 p-1 rounded-full bg-background/80 text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      key={i}
                      onClick={() => fileInputRef.current?.click()}
                      className="grid aspect-square place-items-center rounded-2xl border-2 border-dashed border-border bg-surface-muted text-muted-foreground transition-colors hover:border-primary/50 hover:text-accent-foreground"
                    >
                      <span className="text-center">
                        <ImagePlus className="mx-auto h-6 w-6" />
                        <span className="mt-2 block text-xs font-medium">
                          {i === 0 ? "Cover image" : `Image ${i + 1}`}
                        </span>
                      </span>
                    </button>
                  )
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {["Processor", "RAM", "Storage", "Screen size", "Battery", "Weight"].map((s) => (
                  <Field 
                    key={s} 
                    label={s} 
                    value={formData.specs[s] || ""}
                    onChange={(v) => updateField("specs", { ...formData.specs, [s]: v })}
                    placeholder={`e.g. ${s}`} 
                  />
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field 
                  label="Price (GH₵)" 
                  value={formData.price}
                  onChange={(v) => updateField("price", v)}
                  placeholder="24500" 
                />
                <Field 
                  label="Compare-at price (GH₵)" 
                  value={formData.compareAt}
                  onChange={(v) => updateField("compareAt", v)}
                  placeholder="27900" 
                />
                <Field 
                  label="Cost per unit (GH₵)" 
                  value={formData.cost}
                  onChange={(v) => updateField("cost", v)}
                  placeholder="21000" 
                />
                <div className="flex items-center justify-between rounded-xl border border-border p-4 sm:col-span-2">
                  <div>
                    <p className="text-sm font-semibold">Show as flash deal</p>
                    <p className="text-xs text-muted-foreground">
                      Highlights the listing on the storefront home page.
                    </p>
                  </div>
                  <Switch checked={formData.flashDeal} onCheckedChange={(v) => updateField("flashDeal", v)} />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="SKU" value={formData.sku} onChange={(v) => updateField("sku", v)} placeholder="PRD-1042" />
                <Field label="Units in stock" value={formData.stock} onChange={(v) => updateField("stock", v)} placeholder="6" />
                <div className="space-y-2">
                  <Label>Condition</Label>
                  <Select value={formData.condition} onValueChange={(v) => updateField("condition", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {["New", "Open box", "Refurbished"].map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Field label="Warranty" value={formData.warranty} onChange={(v) => updateField("warranty", v)} placeholder="12 months" />
              </div>
            )}

            {step === 5 && (
              <div className="grid gap-4">
                <Field label="Page title" value={formData.seoTitle} onChange={(v) => updateField("seoTitle", v)} placeholder={`${formData.name} — Voltix`} full />
                <div className="space-y-2">
                  <Label htmlFor="seo-desc">Meta description</Label>
                  <Textarea 
                    id="seo-desc" 
                    rows={3} 
                    value={formData.seoDesc}
                    onChange={(e) => updateField("seoDesc", e.target.value)}
                    placeholder="Under 160 characters." 
                  />
                </div>
                <Field label="URL handle" value={formData.slug} onChange={(v) => updateField("slug", v)} placeholder="macbook-pro-14-m3-pro" full />
              </div>
            )}

            {step === 6 && (
              <div className="rounded-2xl border border-border bg-surface-muted p-6 text-center">
                <div className="mb-6 mx-auto max-w-sm rounded-xl overflow-hidden border border-border bg-card shadow-sm text-left">
                  {formData.images[0] ? (
                    <img src={formData.images[0]} alt="Cover preview" className="aspect-square w-full object-cover" />
                  ) : (
                    <div className="aspect-square w-full bg-surface-muted grid place-items-center">
                      <ImagePlus className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="p-4">
                    <p className="text-xs text-muted-foreground font-medium">{formData.brand || "Brand"}</p>
                    <h3 className="font-bold text-lg mt-1 truncate">{formData.name || "Product Name"}</h3>
                    <p className="font-semibold text-primary mt-2">GH₵ {formData.price || "0"}</p>
                  </div>
                </div>

                <p className="font-display text-base font-bold">Listing looks good</p>
                <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                  Update the listing to apply changes.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <Button variant="outline" onClick={() => navigate({ to: "/dashboard/products" })}>
                    Cancel
                  </Button>
                  <Button variant="hero" onClick={handleUpdate}>
                    Update product
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
            <Button
              variant="ghost"
              disabled={step === 0}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button
              disabled={step === steps.length - 1}
              onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
            >
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
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
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}
