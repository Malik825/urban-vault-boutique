import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Truck,
  User,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { STORE } from "@/lib/store-data";
import { serverRegisterUser } from "@/lib/auth.functions";
import { BoutiqueOnboardingModal } from "@/components/auth/onboarding-modal";

const authSearchSchema = z.object({
  redirect: z.string().optional(),
  mode: z.enum(["login", "register", "forgot"]).optional(),
  onboarding: z.union([z.boolean(), z.string()]).optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => authSearchSchema.parse(search),
  head: () => ({
    meta: [
      { title: `Account Sign In & Register — ${STORE.name}` },
      {
        name: "description",
        content:
          `Sign in or register your ${STORE.name} account to track orders, manage wishlist, and access exclusive boutique drops.`,
      },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: `${STORE.siteUrl}/auth` }],
  }),
  component: AuthPage,
});

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().min(9, "Enter a valid phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...props}>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function AppleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" {...props}>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 1.01-2.87-.96.04-2.12.64-2.8 1.44-.6.7-1.13 1.77-1 2.84 1.07.08 2.16-.57 2.79-1.41z" />
    </svg>
  );
}

function AuthPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const rawRedirect = search.redirect;
  const targetRedirect =
    rawRedirect && rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
      ? rawRedirect
      : null;

  const [mode, setMode] = useState<"login" | "register" | "forgot">(search.mode || "login");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [busy, setBusy] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [newlyRegisteredUser, setNewlyRegisteredUser] = useState<{
    id: string;
    email: string;
    fullName?: string;
  } | null>(null);

  // Test bypass for onboarding modal (?onboarding=true)
  useEffect(() => {
    if (search.onboarding === true || search.onboarding === "true") {
      setNewlyRegisteredUser({
        id: "test-user-preview",
        email: "vip-member@urbanvault.store",
        fullName: "VIP Member",
      });
      setShowOnboarding(true);
    }
  }, [search.onboarding]);

  // Auto-redirect if already signed in: smart redirect to intended destination
  useEffect(() => {
    if (showOnboarding || newlyRegisteredUser || search.onboarding === true || search.onboarding === "true") return;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: roleData } = await (supabase as any)
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .maybeSingle();

        const isAdmin = !!roleData;
        if (isAdmin) {
          navigate({ to: "/dashboard", replace: true });
        } else if (targetRedirect) {
          // If customer tries to access dashboard, redirect to /account, otherwise respect targetRedirect
          if (targetRedirect.startsWith("/dashboard")) {
            navigate({ to: "/account", replace: true });
          } else {
            navigate({ to: targetRedirect as any, replace: true });
          }
        } else {
          navigate({ to: "/account", replace: true });
        }
      }
    });
  }, [navigate, showOnboarding, newlyRegisteredUser, targetRedirect]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check your credentials");
      return;
    }

    setBusy(true);
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });
      if (error) throw error;
      toast.success(`Welcome back to ${STORE.name}!`);

      // Check admin status for smart navigation
      let isAdminUser = false;
      if (authData?.user) {
        const { data: roleData } = await (supabase as any)
          .from("user_roles")
          .select("role")
          .eq("user_id", authData.user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (roleData) {
          isAdminUser = true;
        }
      }

      // Admin should always be redirected to the dashboard
      if (isAdminUser) {
        navigate({ to: "/dashboard" });
      } else if (targetRedirect) {
        if (targetRedirect.startsWith("/dashboard")) {
          navigate({ to: "/account" });
        } else {
          navigate({ to: targetRedirect as any });
        }
      } else {
        navigate({ to: "/account" });
      }
    } catch (err: any) {
      toast.error(err?.message || "Invalid email or password");
    } finally {
      setBusy(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    const parsed = registerSchema.safeParse({ fullName, email, phone, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check your details");
      return;
    }

    setBusy(true);
    try {
      let registeredUserId = "";

      // 1. Register with instant auto-confirmation via server admin client (bypasses email delays)
      try {
        const res = await serverRegisterUser({
          data: {
            email: parsed.data.email,
            password: parsed.data.password,
            fullName: parsed.data.fullName,
            phone: parsed.data.phone,
          },
        });
        registeredUserId = res.userId;
      } catch (serverErr: any) {
        console.warn("[Register] Server function fallback:", serverErr);
        const { data: clientSignup, error: clientErr } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            data: {
              full_name: parsed.data.fullName,
              phone: parsed.data.phone,
            },
          },
        });
        if (clientErr) throw clientErr;
        registeredUserId = clientSignup.user?.id || "";
      }

      // 2. Immediately sign in with credentials to obtain active session
      const { data: authData, error: loginErr } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });

      if (loginErr) {
        console.warn("[Register] Immediate login notice:", loginErr);
      }

      const activeId = authData?.user?.id || registeredUserId || "guest";
      setNewlyRegisteredUser({
        id: activeId,
        email: parsed.data.email,
        fullName: parsed.data.fullName,
      });

      // 3. Open the VIP Boutique Onboarding Experience!
      setShowOnboarding(true);
      toast.success(`Welcome to ${STORE.name}! Your account is active.`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to create account. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      if (error) throw error;
      toast.success("Password reset link sent! Please check your inbox.");
      setMode("login");
    } catch (err: any) {
      toast.error(err?.message || "Failed to send reset link");
    } finally {
      setBusy(false);
    }
  }

  async function handleOAuth(provider: "google" | "apple") {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(`Unable to sign in with ${provider}: ${err?.message || "Service unavailable"}`);
    }
  }

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-background font-sans overflow-x-hidden">
      {/* ── LEFT PANEL: CLEAN NEUTRAL BRANDING (FULL HEIGHT) ── */}
      <div className="relative overflow-hidden bg-[#0A0E17] text-white p-6 sm:p-10 lg:p-12 xl:p-16 lg:col-span-5 xl:col-span-5 flex flex-col justify-between min-h-[380px] lg:min-h-screen border-r border-border/40">
          <div>
            {/* Brand Header */}
            <Link to="/" className="inline-flex items-center gap-2.5 outline-none group">
              <img
                src="/urban-vault-logo.jpg"
                alt={STORE.name}
                className="h-9 w-9 rounded-full object-cover shadow-glow ring-1 ring-white/20"
              />
              <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-white group-hover:text-white/80 transition-colors">
                {STORE.name}
              </span>
            </Link>

            {/* Dynamic Headline Based on Mode */}
            <div className="mt-8 sm:mt-12">
              {mode === "login" && (
                <>
                  <h1 className="font-display text-2xl sm:text-3xl lg:text-[2.1rem] font-extrabold leading-[1.18] text-white tracking-tight">
                    Curated Streetwear.
                    <br />
                    Bespoke Fashion.
                  </h1>
                  <p className="mt-3 text-xs sm:text-sm text-slate-300/90 leading-relaxed max-w-xs">
                    Sign in to access VIP pricing, track boutique orders, and shop new season drops.
                  </p>
                </>
              )}

              {mode === "register" && (
                <>
                  <h1 className="font-display text-2xl sm:text-3xl lg:text-[2.1rem] font-extrabold leading-[1.18] text-white tracking-tight">
                    Join The Vault Club
                  </h1>
                  <p className="mt-3 text-xs sm:text-sm text-slate-300/90 leading-relaxed max-w-xs">
                    Create your account to unlock an instant 10% welcome discount, curated sizing, and early access.
                  </p>
                </>
              )}

              {mode === "forgot" && (
                <>
                  <h1 className="font-display text-2xl sm:text-3xl lg:text-[2.1rem] font-extrabold leading-[1.18] text-white tracking-tight">
                    Forgot your password?
                  </h1>
                  <p className="mt-3 text-xs sm:text-sm text-slate-300/90 leading-relaxed max-w-xs">
                    No worries! Enter your email address and we&rsquo;ll send you a link to reset it.
                  </p>
                </>
              )}
            </div>

            {/* 3 Value Propositions */}
            <div className="mt-6 sm:mt-8 space-y-3.5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/20 text-primary border border-primary/30">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-white leading-tight">
                    100% Authentic Designer Pieces
                  </h4>
                  <p className="text-[11px] text-slate-400">Verified heavyweight GSM fabrics & tailoring</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/20 text-primary border border-primary/30">
                  <Truck className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-white leading-tight">
                    Accra Delivery & In-Store Pickup
                  </h4>
                  <p className="text-[11px] text-slate-400">Fast delivery across Greater Accra & nationwide Ghana</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/20 text-primary border border-primary/30">
                  <Lock className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-white leading-tight">
                    Secure MoMo & Card Payments
                  </h4>
                  <p className="text-[11px] text-slate-400">MTN MoMo, Telecel Cash, Paystack cards & COD</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Fashion Graphic Showcase */}
          <div className="hidden lg:block mt-8 pt-4">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-lg bg-black/40 group">
              <img
                src="/boutique/urban_vault_hero_1_1792394728170.webp"
                alt="Urban Vault Fashion Collection"
                loading="lazy"
                width={800}
                height={450}
                className="w-full h-44 object-cover object-top opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E17] via-transparent to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0A0E17]/60 via-transparent to-[#0A0E17]/60 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL: AUTH FORMS (FULL HEIGHT) ── */}
        <div className="bg-background dark:bg-[#080D14] p-6 sm:p-10 lg:p-14 xl:p-16 lg:col-span-7 xl:col-span-7 flex flex-col justify-center min-h-screen overflow-y-auto">
          
          {/* ── MODE 1: LOGIN ("Welcome back") ── */}
          {mode === "login" && (
            <div className="max-w-md w-full mx-auto">
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Welcome back
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                Log in to your account to continue.
              </p>

              <form onSubmit={handleLogin} className="mt-6 space-y-4">
                {/* Email Field */}
                <div className="space-y-1.5">
                  <Label htmlFor="login-email" className="text-xs font-semibold text-foreground">
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11 rounded-xl bg-background border-border/80 text-sm focus-visible:ring-primary/40"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <Label htmlFor="login-password" className="text-xs font-semibold text-foreground">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-11 rounded-xl bg-background border-border/80 text-sm focus-visible:ring-primary/40"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password Row */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-muted-foreground hover:text-foreground">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                    />
                    <span>Remember me</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="font-semibold text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={busy}
                  className="w-full h-11 rounded-xl bg-primary hover:bg-primary-deep text-primary-foreground font-semibold text-sm shadow-sm flex items-center justify-center gap-2 transition-all mt-2"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Log in</span>}
                  {!busy && <ArrowRight className="h-4 w-4" />}
                </Button>
              </form>

              {/* Or Divider */}
              <div className="relative my-5 text-center text-xs text-muted-foreground">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <span className="relative bg-card px-3 uppercase tracking-wider text-[11px]">
                  or
                </span>
              </div>

              {/* Social Login Buttons */}
              <div className="space-y-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOAuth("google")}
                  className="w-full h-11 rounded-xl border-border bg-background hover:bg-muted font-medium text-xs sm:text-sm flex items-center justify-center gap-2.5"
                >
                  <GoogleIcon />
                  <span>Continue with Google</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOAuth("apple")}
                  className="w-full h-11 rounded-xl border-border bg-background hover:bg-muted font-medium text-xs sm:text-sm flex items-center justify-center gap-2.5"
                >
                  <AppleIcon />
                  <span>Continue with Apple</span>
                </Button>
              </div>

              {/* Switch to Register */}
              <p className="mt-6 text-center text-xs text-muted-foreground">
                Don&rsquo;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="font-semibold text-primary hover:underline"
                >
                  Create one
                </button>
              </p>
            </div>
          )}

          {/* ── MODE 2: REGISTER ("Create your account") ── */}
          {mode === "register" && (
            <div className="max-w-md w-full mx-auto">
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Create your account
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                It only takes a minute.
              </p>

              <form onSubmit={handleRegister} className="mt-6 space-y-3.5">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="reg-name" className="text-xs font-semibold text-foreground">
                    Full name
                  </Label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="reg-name"
                      type="text"
                      required
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10 h-11 rounded-xl bg-background border-border/80 text-sm focus-visible:ring-primary/40"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <Label htmlFor="reg-email" className="text-xs font-semibold text-foreground">
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="reg-email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11 rounded-xl bg-background border-border/80 text-sm focus-visible:ring-primary/40"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <Label htmlFor="reg-phone" className="text-xs font-semibold text-foreground">
                    Phone number
                  </Label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="reg-phone"
                      type="tel"
                      required
                      placeholder="+233 XX XXX XXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10 h-11 rounded-xl bg-background border-border/80 text-sm focus-visible:ring-primary/40"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="reg-password" className="text-xs font-semibold text-foreground">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-11 rounded-xl bg-background border-border/80 text-sm focus-visible:ring-primary/40"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={busy}
                  className="w-full h-11 rounded-xl bg-primary hover:bg-primary-deep text-primary-foreground font-semibold text-sm shadow-sm flex items-center justify-center gap-2 transition-all mt-2"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Create account</span>}
                  {!busy && <ArrowRight className="h-4 w-4" />}
                </Button>
              </form>

              {/* Or Divider */}
              <div className="relative my-4 text-center text-xs text-muted-foreground">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <span className="relative bg-card px-3 uppercase tracking-wider text-[11px]">
                  or
                </span>
              </div>

              {/* Social Login Buttons */}
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOAuth("google")}
                  className="w-full h-10 rounded-xl border-border bg-background hover:bg-muted font-medium text-xs sm:text-sm flex items-center justify-center gap-2.5"
                >
                  <GoogleIcon />
                  <span>Continue with Google</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOAuth("apple")}
                  className="w-full h-10 rounded-xl border-border bg-background hover:bg-muted font-medium text-xs sm:text-sm flex items-center justify-center gap-2.5"
                >
                  <AppleIcon />
                  <span>Continue with Apple</span>
                </Button>
              </div>

              {/* Switch to Login */}
              <p className="mt-5 text-center text-xs text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="font-semibold text-primary hover:underline"
                >
                  Log in
                </button>
              </p>
            </div>
          )}

          {/* ── MODE 3: FORGOT PASSWORD ("Reset your password") ── */}
          {mode === "forgot" && (
            <div className="max-w-md w-full mx-auto">
              <button
                type="button"
                onClick={() => setMode("login")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline mb-6"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to login
              </button>

              <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Reset your password
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                Enter your email address and we&rsquo;ll send you a link to reset your password.
              </p>

              <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="reset-email" className="text-xs font-semibold text-foreground">
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="reset-email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11 rounded-xl bg-background border-border/80 text-sm focus-visible:ring-primary"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={busy}
                  className="w-full h-11 rounded-xl bg-primary hover:bg-primary-deep text-primary-foreground font-semibold text-sm shadow-sm flex items-center justify-center gap-2 transition-all mt-4"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Send reset link</span>}
                  {!busy && <ArrowRight className="h-4 w-4" />}
                </Button>
              </form>

              <p className="mt-6 text-center text-xs text-muted-foreground">
                Remember your password?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="font-semibold text-primary hover:underline"
                >
                  Log in
                </button>
              </p>
            </div>
          )}

        </div>

        {/* ── ONBOARDING MODAL FOR NEW SIGNUPS ── */}
        {newlyRegisteredUser && (
          <BoutiqueOnboardingModal
            isOpen={showOnboarding}
            onOpenChange={setShowOnboarding}
            user={newlyRegisteredUser}
            redirectUrl={targetRedirect || undefined}
          />
        )}
    </div>
  );
}
