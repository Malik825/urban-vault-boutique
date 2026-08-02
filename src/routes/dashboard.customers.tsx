import { createFileRoute } from "@tanstack/react-router";
import { Heart, MessageCircle, Receipt } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { customers, formatPrice } from "@/lib/store-data";

export const Route = createFileRoute("/dashboard/customers")({
  head: () => ({
    meta: [
      { title: "Customers — Voltix seller dashboard" },
      {
        name: "description",
        content:
          "Customer profiles with WhatsApp enquiries, wishlist activity and purchase history in one view.",
      },
      { property: "og:title", content: "Customers — Voltix seller dashboard" },
      { property: "og:description", content: "Profiles, enquiries, wishlists and purchase history." },
    ],
  }),
  component: Customers,
});

function Customers() {
  return (
    <DashboardShell title="Customers" subtitle="1,284 shoppers · 453 enquiries this month">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {customers.map((c) => (
          <article
            key={c.email}
            className="hover-lift rounded-2xl border border-border bg-card p-5 shadow-card"
          >
            <div className="flex min-w-0 items-center gap-3">
              <Avatar className="h-11 w-11 shrink-0">
                <AvatarFallback className="bg-primary-soft font-bold text-accent-foreground">
                  {c.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h2 className="truncate font-display text-base font-bold">{c.name}</h2>
                <p className="truncate text-xs text-muted-foreground">{c.email}</p>
              </div>
            </div>

            <Badge variant="outline" className="mt-4 rounded-md">
              {c.city}
            </Badge>

            <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4 text-center">
              <Stat icon={Receipt} value={String(c.orders)} label="Orders" />
              <Stat icon={MessageCircle} value={String(c.enquiries)} label="Enquiries" />
              <Stat icon={Heart} value={String(c.wishlist)} label="Wishlist" />
            </dl>

            <p className="mt-4 text-sm">
              <span className="text-muted-foreground">Lifetime spend · </span>
              <span className="font-display font-extrabold">{formatPrice(c.spend)}</span>
            </p>
          </article>
        ))}
      </div>
    </DashboardShell>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Heart;
  value: string;
  label: string;
}) {
  return (
    <div>
      <Icon className="mx-auto h-4 w-4 text-muted-foreground" />
      <dt className="mt-1.5 font-display text-lg font-extrabold">{value}</dt>
      <dd className="text-[11px] text-muted-foreground">{label}</dd>
    </div>
  );
}
