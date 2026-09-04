import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];

export const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: "Super admin",
  admin: "Admin",
  operations: "Operations",
  partner: "Strategic partner",
};

export const ROLE_HINTS: Record<AppRole, string> = {
  super_admin: "Full control, including who else can administer the workspace.",
  admin: "Manages team access, courses and certificate approval.",
  operations: "Runs sessions, attendance and certificate preparation.",
  partner: "Sees only their own organisation's training position.",
};

export type TeamMember = {
  id: string;
  email: string | null;
  fullName: string | null;
  jobTitle: string | null;
  createdAt: string;
  roles: AppRole[];
};

/** The signed-in user's own profile and roles. */
export const getMyAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: profile }, { data: roleRows }] = await Promise.all([
      supabase.from("profiles").select("id, email, full_name, job_title").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);
    const roles = (roleRows ?? []).map((r) => r.role as AppRole);
    return {
      userId,
      email: profile?.email ?? null,
      fullName: profile?.full_name ?? null,
      jobTitle: profile?.job_title ?? null,
      roles,
      isAdmin: roles.includes("admin") || roles.includes("super_admin"),
    };
  });

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("is_admin", { _user_id: context.userId });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("You do not have permission to manage team access.");
}

/** Everyone in the workspace with their assigned roles. Admins only. */
export const listTeam = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<TeamMember[]> => {
    await assertAdmin(context);
    const { supabase } = context;
    const [{ data: profiles, error }, { data: roleRows }] = await Promise.all([
      supabase.from("profiles").select("id, email, full_name, job_title, created_at").order("created_at"),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    if (error) throw new Error(error.message);
    return (profiles ?? []).map((p) => ({
      id: p.id,
      email: p.email,
      fullName: p.full_name,
      jobTitle: p.job_title,
      createdAt: p.created_at,
      roles: (roleRows ?? []).filter((r) => r.user_id === p.id).map((r) => r.role as AppRole),
    }));
  });

/** Replace a member's roles. Admins only; super admin required to grant super admin. */
export const setMemberRoles = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; roles: AppRole[] }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: isSuper } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "super_admin",
    });
    if (data.roles.includes("super_admin") && !isSuper) {
      throw new Error("Only a super admin can grant super admin access.");
    }
    if (data.userId === context.userId && !data.roles.includes("super_admin") && isSuper) {
      throw new Error("You cannot remove your own super admin access.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const del = await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId);
    if (del.error) throw new Error(del.error.message);
    if (data.roles.length) {
      const ins = await supabaseAdmin
        .from("user_roles")
        .insert(data.roles.map((role) => ({ user_id: data.userId, role })));
      if (ins.error) throw new Error(ins.error.message);
    }
    return { ok: true };
  });

/** Create a team member account with a starting password and role. Admins only. */
export const createMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { email: string; fullName: string; jobTitle: string; password: string; role: AppRole }) => {
    if (!input.email.includes("@")) throw new Error("Enter a valid email address.");
    if (input.password.length < 8) throw new Error("Password must be at least 8 characters.");
    return input;
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    if (data.role === "super_admin") {
      const { data: isSuper } = await context.supabase.rpc("has_role", {
        _user_id: context.userId,
        _role: "super_admin",
      });
      if (!isSuper) throw new Error("Only a super admin can grant super admin access.");
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
      .upsert({ id: newId, email: data.email, full_name: data.fullName, job_title: data.jobTitle });
    await supabaseAdmin.from("user_roles").delete().eq("user_id", newId);
    const ins = await supabaseAdmin.from("user_roles").insert({ user_id: newId, role: data.role });
    if (ins.error) throw new Error(ins.error.message);
    return { ok: true, userId: newId };
  });
