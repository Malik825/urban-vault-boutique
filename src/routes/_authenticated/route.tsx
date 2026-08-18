import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });

    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roleData) {
      await supabase.auth.signOut();
      toast.error("Unauthorized: Admin access required.");
      throw redirect({ to: "/auth" });
    }

    return { user: data.user };
  },
  component: () => <Outlet />,
});
