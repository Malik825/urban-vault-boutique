import { createFileRoute } from "@tanstack/react-router";
import { Heart, MessageCircle, Receipt, User } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { adminListCustomers } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/dashboard/customers")({
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
  loader: async () => {
    try {
      return await adminListCustomers();
    } catch {
      return [];
    }
  },
  component: Customers,
});

function Customers() {
  const profiles = Route.useLoaderData();

  return (
    <DashboardShell
      title="Customers"
      subtitle={`${profiles.length} registered shoppers`}
    >
      {profiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <User className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="font-display text-base font-bold">No customers yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Customers will appear here once they sign up.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {profiles.map((c) => {
            const initials = (c.full_name ?? "?")
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);
            return (
              <article
                key={c.id}
                className="hover-lift rounded-2xl border border-border bg-card p-5 shadow-card"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar className="h-11 w-11 shrink-0">
                    <AvatarFallback className="bg-primary-soft font-bold text-accent-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h2 className="truncate font-display text-base font-bold">
                      {c.full_name ?? "Anonymous"}
                    </h2>
                    <p className="truncate text-xs text-muted-foreground">
                      {c.phone ?? "No phone on record"}
                    </p>
                  </div>
                </div>

                <Badge variant="outline" className="mt-4 rounded-md text-xs">
                  Last seen {new Date(c.updated_at).toLocaleDateString("en-GH")}
                </Badge>

                <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4 text-center">
                  <Stat icon={Receipt} value="—" label="Orders" />
                  <Stat icon={MessageCircle} value="—" label="Enquiries" />
                  <Stat icon={Heart} value="—" label="Wishlist" />
                </dl>
              </article>
            );
          })}
        </div>
      )}
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


