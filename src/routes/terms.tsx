import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/storefront/site-header";
import { SiteFooter } from "@/components/storefront/site-footer";
import { STORE } from "@/lib/store-data";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: `Terms & Conditions — ${STORE.name}` },
      {
        name: "description",
        content: `Read the Terms & Conditions for shopping at ${STORE.name}, Accra Flagship, Ghana.`,
      },
      { property: "og:url", content: `${STORE.siteUrl}/terms` },
    ],
    links: [{ rel: "canonical", href: `${STORE.siteUrl}/terms` }],
  }),
  component: TermsPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="text-lg font-bold text-foreground mb-3">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-3">{children}</div>
    </div>
  );
}

function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="mx-auto max-w-3xl">

          {/* Back */}
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>

          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Legal</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-2">
            Terms &amp; Conditions
          </h1>
          <p className="text-sm text-muted-foreground mb-12">
            Last updated: October 2026 &nbsp;·&nbsp; {STORE.name}, Accra, Greater Accra Region, Ghana.
          </p>

          <Section title="1. Acceptance of Terms">
            <p>
              By accessing our website at <span className="font-semibold text-foreground">{STORE.siteUrl}</span> or placing an order with {STORE.name}, you agree to be bound by these Terms &amp; Conditions. If you do not agree, please do not use our platform or services.
            </p>
          </Section>

          <Section title="2. Products & Availability">
            <p>All products listed on our website are subject to availability. We reserve the right to discontinue any product at any time without notice. Product images are for illustration purposes; minor colour variations may occur due to screen settings.</p>
            <p>Every item sold by {STORE.name} is described to the best of our ability. Customers are encouraged to contact us on WhatsApp ({STORE.whatsapp}) for any clarification before placing an order.</p>
          </Section>

          <Section title="3. Pricing & Currency">
            <p>All prices displayed are in Ghana Cedis (GH₵) and inclusive of applicable taxes. We reserve the right to revise prices at any time. Promotions and discount codes are subject to terms and cannot be combined unless stated.</p>
          </Section>

          <Section title="4. Orders & Payment">
            <p>By submitting an order, you confirm that the information provided is accurate and complete. {STORE.name} reserves the right to refuse or cancel any order at its discretion.</p>
            <p>We accept payment via Paystack (Visa, Mastercard, MTN MoMo, Telecel Cash) and Cash on Delivery (Accra only). Orders are not confirmed until payment is received or Cash on Delivery is agreed upon at checkout.</p>
          </Section>

          <Section title="5. Delivery">
            <p>We offer same-day delivery within Accra and Greater Accra Region, and nationwide tracked courier delivery across Ghana (24–48 hours). Delivery fees and estimated time frames are displayed at checkout. We are not liable for delays caused by third-party courier services, traffic, or adverse weather conditions.</p>
            <p>Free in-store pickup is always available at <span className="font-semibold text-foreground">{STORE.pickupLocation}</span>.</p>
          </Section>

          <Section title="6. Returns & Exchanges">
            <p>We accept size exchange requests within <span className="font-semibold text-foreground">48 hours</span> of delivery, provided the item is unworn and tags are intact. Final sale items and promotional items are non-returnable.</p>
            <p>To initiate an exchange, contact us directly via WhatsApp at {STORE.whatsapp} with your order number and a photo of the item.</p>
          </Section>

          <Section title="7. Intellectual Property">
            <p>All content on this website including text, images, logos, product descriptions, and designs are the intellectual property of {STORE.name} or their respective owners. Unauthorized reproduction or redistribution is strictly prohibited.</p>
          </Section>

          <Section title="8. Limitation of Liability">
            <p>{STORE.name} shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services beyond the value of the original purchase.</p>
          </Section>

          <Section title="9. Governing Law">
            <p>These Terms are governed by the laws of the Republic of Ghana. Any disputes shall be resolved under the jurisdiction of the courts of Ghana.</p>
          </Section>

          <Section title="10. Contact">
            <p>
              For any questions about these Terms, contact us:<br />
              <span className="font-semibold text-foreground">Email:</span> {STORE.email}<br />
              <span className="font-semibold text-foreground">WhatsApp:</span> {STORE.whatsapp}<br />
              <span className="font-semibold text-foreground">Address:</span> {STORE.address}
            </p>
          </Section>

          {/* Legal nav */}
          <div className="flex flex-wrap gap-4 pt-8 border-t border-border text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy →</Link>
            <Link to="/cookies" className="hover:text-foreground transition-colors">Cookie Policy →</Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
