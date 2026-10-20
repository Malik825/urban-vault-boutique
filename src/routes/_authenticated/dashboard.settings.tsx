import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ImagePlus, MessageCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Panel } from "./dashboard.index";
import { STORE } from "@/lib/store-data";

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
  "#10B981", "#059669", "#047857", "#0EA5E9", "#111827",
  "#8B5CF6", "#F43F5E", "#F59E0B", "#09090B"
];

function Settings() {
  const [themeColor, setThemeColor] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("urban-vault-theme-color") || "#10B981";
    }
    return "#10B981";
  });

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
      </div>
    </DashboardShell>
  );
}
