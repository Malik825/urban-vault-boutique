import { Link } from "@tanstack/react-router";
import { LayoutGrid, MessageCircle, Mail, MapPin } from "lucide-react";

import { STORE, categories, brands, whatsappLink } from "@/lib/store-data";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface-muted">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient text-primary-foreground">
                <LayoutGrid className="h-4 w-4" />
              </span>
              <span className="font-display text-lg font-extrabold">{STORE.name}</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              A premium storefront and inventory dashboard built for African electronics retailers.
              Real stock, real specs, instant WhatsApp enquiries.
            </p>
            <div className="mt-5 space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" /> {STORE.city}
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" /> {STORE.email}
              </p>
              <a
                href={whatsappLink("Hi Voltix, I have a question about a device.")}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 font-medium text-accent-foreground hover:underline"
              >
                <MessageCircle className="h-4 w-4 shrink-0" /> {STORE.whatsapp}
              </a>
            </div>
          </div>

          <FooterCol
            title="Shop"
            items={categories.map((c) => ({ label: c.name, search: { category: c.name } }))}
          />
          <FooterCol
            title="Brands"
            items={brands.slice(0, 5).map((b) => ({ label: b.name, search: { brand: b.name } }))}
          />

          <div>
            <h4 className="text-sm font-semibold">Company</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              {["About Voltix", "Warranty policy", "Delivery & pickup", "Bulk & corporate", "Support"].map(
                (l) => (
                  <li key={l}>
                    <span className="cursor-pointer transition-colors hover:text-foreground">
                      {l}
                    </span>
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Voltix Commerce. All rights reserved.</p>
          <p>Built for retailers in Lagos, Accra, Nairobi and beyond.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  items,
}: {
  title: string;
  items: { label: string; search: Record<string, string> }[];
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold">{title}</h4>
      <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
        {items.map((i) => (
          <li key={i.label}>
            <Link
              to="/products"
              search={i.search as never}
              className="transition-colors hover:text-foreground"
            >
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
