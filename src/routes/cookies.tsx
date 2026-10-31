import { createFileRoute, Link } from "@tanstack/react-router";
import { Cookie, ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/storefront/site-header";
import { SiteFooter } from "@/components/storefront/site-footer";
import { STORE } from "@/lib/store-data";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: `Cookie Policy — ${STORE.name}` },
      {
        name: "description",
        content: `Learn how ${STORE.name} uses cookies and similar technologies on our website.`,
      },
      { property: "og:url", content: `${STORE.siteUrl}/cookies` },
    ],
    links: [{ rel: "canonical", href: `${STORE.siteUrl}/cookies` }],
  }),
  component: CookiesPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="text-lg font-bold text-foreground mb-3">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-3">{children}</div>
    </div>
  );
}

const cookieTypes = [
  {
    name: "Essential / Strictly Necessary",
    purpose: "Required for the website to function. These include your shopping cart session, authentication tokens, and checkout state.",
    canDisable: false,
  },
  {
    name: "Functional / Preference",
    purpose: "Remember your preferences such as dark/light mode, dismissed banners, and sidebar state to give you a consistent experience.",
    canDisable: true,
  },
  {
    name: "Analytics",
    purpose: "Help us understand how visitors interact with our website (page views, product clicks, checkout funnel). Data is anonymised and never sold.",
    canDisable: true,
  },
  {
    name: "Marketing / Retargeting",
    purpose: "Used by advertising platforms (e.g. Meta Pixel) to show you relevant ads across social media. These are only active if you have given explicit consent.",
    canDisable: true,
  },
];

function CookiesPage() {
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
              <Cookie className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Legal</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-2">
            Cookie Policy
          </h1>
          <p className="text-sm text-muted-foreground mb-12">
            Last updated: October 2026 &nbsp;·&nbsp; {STORE.name}, Assin Fosu, Central Region, Ghana.
          </p>

          <Section title="1. What Are Cookies?">
            <p>
              Cookies are small text files placed on your device when you visit a website. They help websites remember your preferences, keep you signed in, and improve your overall experience. Cookies do not contain personally identifiable information unless you have provided it to us.
            </p>
          </Section>

          <Section title="2. How We Use Cookies">
            <p>
              {STORE.name} uses cookies and similar technologies (local storage, session storage) to provide, secure, and improve our online boutique experience. We use both session cookies (deleted when you close your browser) and persistent cookies (remain for a set period).
            </p>
          </Section>

          <Section title="3. Types of Cookies We Use">
            <div className="space-y-4">
              {cookieTypes.map((c) => (
                <div key={c.name} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="font-semibold text-foreground text-sm">{c.name}</p>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${c.canDisable ? "bg-amber-500/10 text-amber-600" : "bg-primary/10 text-primary"}`}>
                      {c.canDisable ? "Optional" : "Required"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{c.purpose}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="4. Third-Party Cookies">
            <p>Some cookies are set by third-party services we use to provide our platform:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><span className="font-semibold text-foreground">Supabase</span> — authentication and session management</li>
              <li><span className="font-semibold text-foreground">Paystack</span> — secure payment processing</li>
              <li><span className="font-semibold text-foreground">Vercel</span> — performance and security analytics</li>
              <li><span className="font-semibold text-foreground">Meta Pixel</span> (if enabled) — advertising measurement</li>
            </ul>
            <p>These third parties have their own privacy and cookie policies which we encourage you to review.</p>
          </Section>

          <Section title="5. Managing & Disabling Cookies">
            <p>You can control and manage cookies through your browser settings. Most browsers allow you to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>View which cookies are stored</li>
              <li>Delete cookies individually or all at once</li>
              <li>Block cookies from specific or all websites</li>
            </ul>
            <p>Please note that disabling essential cookies may affect the functionality of our website (e.g. cart and checkout may not work correctly).</p>
          </Section>

          <Section title="6. Your Consent">
            <p>By continuing to use our website, you consent to our use of cookies as described in this policy. Where required, we will seek your explicit consent before placing non-essential cookies.</p>
          </Section>

          <Section title="7. Updates to This Policy">
            <p>We may update this Cookie Policy from time to time. Any changes will be reflected on this page with an updated date.</p>
          </Section>

          <Section title="8. Contact">
            <p>
              For questions about our cookie practices:<br />
              <span className="font-semibold text-foreground">Email:</span> {STORE.email}<br />
              <span className="font-semibold text-foreground">WhatsApp:</span> {STORE.whatsapp}
            </p>
          </Section>

          <div className="flex flex-wrap gap-4 pt-8 border-t border-border text-sm text-muted-foreground">
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms &amp; Conditions →</Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy →</Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
