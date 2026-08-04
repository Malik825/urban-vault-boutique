import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, ImagePlus, ArrowLeft, ArrowRight } from "lucide-react";
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

export const Route = createFileRoute("/_authenticated/dashboard/new-product")({
  head: () => ({
    meta: [
      { title: "Add a product — Voltix seller dashboard" },
      {
        name: "description",
        content:
          "Create a new listing with guided steps for details, images, specifications, pricing, inventory and SEO.",
      },
      { property: "og:title", content: "Add a product — Voltix" },
      { property: "og:description", content: "A guided multi-step form for new listings." },
    ],
  }),
  component: AddProduct,
});

const steps = ["General", "Images", "Specifications", "Pricing", "Inventory", "SEO", "Preview"];

function AddProduct() {
  const [step, setStep] = useState(0);

  return (
    <DashboardShell title="Add product" subtitle="Seven quick steps to a polished listing.">
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
                <Field label="Product name" id="name" placeholder="MacBook Pro 14 M3 Pro" full />
                <div className="space-y-2">
                  <Label>Brand</Label>
                  <Select>
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
                  <Select>
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
                  <Textarea id="desc" rows={5} placeholder="What makes this unit worth buying…" />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-4 sm:grid-cols-3">
                {[0, 1, 2].map((i) => (
                  <button
                    key={i}
                    onClick={() => toast.success("Image picker opened")}
                    className="grid aspect-square place-items-center rounded-2xl border-2 border-dashed border-border bg-surface-muted text-muted-foreground transition-colors hover:border-primary/50 hover:text-accent-foreground"
                  >
                    <span className="text-center">
                      <ImagePlus className="mx-auto h-6 w-6" />
                      <span className="mt-2 block text-xs font-medium">
                        {i === 0 ? "Cover image" : `Image ${i + 1}`}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {["Processor", "RAM", "Storage", "Screen size", "Battery", "Weight"].map((s) => (
                  <Field key={s} label={s} id={s} placeholder={`e.g. ${s}`} />
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Price (₦)" id="price" placeholder="2450000" />
                <Field label="Compare-at price (₦)" id="compare" placeholder="2790000" />
                <Field label="Cost per unit (₦)" id="cost" placeholder="2100000" />
                <div className="flex items-center justify-between rounded-xl border border-border p-4 sm:col-span-2">
                  <div>
                    <p className="text-sm font-semibold">Show as flash deal</p>
                    <p className="text-xs text-muted-foreground">
                      Highlights the listing on the storefront home page.
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="SKU" id="sku" placeholder="PRD-1042" />
                <Field label="Units in stock" id="stock" placeholder="6" />
                <div className="space-y-2">
                  <Label>Condition</Label>
                  <Select>
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
                <Field label="Warranty" id="warranty" placeholder="12 months" />
              </div>
            )}

            {step === 5 && (
              <div className="grid gap-4">
                <Field label="Page title" id="seo-title" placeholder="MacBook Pro 14 M3 Pro — Voltix" full />
                <div className="space-y-2">
                  <Label htmlFor="seo-desc">Meta description</Label>
                  <Textarea id="seo-desc" rows={3} placeholder="Under 160 characters." />
                </div>
                <Field label="URL handle" id="slug" placeholder="macbook-pro-14-m3-pro" full />
              </div>
            )}

            {step === 6 && (
              <div className="rounded-2xl border border-border bg-surface-muted p-6 text-center">
                <p className="font-display text-base font-bold">Listing looks good</p>
                <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                  Publish now to make it live on the storefront, or save as a draft and come back
                  later.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <Button variant="outline" onClick={() => toast.success("Saved as draft")}>
                    Save draft
                  </Button>
                  <Button variant="hero" onClick={() => toast.success("Product published")}>
                    Publish product
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
  id,
  placeholder,
  full,
}: {
  label: string;
  id: string;
  placeholder: string;
  full?: boolean;
}) {
  return (
    <div className={`space-y-2 ${full ? "sm:col-span-2" : ""}`}>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} placeholder={placeholder} />
    </div>
  );
}
