import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock, ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/storefront/site-header";
import { SiteFooter } from "@/components/storefront/site-footer";
import { STORE } from "@/lib/store-data";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: `Privacy Policy — ${STORE.name}` },
      {
        name: "description",
        content: `Read the Privacy Policy for ${STORE.name}. We are committed to protecting your personal data and shopping experience.`,
      },
      { property: "og:url", content: `${STORE.siteUrl}/privacy` },
    ],
    links: [{ rel: "canonical", href: `${STORE.siteUrl}/privacy` }],
  }),
  component: PrivacyPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="text-lg font-bold text-foreground mb-3">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-3">{children}</div>
    </div>
  );
}

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="mx-auto max-w-3xl">

          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>

          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Lock className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Legal</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-2">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground mb-12">
            Last updated: October 2026 &nbsp;·&nbsp; {STORE.name}, Assin Fosu, Central Region, Ghana.
          </p>

          <Section title="1. Who We Are">
            <p>
              {STORE.name} operates an online fashion boutique at <span className="font-semibold text-foreground">{STORE.siteUrl}</span>, based in Assin Fosu, Central Region, Ghana. We are committed to protecting your privacy and handling your personal data responsibly.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <p>When you place an order or interact with our platform, we may collect:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Full name, email address, and phone number</li>
              <li>Delivery address, city, and region</li>
              <li>Order history and payment references (we do not store card numbers or MoMo PINs)</li>
              <li>WhatsApp communication records for customer service</li>
              <li>Device, browser, and usage data via analytics tools</li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Information">
            <p>We use your information to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Process and fulfil your orders and delivery</li>
              <li>Send order confirmation and status updates via email and WhatsApp</li>
              <li>Respond to customer service enquiries</li>
              <li>Improve our website, product catalogue, and user experience</li>
              <li>Send occasional promotional messages (you may opt out at any time)</li>
            </ul>
          </Section>

          <Section title="4. Payments & Data Security">
            <p>All online payments are securely processed by <span className="font-semibold text-foreground">Paystack</span>, which is PCI-DSS compliant. We never store, access, or transmit your card details or Mobile Money PINs on our systems.</p>
          </Section>

          <Section title="5. Third-Party Services">
            <p>We may share necessary order information with trusted third parties to fulfil our services, including:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Paystack — payment processing</li>
              <li>Supabase — secure database and authentication</li>
              <li>Resend — transactional email delivery</li>
              <li>Vercel — website hosting</li>
              <li>Courier and delivery partners for order fulfilment</li>
            </ul>
            <p>We do not sell your personal data to any third party for marketing purposes.</p>
          </Section>

          <Section title="6. Data Retention">
            <p>We retain your order and account data for as long as is necessary to provide our services and comply with applicable law. You may request deletion of your data at any time by contacting us.</p>
          </Section>

          <Section title="7. Your Rights">
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent for marketing communications</li>
            </ul>
            <p>To exercise these rights, contact us at <span className="font-semibold text-foreground">{STORE.email}</span> or WhatsApp <span className="font-semibold text-foreground">{STORE.whatsapp}</span>.</p>
          </Section>

          <Section title="8. Cookies">
            <p>We use cookies and similar technologies to improve your experience. Please read our <Link to="/cookies" className="font-semibold text-primary hover:underline">Cookie Policy</Link> for full details.</p>
          </Section>

          <Section title="9. Changes to This Policy">
            <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date. Continued use of our platform after changes constitutes acceptance of the updated policy.</p>
          </Section>

          <Section title="10. Contact">
            <p>
              For privacy-related enquiries:<br />
              <span className="font-semibold text-foreground">Email:</span> {STORE.email}<br />
              <span className="font-semibold text-foreground">WhatsApp:</span> {STORE.whatsapp}<br />
              <span className="font-semibold text-foreground">Address:</span> {STORE.address}
            </p>
          </Section>

          <div className="flex flex-wrap gap-4 pt-8 border-t border-border text-sm text-muted-foreground">
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms &amp; Conditions →</Link>
            <Link to="/cookies" className="hover:text-foreground transition-colors">Cookie Policy →</Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
