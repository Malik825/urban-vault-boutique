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
      { title: "Store settings — Voltix branding, WhatsApp & SEO" },
      {
        name: "description",
        content:
          "Configure store branding, theme colours, social links, WhatsApp number, delivery options and SEO defaults.",
      },
      { property: "og:title", content: "Store settings — Voltix" },
      { property: "og:description", content: "Branding, WhatsApp, delivery and SEO configuration." },
    ],
  }),
  component: Settings,
});

const swatches = ["#10B981", "#059669", "#047857", "#0EA5E9", "#111827"];

function Settings() {
  return (
    <DashboardShell
      title="Settings"
      subtitle="Everything that shapes how your storefront looks and replies."
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
              className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl border-2 border-dashed border-border bg-surface-muted text-muted-foreground transition-colors hover:border-primary/50"
            >
              <ImagePlus className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1 space-y-2">
              <Label htmlFor="store-name">Store name</Label>
              <Input id="store-name" defaultValue={STORE.name} />
            </div>
          </div>
          <div className="mt-5 space-y-2">
            <Label>Theme colour</Label>
            <div className="flex gap-2">
              {swatches.map((c, i) => (
                <button
                  key={c}
                  aria-label={`Theme colour ${c}`}
                  onClick={() => toast.success(`Theme colour set to ${c}`)}
                  style={{ backgroundColor: c }}
                  className={`h-9 w-9 rounded-full border-2 transition-transform hover:scale-105 ${
                    i === 0 ? "border-foreground" : "border-transparent"
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
                defaultValue="Hi Voltix, I'm interested in this device — is it available?"
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
                <Input id={s} placeholder={`voltix.${s.slice(0, 2).toLowerCase()}`} />
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Payments & delivery" subtitle="Displayed at enquiry time">
          <div className="space-y-3">
            {["Bank transfer", "Card on delivery", "Cash at counter", "Pay in instalments"].map(
              (m, i) => (
                <div
                  key={m}
                  className="flex items-center justify-between rounded-xl border border-border p-3.5"
                >
                  <span className="text-sm font-medium">{m}</span>
                  <Switch defaultChecked={i < 3} />
                </div>
              ),
            )}
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="lagos">Lagos delivery fee (₦)</Label>
              <Input id="lagos" defaultValue="5000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nation">Nationwide fee (₦)</Label>
              <Input id="nation" defaultValue="12000" />
            </div>
          </div>
        </Panel>

        <Panel title="SEO defaults" subtitle="Used when a listing has no override" className="lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="seo-t">Default page title</Label>
              <Input id="seo-t" defaultValue="Voltix — Premium Laptops, Phones & Gadgets" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seo-k">Focus keywords</Label>
              <Input id="seo-k" defaultValue="laptops lagos, refurbished iphone, gaming laptop" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="seo-d">Default meta description</Label>
              <Textarea
                id="seo-d"
                rows={3}
                defaultValue="Browse verified laptops, phones and gadgets with real stock levels and full specs. Enquire instantly on WhatsApp."
              />
            </div>
          </div>
        </Panel>
      </div>
    </DashboardShell>
  );
}
