import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
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
  mode: z.enum(["login", "register", "forgot", "reset-password"]).optional(),
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
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().min(9, "Enter a valid phone number (at least 9 digits)"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export function getPasswordStrength(p: string) {
  const hasLength = p.length >= 8;
  const hasCase = /[a-z]/.test(p) && /[A-Z]/.test(p);
  const hasNumber = /\d/.test(p);
  const hasSpecial = /[^A-Za-z0-9]/.test(p);

  const score = [hasLength, hasCase, hasNumber, hasSpecial].filter(Boolean).length;

  let label = "Needs improvement";
  let color = "text-primary/60";
  let barColor = "bg-primary/30";

  if (score === 2) {
    label = "Fair";
    color = "text-primary/80";
    barColor = "bg-primary/60";
  } else if (score === 3) {
    label = "Good";
    color = "text-primary font-medium";
    barColor = "bg-primary/85";
  } else if (score >= 4) {
    label = "Strong (Vault Grade)";
    color = "text-primary font-bold";
    barColor = "bg-primary shadow-glow";
  }

  return { score, label, color, barColor, hasLength, hasCase, hasNumber, hasSpecial };
}

function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;
  const s = getPasswordStrength(password);

  return (
    <div className="mt-2.5 rounded-xl bg-card border border-border/80 p-3 space-y-2 text-xs">
      <div className="flex items-center justify-between text-[11px] font-semibold">
        <span className="text-muted-foreground">Password strength:</span>
        <span className={s.color}>{s.label}</span>
      </div>

      <div className="grid grid-cols-4 gap-1.5 h-1.5">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`h-full rounded-full transition-all duration-300 ${
              step <= s.score ? s.barColor : "bg-muted"
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
        <div className={`flex items-center gap-1.5 ${s.hasLength ? "text-primary font-medium" : "text-muted-foreground/60"}`}>
          {s.hasLength ? <CheckCircle2 className="h-3 w-3 text-primary shrink-0" /> : <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 mx-0.5" />}
          <span>8+ characters</span>
        </div>
        <div className={`flex items-center gap-1.5 ${s.hasCase ? "text-primary font-medium" : "text-muted-foreground/60"}`}>
          {s.hasCase ? <CheckCircle2 className="h-3 w-3 text-primary shrink-0" /> : <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 mx-0.5" />}
          <span>Upper & lowercase</span>
        </div>
        <div className={`flex items-center gap-1.5 ${s.hasNumber ? "text-primary font-medium" : "text-muted-foreground/60"}`}>
          {s.hasNumber ? <CheckCircle2 className="h-3 w-3 text-primary shrink-0" /> : <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 mx-0.5" />}
          <span>At least 1 number</span>
        </div>
        <div className={`flex items-center gap-1.5 ${s.hasSpecial ? "text-primary font-medium" : "text-muted-foreground/60"}`}>
          {s.hasSpecial ? <CheckCircle2 className="h-3 w-3 text-primary shrink-0" /> : <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 mx-0.5" />}
          <span>1 symbol (!@#$)</span>
        </div>
      </div>
    </div>
  );
}

interface AuthErrors {
  general?: string;
  email?: string;
  password?: string;
  fullName?: string;
  phone?: string;
  newPassword?: string;
  confirmPassword?: string;
}

function AuthPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const rawRedirect = search.redirect;
  const targetRedirect =
    rawRedirect && rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
      ? rawRedirect
      : null;

  const [mode, setMode] = useState<"login" | "register" | "forgot" | "reset-password">(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash || "";
      const isRecovery =
        hash.includes("type=recovery") ||
        (hash.includes("access_token") && !hash.includes("type=signup")) ||
        sessionStorage.getItem("uv-recovery-mode") === "true";
      if (isRecovery || search.mode === "reset-password") {
        sessionStorage.setItem("uv-recovery-mode", "true");
        return "reset-password";
      }
    }
    return (search.mode as any) || "login";
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [busy, setBusy] = useState(false);

  const [errors, setErrors] = useState<AuthErrors>({});

  function clearError(field: keyof AuthErrors) {
    if (errors[field] || errors.general) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        delete copy.general;
        return copy;
      });
    }
  }

  // Clear errors when switching modes
  useEffect(() => {
    setErrors({});
  }, [mode]);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [newlyRegisteredUser, setNewlyRegisteredUser] = useState<{
    id: string;
    email: string;
    fullName?: string;
  } | null>(null);

  // Listen for Supabase password recovery event or recovery hash on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash || "";
      if (hash.includes("type=recovery") || search.mode === "reset-password") {
        sessionStorage.setItem("uv-recovery-mode", "true");
        setMode("reset-password");
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("uv-recovery-mode", "true");
        }
        setMode("reset-password");
      }
    });

    return () => subscription.unsubscribe();
  }, [search.mode]);

  // Test bypass for onboarding modal (?onboarding=true)
  useEffect(() => {
    if (search.onboarding === true || search.onboarding === "true") {
      setNewlyRegisteredUser({
        id: "test-user-preview",
        email: "vip-member@urbanvaultgh.com",
        fullName: "VIP Member",
      });
      setShowOnboarding(true);
    }
  }, [search.onboarding]);

  // Auto-redirect if already signed in: smart redirect to intended destination
  // CRITICAL: NEVER auto-redirect if user is resetting their password!
  useEffect(() => {
    if (
      mode === "reset-password" ||
      showOnboarding ||
      newlyRegisteredUser ||
      search.onboarding === true ||
      search.onboarding === "true"
    )
      return;

    if (typeof window !== "undefined" && window.location.hash.includes("type=recovery")) {
      setMode("reset-password");
      return;
    }

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
  }, [navigate, showOnboarding, newlyRegisteredUser, targetRedirect, mode]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    const fieldErrors: AuthErrors = {};
    if (!email.trim()) {
      fieldErrors.email = "Email address is required";
    } else if (!email.includes("@")) {
      fieldErrors.email = "Please enter a valid email address";
    }
    if (!password) {
      fieldErrors.password = "Password is required";
    }

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setBusy(true);
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      toast.success(`Welcome back to ${STORE.name}!`);

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
      const message = err?.message || "Invalid email or password";
      setErrors({ general: message });
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    const fieldErrors: AuthErrors = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      fieldErrors.fullName = "Please enter your full name (minimum 2 characters)";
    }
    if (!email.trim() || !email.includes("@")) {
      fieldErrors.email = "Please enter a valid email address";
    }
    if (!phone.trim() || phone.trim().length < 9) {
      fieldErrors.phone = "Please enter a valid phone number (at least 9 digits)";
    }
    if (!password) {
      fieldErrors.password = "Please create a password";
    } else if (password.length < 8) {
      fieldErrors.password = "Password must be at least 8 characters long";
    }

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setBusy(true);
    try {
      let registeredUserId = "";

      try {
        const res = await serverRegisterUser({
          data: {
            email: email.trim(),
            password,
            fullName: fullName.trim(),
            phone: phone.trim(),
          },
        });
        registeredUserId = res.userId;
      } catch (serverErr: any) {
        console.warn("[Register] Server function fallback:", serverErr);
        const { data: clientSignup, error: clientErr } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              phone: phone.trim(),
            },
          },
        });
        if (clientErr) throw clientErr;
        registeredUserId = clientSignup.user?.id || "";
      }

      const { data: authData, error: loginErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (loginErr) {
        console.warn("[Register] Immediate login notice:", loginErr);
      }

      const activeId = authData?.user?.id || registeredUserId || "guest";
      setNewlyRegisteredUser({
        id: activeId,
        email: email.trim(),
        fullName: fullName.trim(),
      });

      setShowOnboarding(true);
      toast.success(`Welcome to ${STORE.name}! Your account is active.`);
    } catch (err: any) {
      const msg = err?.message || "Failed to create account. Please try again.";
      setErrors({ general: msg });
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    if (!email.trim() || !email.includes("@")) {
      setErrors({ email: "Please enter a valid email address" });
      return;
    }

    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth`,
      });
      if (error) throw error;
      toast.success("Password reset link sent! Please check your inbox.");
      setMode("login");
    } catch (err: any) {
      const msg = err?.message || "Failed to send reset link";
      setErrors({ general: msg });
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  async function handleSetNewPassword(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    const fieldErrors: AuthErrors = {};

    if (!newPassword) {
      fieldErrors.newPassword = "New password is required";
    } else if (newPassword.length < 8) {
      fieldErrors.newPassword = "Password must be at least 8 characters long";
    }

    if (!confirmPassword) {
      fieldErrors.confirmPassword = "Confirm password is required";
    } else if (newPassword !== confirmPassword) {
      fieldErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      toast.success("Password updated successfully! You can now log in.");
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("uv-recovery-mode");
      }
      setMode("login");
      setNewPassword("");
      setConfirmPassword("");
      if (typeof window !== "undefined" && window.history.replaceState) {
        window.history.replaceState(null, "", window.location.pathname);
      }
    } catch (err: any) {
      const msg = err?.message || "Failed to update password";
      setErrors({ general: msg });
      toast.error(msg);
    } finally {
      setBusy(false);
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

              {mode === "reset-password" && (
                <>
                  <h1 className="font-display text-2xl sm:text-3xl lg:text-[2.1rem] font-extrabold leading-[1.18] text-white tracking-tight">
                    Create new password
                  </h1>
                  <p className="mt-3 text-xs sm:text-sm text-slate-300/90 leading-relaxed max-w-xs">
                    Choose a strong, secure password for your {STORE.name} account.
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

              {errors.general && (
                <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errors.general}</span>
                </div>
              )}

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
                      onChange={(e) => {
                        setEmail(e.target.value);
                        clearError("email");
                      }}
                      className={`pl-10 h-11 rounded-xl bg-background text-sm transition-colors ${
                        errors.email
                          ? "border-rose-500/80 focus-visible:ring-rose-500/30"
                          : "border-border/80 focus-visible:ring-primary/40"
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[11px] font-medium text-rose-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      <span>{errors.email}</span>
                    </p>
                  )}
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
                      onChange={(e) => {
                        setPassword(e.target.value);
                        clearError("password");
                      }}
                      className={`pl-10 pr-10 h-11 rounded-xl bg-background text-sm transition-colors ${
                        errors.password
                          ? "border-rose-500/80 focus-visible:ring-rose-500/30"
                          : "border-border/80 focus-visible:ring-primary/40"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-[11px] font-medium text-rose-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      <span>{errors.password}</span>
                    </p>
                  )}
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

              {/* Switch to Register */}
              <p className="mt-8 text-center text-xs text-muted-foreground">
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
                Unlock instant boutique benefits and member pricing.
              </p>

              {errors.general && (
                <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errors.general}</span>
                </div>
              )}

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
                      placeholder="Kwame Mensah"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        clearError("fullName");
                      }}
                      className={`pl-10 h-11 rounded-xl bg-background text-sm transition-colors ${
                        errors.fullName
                          ? "border-rose-500/80 focus-visible:ring-rose-500/30"
                          : "border-border/80 focus-visible:ring-primary/40"
                      }`}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-[11px] font-medium text-rose-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      <span>{errors.fullName}</span>
                    </p>
                  )}
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
                      onChange={(e) => {
                        setEmail(e.target.value);
                        clearError("email");
                      }}
                      className={`pl-10 h-11 rounded-xl bg-background text-sm transition-colors ${
                        errors.email
                          ? "border-rose-500/80 focus-visible:ring-rose-500/30"
                          : "border-border/80 focus-visible:ring-primary/40"
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[11px] font-medium text-rose-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      <span>{errors.email}</span>
                    </p>
                  )}
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
                      placeholder="024 123 4567"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        clearError("phone");
                      }}
                      className={`pl-10 h-11 rounded-xl bg-background text-sm transition-colors ${
                        errors.phone
                          ? "border-rose-500/80 focus-visible:ring-rose-500/30"
                          : "border-border/80 focus-visible:ring-primary/40"
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-[11px] font-medium text-rose-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      <span>{errors.phone}</span>
                    </p>
                  )}
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
                      onChange={(e) => {
                        setPassword(e.target.value);
                        clearError("password");
                      }}
                      className={`pl-10 pr-10 h-11 rounded-xl bg-background text-sm transition-colors ${
                        errors.password
                          ? "border-rose-500/80 focus-visible:ring-rose-500/30"
                          : "border-border/80 focus-visible:ring-primary/40"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-[11px] font-medium text-rose-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      <span>{errors.password}</span>
                    </p>
                  )}
                  {/* Dynamic Strength Indicator & Requirements */}
                  <PasswordStrengthMeter password={password} />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={busy}
                  className="w-full h-11 rounded-xl bg-primary hover:bg-primary-deep text-primary-foreground font-semibold text-sm shadow-sm flex items-center justify-center gap-2 transition-all mt-3"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Create account</span>}
                  {!busy && <ArrowRight className="h-4 w-4" />}
                </Button>
              </form>

              {/* Switch to Login */}
              <p className="mt-7 text-center text-xs text-muted-foreground">
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

              {errors.general && (
                <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errors.general}</span>
                </div>
              )}

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
                      onChange={(e) => {
                        setEmail(e.target.value);
                        clearError("email");
                      }}
                      className={`pl-10 h-11 rounded-xl bg-background text-sm transition-colors ${
                        errors.email
                          ? "border-rose-500/80 focus-visible:ring-rose-500/30"
                          : "border-border/80 focus-visible:ring-primary"
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[11px] font-medium text-rose-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      <span>{errors.email}</span>
                    </p>
                  )}
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

          {/* ── MODE 4: SET NEW PASSWORD ── */}
          {mode === "reset-password" && (
            <div className="max-w-md w-full mx-auto">
              <button
                type="button"
                onClick={() => setMode("login")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline mb-6"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to login
              </button>

              <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Set new password
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                Please enter a secure password for your account (minimum 8 characters).
              </p>

              {errors.general && (
                <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errors.general}</span>
                </div>
              )}

              <form onSubmit={handleSetNewPassword} className="mt-6 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="new-password" className="text-xs font-semibold text-foreground">
                    New Password
                  </Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Enter new password (min. 8 characters)"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        clearError("newPassword");
                      }}
                      className={`pl-10 pr-10 h-11 rounded-xl bg-background text-sm transition-colors ${
                        errors.newPassword
                          ? "border-rose-500/80 focus-visible:ring-rose-500/30"
                          : "border-border/80 focus-visible:ring-primary"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-[11px] font-medium text-rose-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      <span>{errors.newPassword}</span>
                    </p>
                  )}
                  {/* Password Strength Indicator */}
                  <PasswordStrengthMeter password={newPassword} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirm-password" className="text-xs font-semibold text-foreground">
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      placeholder="Confirm your new password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        clearError("confirmPassword");
                      }}
                      className={`pl-10 pr-10 h-11 rounded-xl bg-background text-sm transition-colors ${
                        errors.confirmPassword
                          ? "border-rose-500/80 focus-visible:ring-rose-500/30"
                          : "border-border/80 focus-visible:ring-primary"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-[11px] font-medium text-rose-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      <span>{errors.confirmPassword}</span>
                    </p>
                  )}
                  {confirmPassword && (
                    <div className="text-[11px] font-medium flex items-center gap-1.5 mt-1.5">
                      {confirmPassword === newPassword ? (
                        <span className="text-primary font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" /> Passwords match
                        </span>
                      ) : (
                        <span className="text-rose-500 flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" /> Passwords do not match
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={busy}
                  className="w-full h-11 rounded-xl bg-primary hover:bg-primary-deep text-primary-foreground font-semibold text-sm shadow-sm flex items-center justify-center gap-2 transition-all mt-4"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Update password</span>}
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
