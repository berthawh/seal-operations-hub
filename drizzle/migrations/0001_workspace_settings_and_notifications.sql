CREATE TABLE public.workspace_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton boolean NOT NULL DEFAULT true,
  company_name text NOT NULL DEFAULT 'Simplecare Training Academy',
  legal_name text,
  address_line1 text,
  address_line2 text,
  city text,
  postcode text,
  country text NOT NULL DEFAULT 'United Kingdom',
  phone text,
  email text,
  website text,
  logo_url text,
  company_number text,
  vat_number text,
  invoice_email text,
  invoice_prefix text NOT NULL DEFAULT 'SCTA',
  payment_terms text NOT NULL DEFAULT 'Payment due within 30 days',
  bank_name text,
  account_name text,
  account_number text,
  sort_code text,
  certificate_prefix text NOT NULL DEFAULT 'SCTA',
  region text NOT NULL DEFAULT 'United Kingdom',
  default_validity_months integer NOT NULL DEFAULT 12,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  CONSTRAINT workspace_settings_singleton_chk CHECK (singleton),
  CONSTRAINT workspace_settings_singleton_key UNIQUE (singleton)
);

GRANT SELECT, INSERT, UPDATE ON public.workspace_settings TO authenticated;
GRANT ALL ON public.workspace_settings TO service_role;

ALTER TABLE public.workspace_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view workspace settings"
  ON public.workspace_settings FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert workspace settings"
  ON public.workspace_settings FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update workspace settings"
  ON public.workspace_settings FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

INSERT INTO public.workspace_settings (company_name) VALUES ('Simplecare Training Academy');

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  tone text NOT NULL DEFAULT 'info',
  link text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX notifications_user_created_idx ON public.notifications (user_id, created_at DESC);

GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);