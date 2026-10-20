/**
 * Admin seeding script.
 * Provisions admin user(s) in auth.users and assigns 'admin' role in public.user_roles.
 *
 * Usage:
 *   node scripts/seed-admin.mjs <email> [password]
 * Example:
 *   node scripts/seed-admin.mjs emmanuelapp053@gmail.com
 */

import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

// Load .env
const env = Object.fromEntries(
  readFileSync(new URL("../.env", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.trim() && !l.startsWith("#"))
    .map((l) => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    })
    .filter(([k, v]) => k && v)
);

const SUPABASE_URL = env.SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const targetEmails = process.argv[2]
  ? [process.argv[2]]
  : ["emmanuelapp053@gmail.com", "abdulmalik5521.0k@gmail.com"];

const defaultPassword = process.argv[3] || "UrbanVault@2026";

async function seedAdmins() {
  console.log("⚡ Starting admin user provisioning...");

  for (const email of targetEmails) {
    console.log(`\nProcessing: ${email}`);

    // 1. Check if user already exists in auth.users
    const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      console.error("Error listing users:", listError.message);
      continue;
    }

    let user = listData.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      console.log(`Creating new user account for ${email}...`);
      const { data: createData, error: createError } = await supabase.auth.admin.createUser({
        email,
        password: defaultPassword,
        email_confirm: true,
        user_metadata: {
          full_name: email.startsWith("emmanuel") ? "Store Administrator" : "Technical Lead",
        },
      });

      if (createError) {
        console.error(`Failed to create auth user for ${email}:`, createError.message);
        continue;
      }
      user = createData.user;
      console.log(`✅ Created auth user: ${user.id} (temp password: ${defaultPassword})`);
    } else {
      console.log(`ℹ️ Auth user already exists: ${user.id}`);
      // Ensure email is confirmed
      if (!user.email_confirmed_at) {
        await supabase.auth.admin.updateUserById(user.id, { email_confirm: true });
        console.log("✅ Email confirmed.");
      }
    }

    // 2. Assign 'admin' role in public.user_roles
    const { error: roleError } = await supabase
      .from("user_roles")
      .upsert({ user_id: user.id, role: "admin" }, { onConflict: "user_id,role" });

    if (roleError) {
      console.error(`Failed to assign admin role to ${email}:`, roleError.message);
    } else {
      console.log(`🌟 Successfully granted 'admin' role to ${email} (ID: ${user.id})`);
    }
  }

  console.log("\n🎉 Admin seeding complete!");
}

seedAdmins().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
