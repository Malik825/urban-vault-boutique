import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useState, useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Ghost, Home, RefreshCw, X, Truck } from "lucide-react";

import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/lib/cart";
import { AuthProvider } from "@/lib/auth";
import { WishlistProvider, CompareProvider } from "@/lib/user-store";
import { MobileNav } from "@/components/storefront/mobile-nav";
import { useReferralTracking } from "@/lib/referral";
import { STORE, whatsappLink } from "@/lib/store-data";

/* ── Announcement Banner ───────────────────────────────────── */
const BANNER_KEY = "uv-banner-dismissed-v1";

function AnnouncementBanner() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const dismissed = sessionStorage.getItem(BANNER_KEY);
    if (!dismissed) setVisible(true);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(BANNER_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="banner"
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="overflow-hidden"
      >
        <div className="relative flex items-center justify-center gap-2 bg-primary px-4 py-2 text-primary-foreground text-xs font-semibold">
          <Truck className="h-3.5 w-3.5 shrink-0" />
          <span>
            Free delivery on orders over <strong>GH₵ 500</strong> in Assin Fosu &amp; Central Region &nbsp;·&nbsp; Call/WhatsApp:{" "}
            <a href={`tel:${STORE.whatsappRaw}`} className="underline underline-offset-2">
              {STORE.whatsapp}
            </a>
          </span>
          <button
            onClick={dismiss}
            aria-label="Dismiss banner"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 hover:bg-primary-foreground/20 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Floating WhatsApp Button ──────────────────────────────── */
function WhatsAppFloat() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hide = pathname.startsWith("/dashboard") || pathname.startsWith("/checkout");
  if (hide) return null;

  return (
    <motion.a
      href={whatsappLink("Hello Urban Vault! I need help with an order.")}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.5, type: "spring", stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-20 right-4 sm:bottom-6 z-50 flex h-13 w-13 items-center justify-center rounded-full shadow-xl"
      style={{ background: "#25D366" }}
    >
      {/* WhatsApp SVG icon — uses the brand green, no dependency */}
      <svg viewBox="0 0 32 32" className="h-7 w-7 fill-white" aria-hidden="true">
        <path d="M16.003 2.667C8.637 2.667 2.667 8.636 2.667 16c0 2.362.633 4.669 1.837 6.692L2.667 29.333l6.8-1.796A13.27 13.27 0 0 0 16.003 29.333c7.366 0 13.33-5.97 13.33-13.333 0-7.364-5.964-13.333-13.33-13.333zm0 24.267a11.025 11.025 0 0 1-5.61-1.54l-.403-.238-4.033 1.065 1.075-3.934-.263-.42a11.01 11.01 0 0 1-1.698-5.867c0-6.076 4.94-11.013 11.013-11.013S27.017 9.924 27.017 16c-.001 6.075-4.94 11.012-11.014 11.012-.001 0 .001 0 0 0zm6.04-8.25c-.33-.165-1.953-.962-2.257-1.073-.303-.11-.524-.165-.743.165-.22.33-.852 1.073-1.043 1.293-.192.22-.384.247-.714.082-.33-.165-1.394-.514-2.655-1.638-.981-.875-1.644-1.956-1.835-2.286-.192-.33-.021-.51.144-.674.149-.149.33-.385.495-.578.165-.192.22-.33.33-.55.11-.22.055-.413-.027-.578-.083-.165-.744-1.793-1.02-2.454-.267-.644-.54-.556-.743-.567l-.632-.012c-.22 0-.578.082-.88.413-.302.33-1.155 1.128-1.155 2.754 0 1.626 1.183 3.196 1.348 3.416.165.22 2.328 3.556 5.643 4.988.788.341 1.403.544 1.883.697.791.251 1.511.216 2.08.131.634-.094 1.953-.799 2.228-1.57.275-.771.275-1.434.193-1.57-.083-.138-.303-.22-.633-.385z"/>
      </svg>
      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: "#25D366" }} />
    </motion.a>
  );
}


function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md text-center flex flex-col items-center"
      >
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 mb-6">
          <Ghost className="h-12 w-12 text-primary animate-pulse" />
        </div>
        <h1 className="text-7xl font-extrabold text-foreground tracking-tighter">404</h1>
        <h2 className="mt-4 text-2xl font-bold text-foreground">Lost in cyberspace?</h2>
        <p className="mt-3 text-base text-muted-foreground leading-relaxed">
          The page you're looking for doesn't exist, has been moved, or is currently unavailable.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-bold text-primary-foreground transition-all hover:bg-primary-deep shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <Home className="mr-2 h-4 w-4" />
            Back to Safety
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg text-center"
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 mb-6">
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          System Malfunction
        </h1>
        <p className="mt-3 text-base text-muted-foreground leading-relaxed">
          We encountered an unexpected error while loading this page. 
        </p>
        
        <div className="mt-6 text-left w-full overflow-hidden rounded-xl border border-border bg-surface-muted/50 p-4 shadow-inner">
          <p className="text-xs font-semibold text-destructive mb-2 uppercase tracking-wider">Error Details</p>
          <pre className="text-xs text-muted-foreground font-mono overflow-x-auto whitespace-pre-wrap max-h-32">
            {error.message || "Unknown error occurred"}
          </pre>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-8 text-sm font-bold text-primary-foreground transition-all hover:bg-primary-deep shadow-md hover:-translate-y-0.5"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </button>
          <Link
            to="/"
            className="inline-flex h-11 items-center justify-center rounded-full bg-surface px-8 text-sm font-bold text-foreground transition-all hover:bg-surface-muted border border-border shadow-sm hover:-translate-y-0.5"
            onClick={() => reset()}
          >
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: `${STORE.name} — Modern Fashion Boutique, Assin Fosu Ghana` },
      {
        name: "description",
        content:
          `${STORE.name} — Curated streetwear, designer footwear, and contemporary unisex essentials in Assin Fosu, Central Region, Ghana. Same-day showroom pickup, Paystack, Mobile Money, and nationwide delivery.`,
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: STORE.secondaryName },
      { property: "og:url", content: STORE.siteUrl },
      { property: "og:image", content: `${STORE.siteUrl}${STORE.logoUrl}` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@urbanvaultgh" },
      { name: "twitter:image", content: `${STORE.siteUrl}${STORE.logoUrl}` },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "canonical", href: STORE.siteUrl },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "preconnect", href: "https://api.fontshare.com" },
      { rel: "preconnect", href: "https://cdn.fontshare.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=Space+Grotesk:wght@300..700&display=swap",
      },
      {
        rel: "stylesheet",
        href: "https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,300,400&display=swap",
      },
      { rel: "icon", href: STORE.logoUrl || "/logo.jpg", type: "image/webp" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});


function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var mode = localStorage.getItem("urban-vault-theme-mode") || localStorage.getItem("voltix-theme-mode");
                  var isDark = mode === "dark" || (mode !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
                  if (isDark) document.documentElement.classList.add("dark");
                  else document.documentElement.classList.remove("dark");

                  var color = localStorage.getItem("urban-vault-theme-color") || localStorage.getItem("voltix-theme-color") || "#F43F5E";
                  var presets = {
                    "#10B981": {"--primary":"oklch(0.696 0.149 162.48)","--color-primary":"oklch(0.696 0.149 162.48)","--primary-foreground":"oklch(0.99 0 0)","--color-primary-foreground":"oklch(0.99 0 0)","--primary-deep":"oklch(0.596 0.132 163.2)","--primary-soft":"oklch(0.958 0.033 164)","--accent":"oklch(0.958 0.033 164)","--accent-foreground":"oklch(0.44 0.1 163)","--ring":"oklch(0.696 0.149 162.48)"},
                    "#059669": {"--primary":"oklch(0.6 0.14 165)","--color-primary":"oklch(0.6 0.14 165)","--primary-foreground":"oklch(0.99 0 0)","--primary-deep":"oklch(0.52 0.12 165)","--primary-soft":"oklch(0.94 0.03 165)","--accent":"oklch(0.94 0.03 165)","--accent-foreground":"oklch(0.44 0.11 165)","--ring":"oklch(0.6 0.14 165)"},
                    "#047857": {"--primary":"oklch(0.51 0.12 170)","--color-primary":"oklch(0.51 0.12 170)","--primary-foreground":"oklch(0.99 0 0)","--primary-deep":"oklch(0.43 0.11 170)","--primary-soft":"oklch(0.93 0.03 170)","--accent":"oklch(0.93 0.03 170)","--accent-foreground":"oklch(0.35 0.08 170)","--ring":"oklch(0.51 0.12 170)"},
                    "#0EA5E9": {"--primary":"oklch(0.69 0.14 230)","--color-primary":"oklch(0.69 0.14 230)","--primary-foreground":"oklch(0.99 0 0)","--primary-deep":"oklch(0.59 0.13 230)","--primary-soft":"oklch(0.95 0.03 230)","--accent":"oklch(0.95 0.03 230)","--accent-foreground":"oklch(0.44 0.1 230)","--ring":"oklch(0.69 0.14 230)"},
                    "#111827": {"--primary":"oklch(0.21 0.02 258)","--color-primary":"oklch(0.21 0.02 258)","--primary-foreground":"oklch(0.99 0 0)","--primary-deep":"oklch(0.15 0.02 258)","--primary-soft":"oklch(0.92 0.01 258)","--accent":"oklch(0.92 0.01 258)","--accent-foreground":"oklch(0.21 0.02 258)","--ring":"oklch(0.21 0.02 258)"},
                    "#8B5CF6": {"--primary":"oklch(0.6 0.2 285)","--color-primary":"oklch(0.6 0.2 285)","--primary-foreground":"oklch(0.99 0 0)","--primary-deep":"oklch(0.5 0.18 285)","--primary-soft":"oklch(0.95 0.03 285)","--accent":"oklch(0.95 0.03 285)","--accent-foreground":"oklch(0.4 0.15 285)","--ring":"oklch(0.6 0.2 285)"},
                    "#F43F5E": {"--primary":"oklch(0.65 0.23 16)","--color-primary":"oklch(0.65 0.23 16)","--primary-foreground":"oklch(0.99 0 0)","--primary-deep":"oklch(0.55 0.2 16)","--primary-soft":"oklch(0.95 0.03 16)","--accent":"oklch(0.95 0.03 16)","--accent-foreground":"oklch(0.45 0.15 16)","--ring":"oklch(0.65 0.23 16)"},
                    "#F59E0B": {"--primary":"oklch(0.75 0.18 55)","--color-primary":"oklch(0.75 0.18 55)","--primary-foreground":"oklch(0.2 0.05 55)","--primary-deep":"oklch(0.65 0.16 55)","--primary-soft":"oklch(0.95 0.04 55)","--accent":"oklch(0.95 0.04 55)","--accent-foreground":"oklch(0.55 0.14 55)","--ring":"oklch(0.75 0.18 55)"},
                    "#09090B": {"--primary":"oklch(0.14 0.01 285)","--color-primary":"oklch(0.14 0.01 285)","--primary-foreground":"oklch(0.99 0 0)","--primary-deep":"oklch(0.2 0.01 285)","--primary-soft":"oklch(0.95 0.01 285)","--accent":"oklch(0.95 0.01 285)","--accent-foreground":"oklch(0.14 0.01 285)","--ring":"oklch(0.14 0.01 285)"}
                  };
                  var p = presets[color];
                  if (p) {
                    for (var k in p) {
                      document.documentElement.style.setProperty(k, p[k]);
                    }
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

const THEME_PRESETS: Record<string, Record<string, string>> = {
  "#10B981": {
    "--primary": "oklch(0.696 0.149 162.48)",
    "--color-primary": "oklch(0.696 0.149 162.48)",
    "--primary-foreground": "oklch(0.99 0 0)",
    "--color-primary-foreground": "oklch(0.99 0 0)",
    "--primary-deep": "oklch(0.596 0.132 163.2)",
    "--color-primary-deep": "oklch(0.596 0.132 163.2)",
    "--primary-dark": "oklch(0.508 0.113 163.6)",
    "--color-primary-dark": "oklch(0.508 0.113 163.6)",
    "--primary-soft": "oklch(0.958 0.033 164)",
    "--color-primary-soft": "oklch(0.958 0.033 164)",
    "--accent": "oklch(0.958 0.033 164)",
    "--color-accent": "oklch(0.958 0.033 164)",
    "--accent-foreground": "oklch(0.44 0.1 163)",
    "--color-accent-foreground": "oklch(0.44 0.1 163)",
    "--ring": "oklch(0.696 0.149 162.48)",
    "--color-ring": "oklch(0.696 0.149 162.48)",
    "--chart-1": "oklch(0.696 0.149 162.48)",
    "--color-chart-1": "oklch(0.696 0.149 162.48)",
    "--chart-2": "oklch(0.508 0.113 163.6)",
    "--color-chart-2": "oklch(0.508 0.113 163.6)",
  },
  "#059669": {
    "--primary": "oklch(0.6 0.14 165)",
    "--color-primary": "oklch(0.6 0.14 165)",
    "--primary-foreground": "oklch(0.99 0 0)",
    "--color-primary-foreground": "oklch(0.99 0 0)",
    "--primary-deep": "oklch(0.52 0.12 165)",
    "--color-primary-deep": "oklch(0.52 0.12 165)",
    "--primary-dark": "oklch(0.44 0.11 165)",
    "--color-primary-dark": "oklch(0.44 0.11 165)",
    "--primary-soft": "oklch(0.94 0.03 165)",
    "--color-primary-soft": "oklch(0.94 0.03 165)",
    "--accent": "oklch(0.94 0.03 165)",
    "--color-accent": "oklch(0.94 0.03 165)",
    "--accent-foreground": "oklch(0.44 0.11 165)",
    "--color-accent-foreground": "oklch(0.44 0.11 165)",
    "--ring": "oklch(0.6 0.14 165)",
    "--color-ring": "oklch(0.6 0.14 165)",
    "--chart-1": "oklch(0.6 0.14 165)",
    "--color-chart-1": "oklch(0.6 0.14 165)",
    "--chart-2": "oklch(0.44 0.11 165)",
    "--color-chart-2": "oklch(0.44 0.11 165)",
  },
  "#047857": {
    "--primary": "oklch(0.51 0.12 170)",
    "--color-primary": "oklch(0.51 0.12 170)",
    "--primary-foreground": "oklch(0.99 0 0)",
    "--color-primary-foreground": "oklch(0.99 0 0)",
    "--primary-deep": "oklch(0.43 0.11 170)",
    "--color-primary-deep": "oklch(0.43 0.11 170)",
    "--primary-dark": "oklch(0.35 0.09 170)",
    "--color-primary-dark": "oklch(0.35 0.09 170)",
    "--primary-soft": "oklch(0.93 0.03 170)",
    "--color-primary-soft": "oklch(0.93 0.03 170)",
    "--accent": "oklch(0.93 0.03 170)",
    "--color-accent": "oklch(0.93 0.03 170)",
    "--accent-foreground": "oklch(0.35 0.08 170)",
    "--color-accent-foreground": "oklch(0.35 0.08 170)",
    "--ring": "oklch(0.51 0.12 170)",
    "--color-ring": "oklch(0.51 0.12 170)",
    "--chart-1": "oklch(0.51 0.12 170)",
    "--color-chart-1": "oklch(0.51 0.12 170)",
    "--chart-2": "oklch(0.35 0.09 170)",
    "--color-chart-2": "oklch(0.35 0.09 170)",
  },
  "#0EA5E9": {
    "--primary": "oklch(0.69 0.14 230)",
    "--color-primary": "oklch(0.69 0.14 230)",
    "--primary-foreground": "oklch(0.99 0 0)",
    "--color-primary-foreground": "oklch(0.99 0 0)",
    "--primary-deep": "oklch(0.59 0.13 230)",
    "--color-primary-deep": "oklch(0.59 0.13 230)",
    "--primary-dark": "oklch(0.50 0.11 230)",
    "--color-primary-dark": "oklch(0.50 0.11 230)",
    "--primary-soft": "oklch(0.95 0.03 230)",
    "--color-primary-soft": "oklch(0.95 0.03 230)",
    "--accent": "oklch(0.95 0.03 230)",
    "--color-accent": "oklch(0.95 0.03 230)",
    "--accent-foreground": "oklch(0.44 0.1 230)",
    "--color-accent-foreground": "oklch(0.44 0.1 230)",
    "--ring": "oklch(0.69 0.14 230)",
    "--color-ring": "oklch(0.69 0.14 230)",
    "--chart-1": "oklch(0.69 0.14 230)",
    "--color-chart-1": "oklch(0.69 0.14 230)",
    "--chart-2": "oklch(0.50 0.11 230)",
    "--color-chart-2": "oklch(0.50 0.11 230)",
  },
  "#111827": {
    "--primary": "oklch(0.21 0.02 258)",
    "--color-primary": "oklch(0.21 0.02 258)",
    "--primary-foreground": "oklch(0.99 0 0)",
    "--color-primary-foreground": "oklch(0.99 0 0)",
    "--primary-deep": "oklch(0.15 0.02 258)",
    "--color-primary-deep": "oklch(0.15 0.02 258)",
    "--primary-dark": "oklch(0.1 0.02 258)",
    "--color-primary-dark": "oklch(0.1 0.02 258)",
    "--primary-soft": "oklch(0.92 0.01 258)",
    "--color-primary-soft": "oklch(0.92 0.01 258)",
    "--accent": "oklch(0.92 0.01 258)",
    "--color-accent": "oklch(0.92 0.01 258)",
    "--accent-foreground": "oklch(0.21 0.02 258)",
    "--color-accent-foreground": "oklch(0.21 0.02 258)",
    "--ring": "oklch(0.21 0.02 258)",
    "--color-ring": "oklch(0.21 0.02 258)",
    "--chart-1": "oklch(0.21 0.02 258)",
    "--color-chart-1": "oklch(0.21 0.02 258)",
    "--chart-2": "oklch(0.1 0.02 258)",
    "--color-chart-2": "oklch(0.1 0.02 258)",
  },
  "#8B5CF6": {
    "--primary": "oklch(0.6 0.2 285)",
    "--color-primary": "oklch(0.6 0.2 285)",
    "--primary-foreground": "oklch(0.99 0 0)",
    "--color-primary-foreground": "oklch(0.99 0 0)",
    "--primary-deep": "oklch(0.5 0.18 285)",
    "--color-primary-deep": "oklch(0.5 0.18 285)",
    "--primary-dark": "oklch(0.4 0.15 285)",
    "--color-primary-dark": "oklch(0.4 0.15 285)",
    "--primary-soft": "oklch(0.95 0.03 285)",
    "--color-primary-soft": "oklch(0.95 0.03 285)",
    "--accent": "oklch(0.95 0.03 285)",
    "--color-accent": "oklch(0.95 0.03 285)",
    "--accent-foreground": "oklch(0.4 0.15 285)",
    "--color-accent-foreground": "oklch(0.4 0.15 285)",
    "--ring": "oklch(0.6 0.2 285)",
    "--color-ring": "oklch(0.6 0.2 285)",
    "--chart-1": "oklch(0.6 0.2 285)",
    "--color-chart-1": "oklch(0.6 0.2 285)",
    "--chart-2": "oklch(0.4 0.15 285)",
    "--color-chart-2": "oklch(0.4 0.15 285)",
  },
  "#F43F5E": {
    "--primary": "oklch(0.65 0.23 16)",
    "--color-primary": "oklch(0.65 0.23 16)",
    "--primary-foreground": "oklch(0.99 0 0)",
    "--color-primary-foreground": "oklch(0.99 0 0)",
    "--primary-deep": "oklch(0.55 0.2 16)",
    "--color-primary-deep": "oklch(0.55 0.2 16)",
    "--primary-dark": "oklch(0.45 0.15 16)",
    "--color-primary-dark": "oklch(0.45 0.15 16)",
    "--primary-soft": "oklch(0.95 0.03 16)",
    "--color-primary-soft": "oklch(0.95 0.03 16)",
    "--accent": "oklch(0.95 0.03 16)",
    "--color-accent": "oklch(0.95 0.03 16)",
    "--accent-foreground": "oklch(0.45 0.15 16)",
    "--color-accent-foreground": "oklch(0.45 0.15 16)",
    "--ring": "oklch(0.65 0.23 16)",
    "--color-ring": "oklch(0.65 0.23 16)",
    "--chart-1": "oklch(0.65 0.23 16)",
    "--color-chart-1": "oklch(0.65 0.23 16)",
    "--chart-2": "oklch(0.45 0.15 16)",
    "--color-chart-2": "oklch(0.45 0.15 16)",
  },
  "#F59E0B": {
    "--primary": "oklch(0.75 0.18 55)",
    "--color-primary": "oklch(0.75 0.18 55)",
    "--primary-foreground": "oklch(0.2 0.05 55)",
    "--color-primary-foreground": "oklch(0.2 0.05 55)",
    "--primary-deep": "oklch(0.65 0.16 55)",
    "--color-primary-deep": "oklch(0.65 0.16 55)",
    "--primary-dark": "oklch(0.55 0.14 55)",
    "--color-primary-dark": "oklch(0.55 0.14 55)",
    "--primary-soft": "oklch(0.95 0.04 55)",
    "--color-primary-soft": "oklch(0.95 0.04 55)",
    "--accent": "oklch(0.95 0.04 55)",
    "--color-accent": "oklch(0.95 0.04 55)",
    "--accent-foreground": "oklch(0.55 0.14 55)",
    "--color-accent-foreground": "oklch(0.55 0.14 55)",
    "--ring": "oklch(0.75 0.18 55)",
    "--color-ring": "oklch(0.75 0.18 55)",
    "--chart-1": "oklch(0.75 0.18 55)",
    "--color-chart-1": "oklch(0.75 0.18 55)",
    "--chart-2": "oklch(0.55 0.14 55)",
    "--color-chart-2": "oklch(0.55 0.14 55)",
  },
  "#09090B": {
    "--primary": "oklch(0.14 0.01 285)",
    "--color-primary": "oklch(0.14 0.01 285)",
    "--primary-foreground": "oklch(0.99 0 0)",
    "--color-primary-foreground": "oklch(0.99 0 0)",
    "--primary-deep": "oklch(0.2 0.01 285)",
    "--color-primary-deep": "oklch(0.2 0.01 285)",
    "--primary-dark": "oklch(0.3 0.01 285)",
    "--color-primary-dark": "oklch(0.3 0.01 285)",
    "--primary-soft": "oklch(0.95 0.01 285)",
    "--color-primary-soft": "oklch(0.95 0.01 285)",
    "--accent": "oklch(0.95 0.01 285)",
    "--color-accent": "oklch(0.95 0.01 285)",
    "--accent-foreground": "oklch(0.14 0.01 285)",
    "--color-accent-foreground": "oklch(0.14 0.01 285)",
    "--ring": "oklch(0.14 0.01 285)",
    "--color-ring": "oklch(0.14 0.01 285)",
    "--chart-1": "oklch(0.14 0.01 285)",
    "--color-chart-1": "oklch(0.14 0.01 285)",
    "--chart-2": "oklch(0.3 0.01 285)",
    "--color-chart-2": "oklch(0.3 0.01 285)",
  }
};

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "system">("system");

  useReferralTracking();

  useEffect(() => {
    function applyTheme() {
      const color =
        localStorage.getItem("urban-vault-theme-color") ||
        localStorage.getItem("voltix-theme-color") ||
        "#F43F5E";
      const preset = THEME_PRESETS[color];
      if (preset) {
        Object.entries(preset).forEach(([prop, val]) => {
          document.documentElement.style.setProperty(prop, val);
        });
      }
      
      const mode =
        localStorage.getItem("urban-vault-theme-mode") ||
        localStorage.getItem("voltix-theme-mode") ||
        "system";
      setThemeMode(mode as "light" | "dark" | "system");
      const isDark = mode === "dark" || (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      if (isDark) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    }
    applyTheme();
    window.addEventListener("storage", applyTheme);
    window.addEventListener("urban-vault-theme-change", applyTheme);
    window.addEventListener("voltix-theme-change", applyTheme);
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", applyTheme);
    return () => {
      window.removeEventListener("storage", applyTheme);
      window.removeEventListener("urban-vault-theme-change", applyTheme);
      window.removeEventListener("voltix-theme-change", applyTheme);
      mediaQuery.removeEventListener("change", applyTheme);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <CompareProvider>
              <div className="flex min-h-screen flex-col pb-16 sm:pb-0">
                <AnnouncementBanner />
                <Outlet />
                <MobileNav />
              </div>
              <WhatsAppFloat />
              <Toaster position="top-right" theme={themeMode} />
            </CompareProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

