import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type Trainer = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  specialism: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
};

type Row = any;

const mapTrainer = (r: Row): Trainer => ({
  id: r.id,
  fullName: r.full_name,
  email: r.email,
  phone: r.phone,
  specialism: r.specialism,
  status: r.status,
  notes: r.notes,
  createdAt: r.created_at,
});

/** Trainers who deliver sessions. They are records only — no sign-in yet. */
export const listTrainers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Trainer[]> => {
    const { data, error } = await context.supabase
      .from("trainers")
      .select("*")
      .order("full_name");
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapTrainer);
  });

/** Add or update a trainer. Admins only. */
export const saveTrainer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      id?: string;
      fullName: string;
      email?: string;
      phone?: string;
      specialism?: string;
      status?: string;
      notes?: string;
    }) => {
      if (!input.fullName.trim()) throw new Error("Give the trainer a name.");
      return input;
    },
  )
  .handler(async ({ data, context }) => {
    const payload: any = {
      full_name: data.fullName.trim(),
      email: data.email?.trim() || null,
      phone: data.phone?.trim() || null,
      specialism: data.specialism?.trim() || null,
      status: data.status || "active",
      notes: data.notes?.trim() || null,
      updated_at: new Date().toISOString(),
    };
    if (data.id) payload["id"] = data.id;
    else payload["created_by"] = context.userId;
    const { error } = await context.supabase.from("trainers").upsert(payload);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Remove a trainer record. Admins only. */
export const removeTrainer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("trainers").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
