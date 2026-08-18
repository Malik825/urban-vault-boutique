import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

// import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // FREE PASS FOR UI DEV: Mock user returned instead of checking Supabase
    return { user: { id: "demo-user", email: "admin@voltix.com" } };
  },
  component: () => <Outlet />,
});
