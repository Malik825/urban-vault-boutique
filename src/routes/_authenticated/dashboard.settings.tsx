import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  MessageCircle,
  Mail,
  ExternalLink,
  Send,
  Loader2,
  Camera,
  Store,
  Palette,
  Globe,
  Truck,
  Search,
  Image as ImageIcon,
  Users,
  Settings2,
} from "lucide-react";
import { toast } from "sonner";
import { serverSendTestEmail } from "@/lib/email";
import { adminListSourcingRequests } from "@/lib/visual-search.functions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Panel } from "./dashboard.index";
import { STORE } from "@/lib/store-data";
import { HeroSliderSettings } from "@/components/dashboard/hero-slider-settings";
import { CategoryManager } from "@/components/dashboard/category-manager";

export const Route = createFileRoute("/_authenticated/dashboard/settings")({
  head: () => ({
    meta: [
      { title: "Store Settings — Urban Vault Unisex Boutique" },
      {
        name: "description",
        content:
          "Configure store branding, theme colours, social links, WhatsApp number, delivery options and SEO defaults.",
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

// ─── Settings persistence ──────────────────────────────────────────────────────

const SETTINGS_KEY = "urban_vault_store_settings";

interface StoreSettings {
  storeName: string;
  themeColor: string;
  whatsapp: string;
  whatsappMessage: string;
  showWhatsappButton: boolean;
  socialInstagram: string;
  socialTwitter: string;
  socialTiktok: string;
  socialFacebook: string;
  payMomo: boolean;
  payPaystack: boolean;
  payCod: boolean;
  payPickup: boolean;
  deliveryLocal: string;
  deliveryNational: string;
  seoTitle: string;
  seoKeywords: string;
  seoDescription: string;
}

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: STORE.name,
  themeColor: "#F43F5E",
  whatsapp: STORE.whatsapp,
  whatsappMessage: "Hi Urban Vault, I'm interested in this item — is it available in my size?",
  showWhatsappButton: true,
  socialInstagram: "",
  socialTwitter: "",
  socialTiktok: "",
  socialFacebook: "",
  payMomo: true,
  payPaystack: true,
  payCod: true,
  payPickup: true,
  deliveryLocal: "35",
  deliveryNational: "60",
  seoTitle: "Urban Vault Unisex Boutique — Streetwear & Designer Apparel Assin Fosu",
  seoKeywords: "boutique assin fosu, unisex streetwear, vintage wash tees, designer sneakers ghana",
  seoDescription:
    "Shop curated unisex fashion, premium streetwear, heavyweight tees, luxury footwear, and designer statement pieces at Urban Vault Unisex Boutique. Fast delivery across Assin Fosu and Ghana.",
};

function loadSettings(): StoreSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_SETTINGS;
}

function persistSettings(settings: StoreSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent("uv-settings-change", { detail: settings }));
}

// ─── Tabs ──────────────────────────────────────────────────────────────────────

type SettingsTab = "general" | "storefront" | "seo" | "requests";

const TABS: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: "general", label: "General", icon: Store },
  { id: "storefront", label: "Storefront", icon: ImageIcon },
  { id: "seo", label: "SEO & Email", icon: Search },
  { id: "requests", label: "Requests", icon: Users },
];

// ─── Main settings page ────────────────────────────────────────────────────────

function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [settings, setSettings] = useState<StoreSettings>(() => loadSettings());
  const [saving, setSaving] = useState(false);

  const [testEmail, setTestEmail] = useState("");
  const [sendingTest, setSendingTest] = useState(false);

  const [sourcingRequests, setSourcingRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Load sourcing requests on mount
  useEffect(() => {
    setLoadingRequests(true);
    adminListSourcingRequests()
      .then((data) => setSourcingRequests(data || []))
      .catch(() => {})
      .finally(() => setLoadingRequests(false));
  }, []);

  // Convenience updater
  function patch(p: Partial<StoreSettings>) {
    setSettings((prev) => ({ ...prev, ...p }));
  }

  // Theme colour (also updates immediately for live preview)
  function changeTheme(color: string) {
    patch({ themeColor: color });
    localStorage.setItem("urban-vault-theme-color", color);
    localStorage.setItem("voltix-theme-color", color);
    window.dispatchEvent(new Event("urban-vault-theme-change"));
    window.dispatchEvent(new Event("voltix-theme-change"));
  }

  // Save all settings
  function handleSave() {
    setSaving(true);
    try {
      persistSettings(settings);
      toast.success("Settings saved successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
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

  return (
    <DashboardShell
      title="Settings"
      subtitle="Configure your boutique storefront."
      actions={
        <Button
          variant="hero"
          size="sm"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Saving…
            </>
          ) : (
            "Save changes"
          )}
        </Button>
      }
    >
      {/* Tab Navigation */}
      <div className="mb-5 sm:mb-6 -mt-1 overflow-x-auto scrollbar-none">
        <div className="flex gap-1 sm:gap-1.5 min-w-max p-1 rounded-xl bg-muted/50 border border-border">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-card text-foreground shadow-sm border border-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                }`}
              >
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "general" && (
        <GeneralTab
          settings={settings}
          patch={patch}
          changeTheme={changeTheme}
        />
      )}

      {activeTab === "storefront" && <StorefrontTab />}

      {activeTab === "seo" && (
        <SeoEmailTab
          settings={settings}
          patch={patch}
          testEmail={testEmail}
          setTestEmail={setTestEmail}
          sendingTest={sendingTest}
          handleSendTest={handleSendTest}
        />
      )}

      {activeTab === "requests" && (
        <RequestsTab
          sourcingRequests={sourcingRequests}
          loadingRequests={loadingRequests}
        />
      )}
    </DashboardShell>
  );
}

// ─── General Tab ───────────────────────────────────────────────────────────────

function GeneralTab({
  settings,
  patch,
  changeTheme,
}: {
  settings: StoreSettings;
  patch: (p: Partial<StoreSettings>) => void;
  changeTheme: (color: string) => void;
}) {
  return (
    <div className="grid gap-4 sm:gap-6 lg:grid-cols-2 min-w-0 max-w-full">
      {/* Store Branding */}
      <Panel title="Store branding" subtitle="Logo and display name">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 min-w-0">
          <button
            onClick={() => toast.success("Logo upload opened")}
            className="grid h-16 w-16 sm:h-20 sm:w-20 shrink-0 place-items-center rounded-2xl border-2 border-dashed border-border bg-surface-muted text-muted-foreground transition-colors hover:border-primary/50 overflow-hidden"
          >
            <img
              src="/urban-vault-logo.jpg"
              alt={STORE.name}
              className="h-full w-full object-cover"
            />
          </button>
          <div className="min-w-0 flex-1 space-y-1.5 sm:space-y-2">
            <Label htmlFor="store-name">Store name</Label>
            <Input
              id="store-name"
              value={settings.storeName}
              onChange={(e) => patch({ storeName: e.target.value })}
              className="w-full min-w-0"
            />
          </div>
        </div>
        <div className="mt-4 sm:mt-5 space-y-2 min-w-0">
          <Label>Theme colour</Label>
          <div className="flex flex-wrap gap-2">
            {swatches.map((c) => (
              <button
                key={c}
                aria-label={`Theme colour ${c}`}
                onClick={() => changeTheme(c)}
                style={{ backgroundColor: c }}
                className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full border-2 transition-transform hover:scale-105 shrink-0 ${
                  settings.themeColor === c ? "border-foreground scale-105" : "border-transparent"
                }`}
              />
            ))}
          </div>
        </div>
      </Panel>

      {/* WhatsApp & Contact */}
      <Panel title="WhatsApp & contact" subtitle="Where enquiries land">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="wa">WhatsApp number</Label>
            <Input
              id="wa"
              value={settings.whatsapp}
              onChange={(e) => patch({ whatsapp: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wa-msg">Default enquiry message</Label>
            <Textarea
              id="wa-msg"
              rows={3}
              value={settings.whatsappMessage}
              onChange={(e) => patch({ whatsappMessage: e.target.value })}
            />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border p-4">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <MessageCircle className="h-4 w-4 text-primary" /> Show floating WhatsApp button
            </p>
            <Switch
              checked={settings.showWhatsappButton}
              onCheckedChange={(v) => patch({ showWhatsappButton: v })}
            />
          </div>
        </div>
      </Panel>

      {/* Social Links */}
      <Panel title="Social links" subtitle="Shown in the storefront footer">
        <div className="grid gap-4 sm:grid-cols-2">
          {([
            ["Instagram", "socialInstagram"],
            ["X (Twitter)", "socialTwitter"],
            ["TikTok", "socialTiktok"],
            ["Facebook", "socialFacebook"],
          ] as const).map(([label, key]) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key}>{label}</Label>
              <Input
                id={key}
                value={settings[key]}
                onChange={(e) => patch({ [key]: e.target.value })}
                placeholder={`@urbanvault`}
              />
            </div>
          ))}
        </div>
      </Panel>

      {/* Payments & Delivery */}
      <Panel title="Payments & delivery" subtitle="Displayed at checkout and enquiry time">
        <div className="space-y-3">
          {([
            ["Mobile Money (MTN / Telecel)", "payMomo"],
            ["Paystack Card / Transfer", "payPaystack"],
            ["Cash on Delivery (Assin Fosu)", "payCod"],
            ["In-store Pickup", "payPickup"],
          ] as const).map(([label, key]) => (
            <div
              key={key}
              className="flex items-center justify-between rounded-xl border border-border p-3.5"
            >
              <span className="text-sm font-medium">{label}</span>
              <Switch
                checked={settings[key]}
                onCheckedChange={(v) => patch({ [key]: v })}
              />
            </div>
          ))}
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="local-fee">Assin Fosu & surrounds delivery fee (GH₵)</Label>
            <Input
              id="local-fee"
              value={settings.deliveryLocal}
              onChange={(e) => patch({ deliveryLocal: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nation">Regional / Nationwide fee (GH₵)</Label>
            <Input
              id="nation"
              value={settings.deliveryNational}
              onChange={(e) => patch({ deliveryNational: e.target.value })}
            />
          </div>
        </div>
      </Panel>
    </div>
  );
}

// ─── Storefront Tab ────────────────────────────────────────────────────────────

function StorefrontTab() {
  return (
    <div className="grid gap-4 sm:gap-6 min-w-0 max-w-full">
      {/* Hero Slider */}
      <Panel
        title="Hero Slider Images & Content"
        subtitle="Customize the storefront hero carousel slides, high-res images, headlines, and call-to-action buttons."
      >
        <HeroSliderSettings />
      </Panel>

      {/* Dynamic Categories */}
      <Panel
        title="Dynamic Categories & Filter Subtitles"
        subtitle="Add categories on the fly, edit filter subtitles and editorial blurbs, manage departments, and upload cover photos live."
      >
        <CategoryManager />
      </Panel>
    </div>
  );
}

// ─── SEO & Email Tab ───────────────────────────────────────────────────────────

function SeoEmailTab({
  settings,
  patch,
  testEmail,
  setTestEmail,
  sendingTest,
  handleSendTest,
}: {
  settings: StoreSettings;
  patch: (p: Partial<StoreSettings>) => void;
  testEmail: string;
  setTestEmail: (v: string) => void;
  sendingTest: boolean;
  handleSendTest: () => void;
}) {
  return (
    <div className="grid gap-4 sm:gap-6 min-w-0 max-w-full">
      {/* SEO Defaults */}
      <Panel title="SEO defaults" subtitle="Used when a listing has no override">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="seo-t">Default page title</Label>
            <Input
              id="seo-t"
              value={settings.seoTitle}
              onChange={(e) => patch({ seoTitle: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seo-k">Focus keywords</Label>
            <Input
              id="seo-k"
              value={settings.seoKeywords}
              onChange={(e) => patch({ seoKeywords: e.target.value })}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="seo-d">Default meta description</Label>
            <Textarea
              id="seo-d"
              rows={3}
              value={settings.seoDescription}
              onChange={(e) => patch({ seoDescription: e.target.value })}
            />
          </div>
        </div>
      </Panel>

      {/* Email & Receipts */}
      <Panel
        title="Transactional Email & Receipts"
        subtitle="Powered by Resend with luxury boutique order confirmation receipts"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl border border-border bg-surface-muted/30 mb-5 min-w-0">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">Interactive Email Template Previews</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Preview your customer receipt, admin packing checklist, and order dispatch
              notification templates live in your browser.
            </p>
          </div>
          <Button variant="outline" size="sm" asChild className="w-full sm:w-auto shrink-0 font-medium justify-center">
            <Link to="/preview-email" target="_blank">
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Open Email Showcase
            </Link>
          </Button>
        </div>

        <div className="space-y-3 min-w-0">
          <Label htmlFor="test-email-input">Send Live Test Receipt to Your Inbox</Label>
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 min-w-0">
            <Input
              id="test-email-input"
              type="email"
              placeholder="Enter your personal email (e.g. you@gmail.com)"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="flex-1 min-w-0"
            />
            <Button
              onClick={handleSendTest}
              disabled={sendingTest}
              className="w-full sm:w-auto shrink-0 font-semibold justify-center"
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
    </div>
  );
}

// ─── Requests Tab ──────────────────────────────────────────────────────────────

function RequestsTab({
  sourcingRequests,
  loadingRequests,
}: {
  sourcingRequests: any[];
  loadingRequests: boolean;
}) {
  return (
    <div className="grid gap-4 sm:gap-6 min-w-0 max-w-full">
      <Panel
        title="Customer Photo Sourcing Requests"
        subtitle="Photo inquiries submitted via the storefront 'Snap & Find' VIP concierge"
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
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 min-w-0">
            {sourcingRequests.map((req: any) => {
              const cleanPhone = (req.whatsapp_number || "").replace(/[^0-9+]/g, "");
              const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                `Hi ${req.customer_name || "there"}, regarding your photo sourcing request at Urban Vault...`,
              )}`;

              return (
                <div
                  key={req.id}
                  className="flex flex-col justify-between rounded-xl border border-border bg-card p-3.5 shadow-xs min-w-0 max-w-full overflow-hidden"
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
  );
}
