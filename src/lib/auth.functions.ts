import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function getAdminClient() {
  const url =
    process.env["SUPABASE_URL"] ||
    process.env["VITE_SUPABASE_URL"] ||
    import.meta.env["VITE_SUPABASE_URL"]!;

  const key =
    process.env["SUPABASE_SERVICE_ROLE_KEY"] ||
    process.env["SUPABASE_PUBLISHABLE_KEY"] ||
    process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
    import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"]!;

  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

export interface RegisterUserInput {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export const serverRegisterUser = createServerFn({ method: "POST" })
  .validator((data: RegisterUserInput) => data)
  .handler(async ({ data }) => {
    try {
      const email = data.email.trim().toLowerCase();
      const password = data.password;
      const fullName = data.fullName.trim();
      const phone = data.phone?.trim() || "";

      if (!email || !password) {
        throw new Error("Email and password are required.");
      }

      const supabase = getAdminClient();

      // 1. Check if user already exists
      const { data: usersList, error: listErr } = await supabase.auth.admin.listUsers();
      if (!listErr && usersList?.users) {
        const existing = usersList.users.find((u) => u.email?.toLowerCase() === email);

        if (existing) {
          // If already exists but unconfirmed, confirm them immediately and update password
          await supabase.auth.admin.updateUserById(existing.id, {
            email_confirm: true,
            password,
            user_metadata: {
              full_name: fullName || (existing.user_metadata?.['full_name'] as string) || "",
              phone: phone || (existing.user_metadata?.['phone'] as string) || "",
            },
          });

          return {
            success: true,
            isExisting: true,
            userId: existing.id,
            email: existing.email,
          };
        }
      }

      // 2. Create user with email_confirm: true to bypass email verification delays
      const { data: createData, error: createErr } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          phone,
          vip_status: "VIP Member",
          joined_at: new Date().toISOString(),
        },
      });

      if (createErr) {
        throw new Error(createErr.message);
      }

      return {
        success: true,
        isExisting: false,
        userId: createData.user.id,
        email: createData.user.email,
      };
    } catch (err: any) {
      console.error("[serverRegisterUser] Error:", err);
      throw new Error(err?.message || "Failed to register user account.");
    }
  });

export const serverSaveOnboardingPreferences = createServerFn({ method: "POST" })
  .validator((data: { userId: string; preferences: Record<string, any> }) => data)
  .handler(async ({ data }) => {
    try {
      const supabase = getAdminClient();
      const { error } = await supabase.auth.admin.updateUserById(data.userId, {
        user_metadata: {
          preferences: data.preferences,
          onboarded_at: new Date().toISOString(),
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      return { success: true };
    } catch (err: any) {
      console.error("[serverSaveOnboardingPreferences] Error:", err);
      return { success: false, error: err?.message };
    }
  });
