import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type NotificationTone = "info" | "success" | "warning" | "danger";

export type Notification = {
  id: string;
  title: string;
  body: string | null;
  tone: NotificationTone;
  link: string | null;
  readAt: string | null;
  createdAt: string;
};

/** The signed-in user's notifications, newest first. */
export const listNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Notification[]> => {
    const { data, error } = await context.supabase
      .from("notifications")
      .select("id, title, body, tone, link, read_at, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(30);
    if (error) throw new Error(error.message);
    return (data ?? []).map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      tone: (n.tone as NotificationTone) ?? "info",
      link: n.link,
      readAt: n.read_at,
      createdAt: n.created_at,
    }));
  });

/** Mark one notification, or every unread one, as read. */
export const markNotificationsRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id?: string }) => input)
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", context.userId)
      .is("read_at", null);
    if (data.id) q = q.eq("id", data.id);
    const { error } = await q;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Remove a notification from the signed-in user's list. */
export const dismissNotification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("notifications")
      .delete()
      .eq("user_id", context.userId)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Send a notification to the whole team (or one member). Admins only. */
export const notifyTeam = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { title: string; body?: string; tone?: NotificationTone; link?: string; userId?: string }) =>
      input,
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("is_admin", { _user_id: context.userId });
    if (!isAdmin) throw new Error("Only an administrator can send notifications.");
    if (!data.title.trim()) throw new Error("A notification needs a title.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let recipients: string[];
    if (data.userId) {
      recipients = [data.userId];
    } else {
      const { data: profiles, error } = await supabaseAdmin.from("profiles").select("id");
      if (error) throw new Error(error.message);
      recipients = (profiles ?? []).map((p) => p.id);
    }

    const rows = recipients.map((id) => ({
      user_id: id,
      title: data.title.trim(),
      body: data.body?.trim() || null,
      tone: data.tone ?? "info",
      link: data.link || null,
    }));
    if (!rows.length) return { sent: 0 };

    const { error } = await supabaseAdmin.from("notifications").insert(rows);
    if (error) throw new Error(error.message);
    return { sent: rows.length };
  });
