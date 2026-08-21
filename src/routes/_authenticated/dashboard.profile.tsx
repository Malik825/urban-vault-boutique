import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Camera,
  Check,
  Loader2,
  Mail,
  Save,
  Shield,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard/profile")({
  head: () => ({
    meta: [{ title: "Profile — GadgetHaus Admin" }],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      setEmail(data.user.email ?? null);
      setUserId(data.user.id);
      const name =
        data.user.user_metadata?.full_name ??
        data.user.user_metadata?.name ??
        data.user.email?.split("@")[0] ??
        "Admin";
      setDisplayName(name);
      setNameInput(name);
      setAvatarUrl(data.user.user_metadata?.avatar_url ?? null);
    });
  }, []);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5 MB");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${userId}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(path);

      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });
      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast.success("Profile photo updated!");
    } catch (err: any) {
      toast.error(err?.message ?? "Upload failed");
    } finally {
      setUploading(false);
      // reset so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!nameInput.trim() || !dirty) return;
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: nameInput.trim() },
      });
      if (error) throw error;
      setDisplayName(nameInput.trim());
      setDirty(false);
      toast.success("Profile saved!");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  const initials = (displayName || email || "A").slice(0, 2).toUpperCase();

  return (
    <DashboardShell
      title="My Profile"
      subtitle="Manage your admin account details and photo"
    >
      <form
        onSubmit={(e) => void handleSaveProfile(e)}
        className="mx-auto max-w-2xl space-y-5"
      >
        {/* ── Avatar card ── */}
        <div className="profile-card">
          <div className="profile-card__header">
            <User className="h-4 w-4" />
            <span>Profile Photo</span>
          </div>

          <div className="profile-avatar-section">
            <div className="profile-avatar-wrap">
              <Avatar className="profile-avatar">
                {avatarUrl && (
                  <AvatarImage
                    src={avatarUrl}
                    alt="Profile"
                    className="object-cover"
                  />
                )}
                <AvatarFallback className="profile-avatar__fallback">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <button
                type="button"
                className="profile-avatar-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                aria-label="Upload profile photo"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            <div className="profile-avatar-info">
              <p className="font-display text-lg font-extrabold">{displayName}</p>
              <p className="text-sm text-muted-foreground">{email}</p>
              <p className="mt-1.5 text-xs text-muted-foreground">
                PNG, JPG, WEBP or GIF — max 5 MB
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Camera className="mr-2 h-3.5 w-3.5" />
                )}
                {uploading ? "Uploading…" : "Change photo"}
              </Button>
            </div>
          </div>
        </div>

        {/* ── Display name ── */}
        <div className="profile-card">
          <div className="profile-card__header">
            <User className="h-4 w-4" />
            <span>Display Name</span>
          </div>
          <div className="profile-field">
            <label
              htmlFor="displayName"
              className="mb-1.5 block text-xs font-semibold text-muted-foreground"
            >
              Full name
            </label>
            <input
              id="displayName"
              type="text"
              value={nameInput}
              onChange={(e) => {
                setNameInput(e.target.value);
                setDirty(e.target.value.trim() !== displayName);
              }}
              className="profile-field__input"
              placeholder="Your display name"
              maxLength={80}
            />
          </div>
        </div>

        {/* ── Email (read-only) ── */}
        <div className="profile-card">
          <div className="profile-card__header">
            <Mail className="h-4 w-4" />
            <span>Email Address</span>
          </div>
          <div className="profile-field">
            <div className="profile-field__view">
              <span className="text-sm font-semibold">{email ?? "—"}</span>
              <span className="profile-badge">
                <Check className="mr-1 h-3 w-3" /> Verified
              </span>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Email address cannot be changed here.
            </p>
          </div>
        </div>

        {/* ── Role ── */}
        <div className="profile-card">
          <div className="profile-card__header">
            <Shield className="h-4 w-4" />
            <span>Account Role</span>
          </div>
          <div className="profile-field">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-accent-foreground">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">Store Administrator</p>
                <p className="text-xs text-muted-foreground">
                  Full access to all dashboard features
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Save button ── */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!dirty || saving}
            className="min-w-[130px]"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {saving ? "Saving…" : "Save profile"}
          </Button>
        </div>
      </form>
    </DashboardShell>
  );
}
