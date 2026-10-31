import { Link } from "@tanstack/react-router";
import { LayoutGrid, MessageCircle, Mail, MapPin, ShieldCheck, Truck, CreditCard } from "lucide-react";

import { STORE, categories, brands, whatsappLink } from "@/lib/store-data";
import { Badge } from "@/components/ui/badge";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface-muted/80">
      {/* African Commerce Trust Strip */}
      <div className="border-b border-border bg-card/60 py-6">
        <div className="mx-auto max-w-7xl container-x">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <MessageCircle className="h-4 w-4" />
              </span>
              <div>
                <p className="font-bold text-foreground">WhatsApp Commerce</p>
                <p className="text-muted-foreground">Order or enquire in 1-tap</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-amber-500/10 text-amber-600">
                <CreditCard className="h-4 w-4" />
              </span>
              <div>
                <p className="font-bold text-foreground">MoMo &amp; Cards</p>
                <p className="text-muted-foreground">MTN MoMo, Telecel, Paystack</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Truck className="h-4 w-4" />
              </span>
              <div>
                <p className="font-bold text-foreground">Local &amp; Regional Delivery</p>
                <p className="text-muted-foreground">Assin Fosu, Kumasi, Accra &amp; nationwide</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blue-500/10 text-blue-600">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <div>
                <p className="font-bold text-foreground">Verified Authentic</p>
                <p className="text-muted-foreground">100% genuine boutique quality</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl container-x py-12 sm:py-14">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr_1.1fr]">
          {/* Brand Info */}
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient text-primary-foreground shadow-glow">
                <LayoutGrid className="h-4 w-4" />
              </span>
              <div className="flex items-center gap-2">
                <span className="font-display text-lg font-extrabold">{STORE.name}</span>
              </div>
            </div>
            <p className="mt-3.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {STORE.tagline}. Curated streetwear, footwear and unisex fashion with doorstep delivery across Ghana.
            </p>
            <div className="mt-5 space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-primary" /> {STORE.address}
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-primary" /> {STORE.email}
              </p>
              <a
                href={whatsappLink(`Hello ${STORE.name}, I'd like to make an enquiry.`)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 font-medium text-primary hover:underline"
              >
                <MessageCircle className="h-4 w-4 shrink-0" /> WhatsApp: {STORE.whatsapp}
              </a>
            </div>

            {/* Payment Integrations Accepted Preview */}
            <div className="mt-5 pt-4 border-t border-border">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                Payment methods accepted
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-md border border-border bg-card px-2.5 py-1 font-semibold text-foreground">
                  Cash on Delivery
                </span>
                <span className="rounded-md border border-border bg-card px-2.5 py-1 font-semibold text-foreground">
                  Paystack
                </span>
                <span className="rounded-md border border-border bg-card px-2.5 py-1 font-semibold text-foreground">
                  MTN MoMo
                </span>
                <span className="rounded-md border border-border bg-card px-2.5 py-1 font-semibold text-foreground">
                  Telecel Cash
                </span>
                <span className="rounded-md border border-border bg-card px-2.5 py-1 font-semibold text-foreground">
                  Visa / Mastercard
                </span>
              </div>
            </div>
          </div>

          {/* Shop Categories */}
          <FooterCol
            title="Shop Catalogue"
            items={categories.slice(0, 6).map((c) => ({ label: c.name, search: { category: c.name } }))}
          />

          {/* Brands */}
          <FooterCol
            title="Popular Brands"
            items={brands.slice(0, 6).map((b) => ({ label: b.name, search: { brand: b.name } }))}
          />

          {/* Info & Solution */}
          <div>
            <h4 className="text-sm font-semibold text-foreground">Quick Links</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link to="/about" className="transition-colors hover:text-foreground">
                  About {STORE.secondaryName || STORE.name}
                </Link>
              </li>
              <li>
                <Link to="/faqs" className="transition-colors hover:text-foreground">
                  Delivery &amp; FAQs
                </Link>
              </li>
              <li>
                <Link to="/products" search={{ deals: true }} className="transition-colors hover:text-foreground">
                  Flash Deals
                </Link>
              </li>
              <li>
                <a
                  href={whatsappLink(`Hello ${STORE.name}! I'd like to place an order or get assistance.`)}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-foreground text-primary font-medium"
                >
                  Contact Us on WhatsApp →
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-foreground">Legal</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link to="/terms" className="transition-colors hover:text-foreground">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="transition-colors hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="transition-colors hover:text-foreground">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {STORE.name} · Curated unisex fashion &amp; streetwear, Assin Fosu, Ghana.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/cookies" className="hover:text-foreground transition-colors">Cookies</Link>
          </div>
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
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
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
