-- Organisation container: type, relationship, status, portal permissions
CREATE TABLE public.organisations (
  id text PRIMARY KEY,
  name text NOT NULL,
  short_name text,
  org_type text NOT NULL DEFAULT 'Care Agency',
  relationship text NOT NULL DEFAULT 'Client',
  status text,
  sector text,
  location text,
  contact_email text,
  contact_phone text,
  notes text,
  portal_enabled boolean NOT NULL DEFAULT false,
  can_invite_members boolean NOT NULL DEFAULT false,
  can_book_sessions boolean NOT NULL DEFAULT true,
  can_manage_staff boolean NOT NULL DEFAULT true,
  can_view_certificates boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.organisations TO authenticated;
GRANT ALL ON public.organisations TO service_role;
ALTER TABLE public.organisations ENABLE ROW LEVEL SECURITY;

-- Membership of an organisation portal (invite-only)
CREATE TABLE public.organisation_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id text NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  portal_role text NOT NULL DEFAULT 'member',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.organisation_members TO authenticated;
GRANT ALL ON public.organisation_members TO service_role;
ALTER TABLE public.organisation_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_org_member(_user_id uuid, _org_id text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organisation_members
    WHERE user_id = _user_id AND organisation_id = _org_id
  )
$$;

CREATE OR REPLACE FUNCTION public.my_org_ids(_user_id uuid)
RETURNS SETOF text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT organisation_id FROM public.organisation_members WHERE user_id = _user_id
$$;

-- Invitations issued by the internal team (or by a partner admin when permitted)
CREATE TABLE public.organisation_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id text NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  email text NOT NULL,
  portal_role text NOT NULL DEFAULT 'member',
  status text NOT NULL DEFAULT 'pending',
  invited_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.organisation_invites TO authenticated;
GRANT ALL ON public.organisation_invites TO service_role;
ALTER TABLE public.organisation_invites ENABLE ROW LEVEL SECURITY;

-- Booking requests raised from the partner portal, approved by the internal team
CREATE TABLE public.booking_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id text NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  course_id text NOT NULL,
  course_name text NOT NULL,
  preferred_date date,
  seats integer NOT NULL DEFAULT 1,
  attendees text,
  notes text,
  status text NOT NULL DEFAULT 'requested',
  requested_by uuid,
  decided_by uuid,
  decided_at timestamptz,
  decision_note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.booking_requests TO authenticated;
GRANT ALL ON public.booking_requests TO service_role;
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;

-- Policies: internal team sees everything; portal users only their own organisation
CREATE POLICY "Team manages organisations" ON public.organisations
  FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Staff view organisations" ON public.organisations
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'operations') OR public.is_admin(auth.uid()) OR public.is_org_member(auth.uid(), id)
  );

CREATE POLICY "Team manages memberships" ON public.organisation_members
  FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Members view own memberships" ON public.organisation_members
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_org_member(auth.uid(), organisation_id));

CREATE POLICY "Team manages invites" ON public.organisation_invites
  FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Members view own org invites" ON public.organisation_invites
  FOR SELECT TO authenticated USING (public.is_org_member(auth.uid(), organisation_id));

CREATE POLICY "Team manages booking requests" ON public.booking_requests
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'operations'))
  WITH CHECK (public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'operations'));
CREATE POLICY "Members view own org bookings" ON public.booking_requests
  FOR SELECT TO authenticated USING (public.is_org_member(auth.uid(), organisation_id));
CREATE POLICY "Members raise own org bookings" ON public.booking_requests
  FOR INSERT TO authenticated WITH CHECK (public.is_org_member(auth.uid(), organisation_id) AND requested_by = auth.uid());