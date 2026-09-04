import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const ORG_TYPES = [
  "Care Agency",
  "Care Home",
  "Domiciliary Care",
  "Supported Living",
  "NHS / Public Sector",
  "Facilities Provider",
  "Logistics Operator",
  "Energy Services",
  "Other",
] as const;

export const ORG_RELATIONSHIPS = ["Client", "Training Partner", "Referral Partner", "Prospect"] as const;

export const ORG_STATUSES = ["Strategic", "Preferred", "Standard", "On hold"] as const;

export type Organisation = {
  id: string;
  name: string;
  shortName: string | null;
  orgType: string;
  relationship: string;
  status: string | null;
  sector: string | null;
  location: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  contactName: string | null;
  contactMobile: string | null;
  contactLandline: string | null;
  website: string | null;
  logoUrl: string | null;
  preferredCourseIds: string[];
  notes: string | null;
  portalEnabled: boolean;
  canInviteMembers: boolean;
  canBookSessions: boolean;
  canManageStaff: boolean;
  canViewCertificates: boolean;
  memberCount: number;
};

export type OrgMember = {
  id: string;
  userId: string;
  organisationId: string;
  portalRole: string;
  email: string | null;
  fullName: string | null;
  createdAt: string;
};

export type BookingRequest = {
  id: string;
  organisationId: string;
  organisationName: string;
  courseId: string;
  courseName: string;
  preferredDate: string | null;
  preferredTime: string;
  endTime: string;
  seats: number;
  attendees: string | null;
  notes: string | null;
  status: string;
  decisionNote: string | null;
  createdAt: string;
};

// Rows come back loosely typed from the generated client.
type Row = any;

const mapOrg = (r: Row, memberCount = 0): Organisation => ({
  id: r.id,
  name: r.name,
  shortName: r.short_name,
  orgType: r.org_type,
  relationship: r.relationship,
  status: r.status,
  sector: r.sector,
  location: r.location,
  contactEmail: r.contact_email,
  contactPhone: r.contact_phone,
  contactName: r.contact_name ?? null,
  contactMobile: r.contact_mobile ?? null,
  contactLandline: r.contact_landline ?? null,
  website: r.website ?? null,
  logoUrl: r.logo_url ?? null,
  preferredCourseIds: r.preferred_course_ids ?? [],
  notes: r.notes,
  portalEnabled: r.portal_enabled,
  canInviteMembers: r.can_invite_members,
  canBookSessions: r.can_book_sessions,
  canManageStaff: r.can_manage_staff,
  canViewCertificates: r.can_view_certificates,
  memberCount,
});

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("is_admin", { _user_id: context.userId });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("You do not have permission to manage organisations.");
}

/** Every organisation the signed-in user can see. */
export const listOrganisations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Organisation[]> => {
    const [{ data: orgs, error }, { data: members }] = await Promise.all([
      context.supabase.from("organisations").select("*").order("name"),
      context.supabase.from("organisation_members").select("organisation_id"),
    ]);
    if (error) throw new Error(error.message);
    return (orgs ?? []).map((o: Row) =>
      mapOrg(o, (members ?? []).filter((m: Row) => m.organisation_id === o.id).length),
    );
  });

/** One organisation with its portal members. */
export const getOrganisation = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(
    async ({
      data,
      context,
    }): Promise<{ org: Organisation | null; members: OrgMember[]; bookings: BookingRequest[] }> => {
    const { data: org } = await context.supabase
      .from("organisations")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (!org) return { org: null, members: [], bookings: [] };
    const { data: memberRows } = await context.supabase
      .from("organisation_members")
      .select("*")
      .eq("organisation_id", data.id);
    const ids = (memberRows ?? []).map((m: Row) => m.user_id);
    const { data: profiles } = ids.length
      ? await context.supabase.from("profiles").select("id, email, full_name").in("id", ids)
      : { data: [] as Row[] };
    const members: OrgMember[] = (memberRows ?? []).map((m: Row) => {
      const p = (profiles ?? []).find((x: Row) => x.id === m.user_id);
      return {
        id: m.id,
        userId: m.user_id,
        organisationId: m.organisation_id,
        portalRole: m.portal_role,
        email: p?.email ?? null,
        fullName: p?.full_name ?? null,
        createdAt: m.created_at,
      };
    });
    const { data: bookingRows } = await context.supabase
      .from("booking_requests")
      .select("*")
      .eq("organisation_id", data.id)
      .order("created_at", { ascending: false });
    const bookings = (bookingRows ?? []).map((b: Row) => mapBooking(b, org.name));
    return { org: mapOrg(org, members.length), members, bookings };
  },
  );

/** Create or update an organisation record. Admins only. */
export const saveOrganisation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      id?: string;
      name: string;
      shortName?: string;
      orgType: string;
      relationship: string;
      status?: string | null;
      sector?: string;
      location?: string;
      contactEmail?: string;
      contactPhone?: string;
      contactName?: string;
      contactMobile?: string;
      contactLandline?: string;
      website?: string;
      logoUrl?: string;
      preferredCourseIds?: string[];
      notes?: string;
      portalEnabled?: boolean;
      canInviteMembers?: boolean;
      canBookSessions?: boolean;
      canManageStaff?: boolean;
      canViewCertificates?: boolean;
    }) => {
      if (!input.name.trim()) throw new Error("Give the organisation a name.");
      return input;
    },
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const id =
      data.id ??
      `org-${data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 32)}-${Math.random().toString(36).slice(2, 6)}`;
    const payload = {
      id,
      name: data.name.trim(),
      short_name: data.shortName?.trim() || data.name.trim().slice(0, 3).toUpperCase(),
      org_type: data.orgType,
      relationship: data.relationship,
      status: data.status || null,
      sector: data.sector ?? null,
      location: data.location ?? null,
      contact_email: data.contactEmail ?? null,
      contact_phone: data.contactPhone ?? null,
      contact_name: data.contactName ?? null,
      contact_mobile: data.contactMobile ?? null,
      contact_landline: data.contactLandline ?? null,
      website: data.website ?? null,
      logo_url: data.logoUrl ?? null,
      ...(data.preferredCourseIds === undefined
        ? {}
        : { preferred_course_ids: data.preferredCourseIds }),
      notes: data.notes ?? null,
      ...(data.portalEnabled === undefined ? {} : { portal_enabled: data.portalEnabled }),
      ...(data.canInviteMembers === undefined ? {} : { can_invite_members: data.canInviteMembers }),
      ...(data.canBookSessions === undefined ? {} : { can_book_sessions: data.canBookSessions }),
      ...(data.canManageStaff === undefined ? {} : { can_manage_staff: data.canManageStaff }),
      ...(data.canViewCertificates === undefined
        ? {}
        : { can_view_certificates: data.canViewCertificates }),
      updated_at: new Date().toISOString(),
    };
    const { error } = await context.supabase.from("organisations").upsert(payload);
    if (error) throw new Error(error.message);
    return { ok: true, id };
  });

/** Invite someone from a partner organisation into their portal. Invite-only, internal team issues it. */
export const inviteOrgMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      organisationId: string;
      email: string;
      fullName: string;
      password: string;
      portalRole: string;
    }) => {
      if (!input.email.includes("@")) throw new Error("Enter a valid email address.");
      if (input.password.length < 8) throw new Error("Password must be at least 8 characters.");
      return input;
    },
  )
  .handler(async ({ data, context }) => {
    // Internal admins always may invite. A partner admin may only invite when
    // their organisation has been explicitly granted that permission.
    const { data: isAdmin } = await context.supabase.rpc("is_admin", { _user_id: context.userId });
    if (!isAdmin) {
      const { data: membership } = await context.supabase
        .from("organisation_members")
        .select("portal_role")
        .eq("organisation_id", data.organisationId)
        .eq("user_id", context.userId)
        .maybeSingle();
      const { data: org } = await context.supabase
        .from("organisations")
        .select("can_invite_members")
        .eq("id", data.organisationId)
        .maybeSingle();
      if (!membership || membership.portal_role !== "admin" || !org?.can_invite_members) {
        throw new Error("Your organisation cannot invite additional users.");
      }
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const created = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.fullName },
    });
    if (created.error) throw new Error(created.error.message);
    const newId = created.data.user?.id;
    if (!newId) throw new Error("The account could not be created.");

    await supabaseAdmin
      .from("profiles")
      .upsert({ id: newId, email: data.email, full_name: data.fullName });
    await supabaseAdmin.from("user_roles").delete().eq("user_id", newId);
    await supabaseAdmin.from("user_roles").insert({ user_id: newId, role: "partner" });
    const ins = await supabaseAdmin.from("organisation_members").insert({
      organisation_id: data.organisationId,
      user_id: newId,
      portal_role: data.portalRole,
    });
    if (ins.error) throw new Error(ins.error.message);
    await supabaseAdmin.from("organisation_invites").insert({
      organisation_id: data.organisationId,
      email: data.email,
      portal_role: data.portalRole,
      status: "accepted",
      invited_by: context.userId,
      accepted_at: new Date().toISOString(),
    });
    return { ok: true, userId: newId };
  });

/** Remove someone's portal access. Admins only. */
export const removeOrgMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { memberId: string }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("organisation_members")
      .delete()
      .eq("id", data.memberId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** What the signed-in partner user's portal should show. */
export const getMyPortal = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ org: Organisation | null; portalRole: string | null }> => {
    const { data: membership } = await context.supabase
      .from("organisation_members")
      .select("organisation_id, portal_role")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!membership) return { org: null, portalRole: null };
    const { data: org } = await context.supabase
      .from("organisations")
      .select("*")
      .eq("id", membership.organisation_id)
      .maybeSingle();
    const { count } = await context.supabase
      .from("organisation_members")
      .select("id", { count: "exact", head: true })
      .eq("organisation_id", membership.organisation_id);
    return { org: org ? mapOrg(org, count ?? 0) : null, portalRole: membership.portal_role };
  });

const mapBooking = (r: Row, orgName: string): BookingRequest => ({
  id: r.id,
  organisationId: r.organisation_id,
  organisationName: orgName,
  courseId: r.course_id,
  courseName: r.course_name,
  preferredDate: r.preferred_date,
  preferredTime: r.preferred_time ?? "09:00",
  endTime: r.end_time ?? "17:00",
  seats: r.seats,
  attendees: r.attendees,
  notes: r.notes,
  status: r.status,
  decisionNote: r.decision_note,
  createdAt: r.created_at,
});

/** Booking requests visible to the signed-in user (all of them for the internal team). */
export const listBookingRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<BookingRequest[]> => {
    const [{ data: rows, error }, { data: orgs }] = await Promise.all([
      context.supabase.from("booking_requests").select("*").order("created_at", { ascending: false }),
      context.supabase.from("organisations").select("id, name"),
    ]);
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r: Row) =>
      mapBooking(r, (orgs ?? []).find((o: Row) => o.id === r.organisation_id)?.name ?? "Organisation"),
    );
  });

/** Raise a booking request from the partner portal. Always lands as a request to approve. */
export const createBookingRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      organisationId: string;
      courseId: string;
      courseName: string;
      preferredDate?: string;
      preferredTime?: string;
      endTime?: string;
      seats: number;
      attendees?: string;
      notes?: string;
    }) => {
      if (!input.courseId) throw new Error("Choose a course.");
      if (!input.preferredDate) throw new Error("Choose a date.");
      if (input.seats < 1) throw new Error("Request at least one place.");
      if (input.seats > 20) throw new Error("Classroom sessions take up to 20 people.");
      return input;
    },
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("booking_requests").insert({
      organisation_id: data.organisationId,
      course_id: data.courseId,
      course_name: data.courseName,
      preferred_date: data.preferredDate || null,
      preferred_time: data.preferredTime || "09:00",
      end_time: data.endTime || "17:00",
      seats: data.seats,
      attendees: data.attendees ?? null,
      notes: data.notes ?? null,
      requested_by: context.userId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Approve or decline a booking request. Internal team only. */
export const decideBookingRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; status: "confirmed" | "declined"; note?: string }) => input)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("booking_requests")
      .update({
        status: data.status,
        decision_note: data.note ?? null,
        decided_by: context.userId,
        decided_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/**
 * Training position for an organisation: the share of the courses they usually
 * take that already have a confirmed booking. No usual courses set yet means
 * we fall back to the share of their requests we have confirmed.
 */
export function trainingPosition(
  preferredCourseIds: string[],
  bookings: { courseId: string; status: string }[],
) {
  const confirmed = bookings.filter((b) => b.status === "confirmed");
  if (preferredCourseIds.length) {
    const covered = preferredCourseIds.filter((id) => confirmed.some((b) => b.courseId === id));
    return Math.round((covered.length / preferredCourseIds.length) * 100);
  }
  if (!bookings.length) return 0;
  return Math.round((confirmed.length / bookings.length) * 100);
}
