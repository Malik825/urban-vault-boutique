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
import { AlertTriangle, Ghost, Home, RefreshCw } from "lucide-react";

import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/lib/cart";
import { AuthProvider } from "@/lib/auth";
import { WishlistProvider, CompareProvider } from "@/lib/user-store";
import { MobileNav } from "@/components/storefront/mobile-nav";
import { useReferralTracking } from "@/lib/referral";

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
      { title: "Voltix — Electronics retail, beautifully online" },
      {
        name: "description",
        content:
          "Voltix helps electronics retailers showcase laptops, phones and gadgets online and manage inventory from a modern dashboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=Space+Grotesk:wght@300..700&display=swap",
      },
      {
        rel: "stylesheet",
        href: "https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,300,400&display=swap",
      },
      { rel: "icon", href: "/logo.jpg", type: "image/jpeg" },
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
                  var mode = localStorage.getItem("voltix-theme-mode");
                  var isDark = mode === "dark" || (mode !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
                  if (isDark) document.documentElement.classList.add("dark");
                  else document.documentElement.classList.remove("dark");

                  var color = localStorage.getItem("voltix-theme-color") || "#10B981";
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
      const color = localStorage.getItem("voltix-theme-color") || "#10B981";
      const preset = THEME_PRESETS[color];
      if (preset) {
        Object.entries(preset).forEach(([prop, val]) => {
          document.documentElement.style.setProperty(prop, val);
        });
      }
      
      const mode = localStorage.getItem("voltix-theme-mode") || "system";
      setThemeMode(mode as "light" | "dark" | "system");
      const isDark = mode === "dark" || (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      if (isDark) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    }
    applyTheme();
    window.addEventListener("storage", applyTheme);
    window.addEventListener("voltix-theme-change", applyTheme);
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", applyTheme);
    return () => {
      window.removeEventListener("storage", applyTheme);
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
                <Outlet />
                <MobileNav />
              </div>
              <Toaster position="top-center" theme={themeMode} />
            </CompareProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

