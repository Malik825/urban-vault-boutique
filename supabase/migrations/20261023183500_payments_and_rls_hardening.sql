-- ==============================================================================
-- Payments Webhook, Orders Administration & Sourcing Requests RLS Hardening
-- ==============================================================================

-- 1. Ensure Orders RLS policies allow Admins full visibility & update rights
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;

CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can update all orders"
  ON public.orders FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins can view all order items"
  ON public.order_items FOR SELECT TO authenticated
  USING (public.is_admin());

-- 2. Create and Secure the Sourcing Requests Table (Visual Search & Concierge)
CREATE TABLE IF NOT EXISTS public.sourcing_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  whatsapp_number text NOT NULL,
  preferred_size text,
  budget text,
  notes text,
  image_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'sourced', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sourcing_requests_status_idx ON public.sourcing_requests (status, created_at DESC);

ALTER TABLE public.sourcing_requests ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT ON public.sourcing_requests TO anon, authenticated;
GRANT ALL ON public.sourcing_requests TO service_role;

DROP POLICY IF EXISTS "Anyone can submit sourcing requests" ON public.sourcing_requests;
DROP POLICY IF EXISTS "Admins can view all sourcing requests" ON public.sourcing_requests;
DROP POLICY IF EXISTS "Admins can update sourcing requests" ON public.sourcing_requests;

CREATE POLICY "Anyone can submit sourcing requests"
  ON public.sourcing_requests FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view all sourcing requests"
  ON public.sourcing_requests FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can update sourcing requests"
  ON public.sourcing_requests FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 3. Create and Secure the Payment Webhook Audit Logs Table
CREATE TABLE IF NOT EXISTS public.payment_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL DEFAULT 'paystack',
  reference text NOT NULL,
  event text NOT NULL,
  amount numeric(12,2),
  currency text NOT NULL DEFAULT 'GHS',
  channel text,
  status text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payment_logs_ref_idx ON public.payment_logs (reference);
CREATE INDEX IF NOT EXISTS payment_logs_created_idx ON public.payment_logs (created_at DESC);

ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.payment_logs TO service_role;
GRANT SELECT ON public.payment_logs TO authenticated;

DROP POLICY IF EXISTS "Admins can view payment logs" ON public.payment_logs;
CREATE POLICY "Admins can view payment logs"
  ON public.payment_logs FOR SELECT TO authenticated
  USING (public.is_admin());
