import { useState, useRef, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ImagePlus,
  MessageCircle,
  Mail,
  ExternalLink,
  Send,
  Loader2,
  UploadCloud,
  CheckCircle2,
  X,
  Camera,
} from "lucide-react";
import { toast } from "sonner";
import { serverSendTestEmail } from "@/lib/email";
import { adminUploadCategoryImage } from "@/lib/admin.functions";
import { adminListSourcingRequests } from "@/lib/visual-search.functions";
import { supabase } from "@/integrations/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Panel } from "./dashboard.index";
import { STORE, CATEGORIES_TAXONOMY, type CategoryTaxonomy } from "@/lib/store-data";

export const Route = createFileRoute("/_authenticated/dashboard/settings")({
  head: () => ({
    meta: [
      { title: "Store Settings — Urban Vault Unisex Boutique" },
      {
        name: "description",
        content:
          "Configure store branding, theme colours, social links, WhatsApp number, Ghana delivery options and SEO defaults.",
      },
      { property: "og:title", content: "Store Settings — Urban Vault" },
      { property: "og:description", content: "Branding, WhatsApp, delivery and SEO configuration." },
    ],
  }),
  component: Settings,
});

const swatches = [
  "#F43F5E", "#10B981", "#059669", "#047857", "#0EA5E9",
  "#111827", "#8B5CF6", "#F59E0B", "#09090B",
];

// ─── Category image card ───────────────────────────────────────────────────────

const STORAGE_KEY = "uv-category-images";

function loadSavedImages(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveCategoryImage(id: string, url: string) {
  const saved = loadSavedImages();
  saved[id] = url;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  // Dispatch so storefront components can react without refresh
  window.dispatchEvent(new CustomEvent("uv-category-image-change", { detail: { id, url } }));
}

function CategoryImageCard({
  cat,
  overrideUrl,
  onUploaded,
}: {
  cat: CategoryTaxonomy;
  overrideUrl?: string | undefined;
  onUploaded: (id: string, url: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(overrideUrl ?? null);

  const displaySrc = preview ?? cat.image;

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error(`${file.name} exceeds the 10 MB limit`);
      return;
    }

    setUploading(true);
    const toastId = toast.loading(`Uploading image for "${cat.name}"…`);

    try {
      let publicUrl: string | null = null;

      // 1. Try client-side Supabase upload first
      try {
        const ext = file.name.split(".").pop() || "webp";
        const path = `categories/category_${cat.id}_${Date.now()}.${ext}`;
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
        // Fall through to server fallback
      }

      // 2. Server-side fallback (service role)
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

        const res = await adminUploadCategoryImage({
          data: {
            base64,
            fileName: file.name,
            contentType: file.type,
            categoryId: cat.id,
          },
        });
        publicUrl = res.publicUrl;
      }

      if (publicUrl) {
        setPreview(publicUrl);
        saveCategoryImage(cat.id, publicUrl);
        onUploaded(cat.id, publicUrl);
        toast.success(`"${cat.name}" cover updated!`, { id: toastId });
      } else {
        toast.error("Upload succeeded but no URL was returned.", { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || "Upload failed", { id: toastId });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function handleReset() {
    setPreview(null);
    const saved = loadSavedImages();
    delete saved[cat.id];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    onUploaded(cat.id, "");
    toast.success(`"${cat.name}" image reset to default`);
  }

  return (
    <div className="group relative flex flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-xs transition-shadow hover:shadow-md">
      {/* Image area */}
      <div
        className="relative aspect-[4/3] bg-muted cursor-pointer overflow-hidden"
        onClick={() => !uploading && fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />

        <img
          src={displaySrc}
          alt={cat.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
          {uploading ? (
            <Loader2 className="h-7 w-7 text-white animate-spin" />
          ) : (
            <>
              <UploadCloud className="h-7 w-7 text-white" />
              <span className="text-xs font-semibold text-white">
                Click or drop to replace
              </span>
            </>
          )}
        </div>

        {/* Custom image indicator */}
        {preview && (
          <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-primary/90 px-2 py-0.5 text-[10px] font-semibold text-primary-foreground shadow">
            <CheckCircle2 className="h-2.5 w-2.5" /> Custom
          </span>
        )}

        {/* Reset button (only if custom image is set) */}
        {preview && !uploading && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleReset();
            }}
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600"
            aria-label="Reset to default image"
            title="Reset to default"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Info row */}
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-foreground">{cat.name}</p>
          <p className="text-[10px] text-muted-foreground truncate">{cat.department} · {cat.count} products</p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="shrink-0 h-7 text-[11px] px-2 rounded-lg"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <>
              <UploadCloud className="h-3 w-3 mr-1" /> Upload
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Main settings page ────────────────────────────────────────────────────────

function Settings() {
  const [themeColor, setThemeColor] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("urban-vault-theme-color") || "#F43F5E";
    }
    return "#F43F5E";
  });

  const [testEmail, setTestEmail] = useState("");
  const [sendingTest, setSendingTest] = useState(false);

  // Track overrides so cards re-render immediately after upload
  const [categoryImageOverrides, setCategoryImageOverrides] = useState<Record<string, string>>(
    () => loadSavedImages(),
  );

  const [sourcingRequests, setSourcingRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  useEffect(() => {
    setLoadingRequests(true);
    adminListSourcingRequests()
      .then((data) => setSourcingRequests(data || []))
      .catch(() => {})
      .finally(() => setLoadingRequests(false));
  }, []);

  function handleCategoryUploaded(id: string, url: string) {
    setCategoryImageOverrides((prev) => {
      if (!url) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: url };
    });
  }

  async function handleSendTest() {
    if (!testEmail || !testEmail.includes("@")) {
      toast.error("Please enter a valid recipient email address");
      return;
    }
    setSendingTest(true);
    try {
      const res = await serverSendTestEmail({ data: { toEmail: testEmail } });
      if (res.provider === "console") {
        toast.info(
          "Test order logged to server console (Add RESEND_API_KEY in .env to deliver live emails to your inbox).",
        );
      } else {
        toast.success(`Test order confirmation email sent to ${testEmail}! Check your inbox.`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send test email");
    } finally {
      setSendingTest(false);
    }
  }

  function changeTheme(color: string) {
    setThemeColor(color);
    localStorage.setItem("urban-vault-theme-color", color);
    localStorage.setItem("voltix-theme-color", color);
    window.dispatchEvent(new Event("urban-vault-theme-change"));
    window.dispatchEvent(new Event("voltix-theme-change"));
    toast.success(`Theme colour set to ${color}`);
  }

  return (
    <DashboardShell
      title="Settings"
      subtitle="Everything that shapes how your boutique storefront looks and replies."
      actions={
        <Button variant="hero" size="sm" onClick={() => toast.success("Settings saved")}>
          Save changes
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Store branding" subtitle="Logo and display name">
          <div className="flex items-center gap-4">
            <button
              onClick={() => toast.success("Logo upload opened")}
              className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl border-2 border-dashed border-border bg-surface-muted text-muted-foreground transition-colors hover:border-primary/50 overflow-hidden"
            >
              <img
                src="/urban-vault-logo.jpg"
                alt={STORE.name}
                className="h-full w-full object-cover"
              />
            </button>
            <div className="min-w-0 flex-1 space-y-2">
              <Label htmlFor="store-name">Store name</Label>
              <Input id="store-name" defaultValue={STORE.name} />
            </div>
          </div>
          <div className="mt-5 space-y-2">
            <Label>Theme colour</Label>
            <div className="flex gap-2">
              {swatches.map((c) => (
                <button
                  key={c}
                  aria-label={`Theme colour ${c}`}
                  onClick={() => changeTheme(c)}
                  style={{ backgroundColor: c }}
                  className={`h-9 w-9 rounded-full border-2 transition-transform hover:scale-105 ${
                    themeColor === c ? "border-foreground scale-105" : "border-transparent"
                  }`}
                />
              ))}
            </div>
          </div>
        </Panel>

        <Panel title="WhatsApp & contact" subtitle="Where enquiries land">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wa">WhatsApp number</Label>
              <Input id="wa" defaultValue={STORE.whatsapp} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wa-msg">Default enquiry message</Label>
              <Textarea
                id="wa-msg"
                rows={3}
                defaultValue="Hi Urban Vault, I'm interested in this item — is it available in my size?"
              />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border p-4">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <MessageCircle className="h-4 w-4 text-primary" /> Show floating WhatsApp button
              </p>
              <Switch defaultChecked />
            </div>
          </div>
        </Panel>

        <Panel title="Social links" subtitle="Shown in the storefront footer">
          <div className="grid gap-4 sm:grid-cols-2">
            {["Instagram", "X (Twitter)", "TikTok", "Facebook"].map((s) => (
              <div key={s} className="space-y-2">
                <Label htmlFor={s}>{s}</Label>
                <Input id={s} placeholder={`@urbanvault.${s.slice(0, 2).toLowerCase()}`} />
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Payments & delivery" subtitle="Displayed at checkout and enquiry time">
          <div className="space-y-3">
            {["Mobile Money (MTN / Telecel)", "Paystack Card / Transfer", "Cash on Delivery (Accra)", "In-store Pickup"].map(
              (m, i) => (
                <div
                  key={m}
                  className="flex items-center justify-between rounded-xl border border-border p-3.5"
                >
                  <span className="text-sm font-medium">{m}</span>
                  <Switch defaultChecked={i < 4} />
                </div>
              ),
            )}
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="accra">Greater Accra delivery fee (GH₵)</Label>
              <Input id="accra" defaultValue="35" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nation">Regional / Nationwide fee (GH₵)</Label>
              <Input id="nation" defaultValue="60" />
            </div>
          </div>
        </Panel>

        {/* ─── Category Images ─────────────────────────────────────────────── */}
        <Panel
          title="Category Cover Images"
          subtitle="Upload a custom cover photo for each storefront category. Changes apply immediately — no rebuild required."
          className="lg:col-span-2"
        >
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-3.5 text-sm">
            <UploadCloud className="h-5 w-5 shrink-0 text-primary mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">How it works</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Images are uploaded to Supabase Storage and saved in your browser for the live
                storefront preview. Share the public URL with your developer to make the change
                permanent in <code className="font-mono text-primary">store-data.ts</code>.
                Hover any card to upload or drag &amp; drop an image directly.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {CATEGORIES_TAXONOMY.map((cat) => (
              <CategoryImageCard
                key={cat.id}
                cat={cat}
                overrideUrl={categoryImageOverrides[cat.id]}
                onUploaded={handleCategoryUploaded}
              />
            ))}
          </div>

          {Object.keys(categoryImageOverrides).length > 0 && (
            <div className="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-3.5 text-xs">
              <p className="font-semibold text-primary mb-1.5">
                {Object.keys(categoryImageOverrides).length} custom image{Object.keys(categoryImageOverrides).length !== 1 ? "s" : ""} set — copy these URLs into store-data.ts to persist permanently:
              </p>
              <div className="space-y-1">
                {Object.entries(categoryImageOverrides).map(([id, url]) => (
                  <div key={id} className="flex items-center gap-2">
                    <code className="text-muted-foreground font-mono shrink-0">{id}:</code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(url);
                        toast.success("URL copied to clipboard");
                      }}
                      className="truncate text-primary hover:underline text-left max-w-xs"
                      title={url}
                    >
                      {url}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Panel>

        {/* ─── Email ───────────────────────────────────────────────────────── */}
        <Panel
          title="Transactional Email & Receipts"
          subtitle="Powered by Resend with luxury boutique order confirmation receipts"
          className="lg:col-span-2"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-surface-muted/30 mb-5">
            <div>
              <p className="text-sm font-semibold text-foreground">Interactive Email Template Previews</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Preview your customer receipt, admin packing checklist, and order dispatch
                notification templates live in your browser.
              </p>
            </div>
            <Button variant="outline" size="sm" asChild className="shrink-0 font-medium">
              <Link to="/preview-email" target="_blank">
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Open Email Showcase
              </Link>
            </Button>
          </div>

          <div className="space-y-3">
            <Label htmlFor="test-email-input">Send Live Test Receipt to Your Inbox</Label>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                id="test-email-input"
                type="email"
                placeholder="Enter your personal email (e.g. you@gmail.com)"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleSendTest}
                disabled={sendingTest}
                className="shrink-0 font-semibold"
              >
                {sendingTest ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" /> Send Test Email
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Make sure <code className="font-mono text-primary">RESEND_API_KEY</code> is set in
              your <code className="font-mono text-foreground">.env</code> to deliver live messages.
            </p>
          </div>
        </Panel>

        <Panel title="SEO defaults" subtitle="Used when a listing has no override" className="lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="seo-t">Default page title</Label>
              <Input id="seo-t" defaultValue="Urban Vault Unisex Boutique — Streetwear & Designer Apparel Accra" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seo-k">Focus keywords</Label>
              <Input id="seo-k" defaultValue="boutique accra, unisex streetwear, vintage wash tees, designer sneakers ghana" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="seo-d">Default meta description</Label>
              <Textarea
                id="seo-d"
                rows={3}
                defaultValue="Shop curated unisex fashion, premium streetwear, heavyweight tees, luxury footwear, and designer statement pieces at Urban Vault Unisex Boutique. Fast delivery across Accra and Ghana."
              />
            </div>
          </div>
        </Panel>

        {/* ── Visual Sourcing Inquiries Panel ───────────────────────────── */}
        <Panel
          title="Customer Photo Sourcing Requests"
          subtitle="Photo inquiries submitted via the storefront 'Snap & Find' VIP concierge"
          className="lg:col-span-2"
        >
          {loadingRequests ? (
            <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mr-2 text-primary" />
              Loading sourcing requests…
            </div>
          ) : sourcingRequests.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center bg-muted/20">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
                <Camera className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold text-foreground">No Photo Inquiries Logged Yet</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 max-w-sm mx-auto">
                When customers snap photos or upload outfit screenshots to request boutique sourcing, their inquiries and WhatsApp details will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {sourcingRequests.map((req: any) => {
                const cleanPhone = (req.whatsapp_number || "").replace(/[^0-9+]/g, "");
                const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                  `Hi ${req.customer_name || "there"}, regarding your photo sourcing request at Urban Vault...`,
                )}`;

                return (
                  <div
                    key={req.id}
                    className="flex flex-col justify-between rounded-xl border border-border bg-card p-3.5 shadow-xs"
                  >
                    <div>
                      <div className="flex items-start gap-3">
                        {req.image_url ? (
                          <a
                            href={req.image_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden border border-border bg-black/60 group"
                          >
                            <img
                              src={req.image_url}
                              alt="Garment inquiry"
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </div>
                          </a>
                        ) : (
                          <div className="h-16 w-16 shrink-0 rounded-lg border border-border bg-muted flex items-center justify-center text-muted-foreground">
                            <Camera className="h-5 w-5" />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-xs text-foreground truncate">
                            {req.customer_name || "Anonymous Customer"}
                          </p>
                          <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                            {req.whatsapp_number}
                          </p>
                          {req.preferred_size && (
                            <p className="text-[11px] text-foreground font-medium mt-1">
                              Size: <span className="text-primary font-bold">{req.preferred_size}</span>
                            </p>
                          )}
                          {req.budget && (
                            <p className="text-[10px] text-muted-foreground">
                              Budget: GH₵ {req.budget}
                            </p>
                          )}
                        </div>
                      </div>

                      {req.notes && (
                        <p className="mt-2.5 text-[11px] text-muted-foreground bg-muted/40 p-2 rounded-lg line-clamp-2">
                          "{req.notes}"
                        </p>
                      )}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">
                        {req.created_at ? new Date(req.created_at).toLocaleDateString() : "Recent"}
                      </span>
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 text-[11px] font-semibold transition-colors"
                      >
                        <MessageCircle className="h-3 w-3" />
                        Chat on WhatsApp
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>
      </div>
    </DashboardShell>
  );
}
