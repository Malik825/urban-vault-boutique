import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LayoutGrid, Loader2, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { STORE } from "@/lib/store-data";

const credentialsSchema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(8, "Use at least 8 characters").max(72),
});

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Seller sign in — Voltix inventory dashboard" },
      {
        name: "description",
        content:
          "Sign in to the Voltix seller dashboard to manage listings, stock levels and WhatsApp enquiries for your electronics store.",
      },
      { property: "og:title", content: "Seller sign in — Voltix" },
      {
        property: "og:description",
        content: "Manage listings, stock levels and enquiries from one dashboard.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = credentialsSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your details");
      return;
    }

    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (!data.session) {
          setSent(true);
          toast.success("Check your inbox to confirm your seller account");
          return;
        }
        navigate({ to: "/dashboard" });
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });
      if (error) throw error;
      toast.success("Welcome back");
      navigate({ to: "/dashboard" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-brand-gradient p-12 text-primary-foreground lg:flex">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary-foreground/15">
            <LayoutGrid className="h-4 w-4" />
          </span>
          <span className="font-display text-lg font-extrabold">{STORE.name}</span>
        </Link>
        <div className="max-w-md">
          <h2 className="font-display text-3xl font-extrabold leading-tight lg:text-4xl">
            Your storefront and stockroom, in one place.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-primary-foreground/85">
            Publish listings with full specifications, keep stock counts honest with audited
            movements, and let buyers reach you on WhatsApp in one tap.
          </p>
        </div>
        <p className="text-xs text-primary-foreground/70">{STORE.city}</p>
      </div>

      <div className="flex items-center justify-center px-4 py-10 sm:py-16">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-gradient text-primary-foreground">
              <LayoutGrid className="h-4 w-4" />
            </span>
            <span className="font-display text-lg font-extrabold">{STORE.name}</span>
          </Link>

          <h1 className="font-display text-2xl font-extrabold tracking-tight">Seller access</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Sign in to manage your catalogue and inventory.
          </p>

          <Tabs
            value={mode}
            onValueChange={(v) => {
              setMode(v as "signin" | "signup");
              setSent(false);
            }}
            className="mt-6"
          >
            <TabsList className="grid w-full grid-cols-2 rounded-lg bg-surface-muted p-1">
              <TabsTrigger value="signin" className="rounded-md text-sm">
                Sign in
              </TabsTrigger>
              <TabsTrigger value="signup" className="rounded-md text-sm">
                Create account
              </TabsTrigger>
            </TabsList>

            <TabsContent value={mode} className="mt-6">
              {sent ? (
                <div className="rounded-lg border border-border bg-card p-4 text-sm">
                  <p className="font-semibold">Confirm your email</p>
                  <p className="mt-1.5 text-muted-foreground">
                    We sent a confirmation link to {email}. Open it to activate your seller account,
                    then sign in.
                  </p>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold">Work email</Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@store.com"
                        className="pl-11 h-13 rounded-xl border-border bg-surface-muted shadow-none text-base focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all placeholder:text-muted-foreground/60"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        autoComplete={mode === "signup" ? "new-password" : "current-password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        className="pl-11 h-13 rounded-xl border-border bg-surface-muted shadow-none text-base focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all placeholder:text-muted-foreground/60"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" variant="hero" className="w-full h-12 rounded-lg text-sm sm:text-base font-bold mt-2" disabled={busy}>
                    {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                    {mode === "signup" ? "Create seller account" : "Sign in"}
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              ← Back to storefront
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
