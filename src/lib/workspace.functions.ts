import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type Workspace = {
  id: string;
  companyName: string;
  legalName: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  postcode: string | null;
  country: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  logoUrl: string | null;
  companyNumber: string | null;
  vatNumber: string | null;
  invoiceEmail: string | null;
  invoicePrefix: string;
  paymentTerms: string;
  bankName: string | null;
  accountName: string | null;
  accountNumber: string | null;
  sortCode: string | null;
  certificatePrefix: string;
  region: string;
  defaultValidityMonths: number;
  updatedAt: string;
};

type Row = {
  id: string;
  company_name: string;
  legal_name: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  postcode: string | null;
  country: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  logo_url: string | null;
  company_number: string | null;
  vat_number: string | null;
  invoice_email: string | null;
  invoice_prefix: string;
  payment_terms: string;
  bank_name: string | null;
  account_name: string | null;
  account_number: string | null;
  sort_code: string | null;
  certificate_prefix: string;
  region: string;
  default_validity_months: number;
  updated_at: string;
};

function toWorkspace(r: Row): Workspace {
  return {
    id: r.id,
    companyName: r.company_name,
    legalName: r.legal_name,
    addressLine1: r.address_line1,
    addressLine2: r.address_line2,
    city: r.city,
    postcode: r.postcode,
    country: r.country,
    phone: r.phone,
    email: r.email,
    website: r.website,
    logoUrl: r.logo_url,
    companyNumber: r.company_number,
    vatNumber: r.vat_number,
    invoiceEmail: r.invoice_email,
    invoicePrefix: r.invoice_prefix,
    paymentTerms: r.payment_terms,
    bankName: r.bank_name,
    accountName: r.account_name,
    accountNumber: r.account_number,
    sortCode: r.sort_code,
    certificatePrefix: r.certificate_prefix,
    region: r.region,
    defaultValidityMonths: r.default_validity_months,
    updatedAt: r.updated_at,
  };
}

/** The single company/workspace record every screen reads from. */
export const getWorkspace = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Workspace | null> => {
    const { data, error } = await context.supabase
      .from("workspace_settings")
      .select("*")
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? toWorkspace(data as Row) : null;
  });

export type WorkspaceInput = Partial<Omit<Workspace, "id" | "updatedAt">>;

/** Update the company record. Admins only (enforced by RLS + explicit check). */
export const updateWorkspace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: WorkspaceInput) => input)
  .handler(async ({ data, context }): Promise<Workspace> => {
    const { supabase, userId } = context;
    const { data: isAdmin } = await supabase.rpc("is_admin", { _user_id: userId });
    if (!isAdmin) throw new Error("Only an administrator can change company details.");

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString(), updated_by: userId };
    const map: Record<keyof WorkspaceInput, string> = {
      companyName: "company_name",
      legalName: "legal_name",
      addressLine1: "address_line1",
      addressLine2: "address_line2",
      city: "city",
      postcode: "postcode",
      country: "country",
      phone: "phone",
      email: "email",
      website: "website",
      logoUrl: "logo_url",
      companyNumber: "company_number",
      vatNumber: "vat_number",
      invoiceEmail: "invoice_email",
      invoicePrefix: "invoice_prefix",
      paymentTerms: "payment_terms",
      bankName: "bank_name",
      accountName: "account_name",
      accountNumber: "account_number",
      sortCode: "sort_code",
      certificatePrefix: "certificate_prefix",
      region: "region",
      defaultValidityMonths: "default_validity_months",
    };
    for (const [key, column] of Object.entries(map)) {
      const value = (data as Record<string, unknown>)[key];
      if (value !== undefined) patch[column] = value;
    }

    const existing = await supabase.from("workspace_settings").select("id").limit(1).maybeSingle();
    if (existing.error) throw new Error(existing.error.message);

    const result = existing.data
      ? await supabase
          .from("workspace_settings")
          .update(patch as never)
          .eq("id", existing.data.id)
          .select("*")
          .single()
      : await supabase.from("workspace_settings").insert(patch as never).select("*").single();

    if (result.error) throw new Error(result.error.message);
    return toWorkspace(result.data as Row);
  });

/** Update the signed-in user's own name and job title. */
export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { fullName: string; jobTitle: string }) => input)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update({ full_name: data.fullName.trim() || null, job_title: data.jobTitle.trim() || null })
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
