import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Building2, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/seal/app-shell";
import { PageHeader, Panel, PanelHeader } from "@/components/seal/primitives";
import { StatusChip } from "@/components/seal/status-chip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateWorkspace, type Workspace } from "@/lib/workspace.functions";
import { useMyAccess, useRefreshGlobal, useWorkspace } from "@/hooks/use-seal-session";

export const Route = createFileRoute("/settings/company")({
  head: () => ({
    meta: [
      { title: "My company — Seal settings" },
      {
        name: "description",
        content:
          "Your own company profile in Seal: registered address, logo, invoice and payment details used across certificates and paperwork.",
      },
      { property: "og:title", content: "My company — Seal settings" },
      { property: "og:description", content: "Company address, logo and invoice details for your workspace." },
    ],
  }),
  component: CompanyPage,
});

type FormState = Record<string, string>;

const toForm = (w: Workspace | null): FormState => ({
  companyName: w?.companyName ?? "",
  legalName: w?.legalName ?? "",
  addressLine1: w?.addressLine1 ?? "",
  addressLine2: w?.addressLine2 ?? "",
  city: w?.city ?? "",
  postcode: w?.postcode ?? "",
  country: w?.country ?? "United Kingdom",
  phone: w?.phone ?? "",
  email: w?.email ?? "",
  website: w?.website ?? "",
  logoUrl: w?.logoUrl ?? "",
  companyNumber: w?.companyNumber ?? "",
  vatNumber: w?.vatNumber ?? "",
  invoiceEmail: w?.invoiceEmail ?? "",
  invoicePrefix: w?.invoicePrefix ?? "SCTA",
  paymentTerms: w?.paymentTerms ?? "",
  bankName: w?.bankName ?? "",
  accountName: w?.accountName ?? "",
  accountNumber: w?.accountNumber ?? "",
  sortCode: w?.sortCode ?? "",
  certificatePrefix: w?.certificatePrefix ?? "SCTA",
  region: w?.region ?? "United Kingdom",
  defaultValidityMonths: String(w?.defaultValidityMonths ?? 12),
});

function CompanyPage() {
  const access = useMyAccess();
  const workspace = useWorkspace();
  const refreshGlobal = useRefreshGlobal();
  const save = useServerFn(updateWorkspace);
  const [form, setForm] = useState<FormState>(toForm(null));
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (workspace.data !== undefined && !loaded) {
      setForm(toForm(workspace.data ?? null));
      setLoaded(true);
    }
  }, [workspace.data, loaded]);

  const canEdit = access.data?.isAdmin ?? false;

  const mutation = useMutation({
    mutationFn: () =>
      save({
        data: {
          companyName: form["companyName"] ?? "",
          legalName: form["legalName"] ?? "",
          addressLine1: form["addressLine1"] ?? "",
          addressLine2: form["addressLine2"] ?? "",
          city: form["city"] ?? "",
          postcode: form["postcode"] ?? "",
          country: form["country"] ?? "",
          phone: form["phone"] ?? "",
          email: form["email"] ?? "",
          website: form["website"] ?? "",
          logoUrl: form["logoUrl"] ?? "",
          companyNumber: form["companyNumber"] ?? "",
          vatNumber: form["vatNumber"] ?? "",
          invoiceEmail: form["invoiceEmail"] ?? "",
          invoicePrefix: form["invoicePrefix"] ?? "",
          paymentTerms: form["paymentTerms"] ?? "",
          bankName: form["bankName"] ?? "",
          accountName: form["accountName"] ?? "",
          accountNumber: form["accountNumber"] ?? "",
          sortCode: form["sortCode"] ?? "",
          certificatePrefix: form["certificatePrefix"] ?? "",
          region: form["region"] ?? "",
          defaultValidityMonths: Number(form["defaultValidityMonths"]) || 12,
        },
      }),
    onSuccess: () => {
      refreshGlobal();
      toast.success("Company details saved", {
        description: "Everyone in the workspace now sees the updated details.",
      });
    },
    onError: (error: Error) => toast.error("Could not save", { description: error.message }),
  });

  const set = (key: string) => (event: { target: { value: string } }) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const field = (key: string, label: string, placeholder?: string, type = "text") => (
    <div className="space-y-1.5">
      <Label htmlFor={key} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <Input
        id={key}
        type={type}
        value={form[key] ?? ""}
        onChange={set(key)}
        placeholder={placeholder ?? ""}
        disabled={!canEdit}
      />
    </div>
  );

  if (access.isLoading || workspace.isLoading) {
    return (
      <AppShell>
        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
          <Loader2 className="mr-2 size-4 animate-spin" /> Loading company details…
        </div>
      </AppShell>
    );
  }

  if (access.isError || !access.data) {
    return (
      <AppShell>
        <Panel className="mx-auto max-w-md p-8 text-center">
          <Building2 className="mx-auto size-6 text-muted-foreground" />
          <p className="mt-3 text-sm font-semibold">Sign in to view company details</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Company settings are only available to signed-in team members.
          </p>
          <Button variant="seal" className="mt-4" asChild>
            <Link to="/auth" search={{ redirect: "/settings/company" }}>
              Go to sign in
            </Link>
          </Button>
        </Panel>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="My company"
          description="Your own organisation — the details printed on certificates, invoices and emails. Separate from the customer organisations you train."
          crumbs={[{ label: "Seal", to: "/" }, { label: "Settings", to: "/settings" }, { label: "My company" }]}
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link to="/settings">
                  <ArrowLeft className="size-4" /> Back to settings
                </Link>
              </Button>
              <Button variant="seal" disabled={!canEdit || mutation.isPending} onClick={() => mutation.mutate()}>
                {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                Save changes
              </Button>
            </div>
          }
        />

        {!canEdit ? (
          <Panel className="flex items-center gap-3 p-4">
            <StatusChip tone="warning" size="sm">
              View only
            </StatusChip>
            <p className="text-xs text-muted-foreground">
              Ask an administrator to change these details.
            </p>
          </Panel>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-2">
          <Panel>
            <PanelHeader title="Company profile" subtitle="Name, logo and contact details" />
            <div className="grid gap-4 px-5 pb-5 sm:grid-cols-2">
              {field("companyName", "Trading name", "Simplecare Training Academy")}
              {field("legalName", "Registered legal name")}
              {field("phone", "Phone")}
              {field("email", "General email", "hello@example.com", "email")}
              {field("website", "Website", "https://…")}
              {field("logoUrl", "Logo URL", "https://…/logo.png")}
              <div className="sm:col-span-2">
                {form["logoUrl"] ? (
                  <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3">
                    <img
                      src={form["logoUrl"]}
                      alt={`${form["companyName"] || "Company"} logo`}
                      className="h-10 w-auto max-w-[140px] object-contain"
                    />
                    <p className="text-xs text-muted-foreground">Shown on certificates and invoices.</p>
                  </div>
                ) : (
                  <p className="rounded-xl border border-dashed border-border p-3 text-xs text-muted-foreground">
                    Paste a link to your logo image to preview it here.
                  </p>
                )}
              </div>
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Registered address" subtitle="Used on certificates and paperwork" />
            <div className="grid gap-4 px-5 pb-5 sm:grid-cols-2">
              <div className="sm:col-span-2">{field("addressLine1", "Address line 1")}</div>
              <div className="sm:col-span-2">{field("addressLine2", "Address line 2")}</div>
              {field("city", "Town or city")}
              {field("postcode", "Postcode")}
              {field("country", "Country")}
              {field("region", "Operating region")}
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Invoice details" subtitle="Numbers and payment terms" />
            <div className="grid gap-4 px-5 pb-5 sm:grid-cols-2">
              {field("companyNumber", "Company number")}
              {field("vatNumber", "VAT number")}
              {field("invoiceEmail", "Invoice email", "accounts@example.com", "email")}
              {field("invoicePrefix", "Invoice prefix", "SCTA")}
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="paymentTerms" className="text-xs text-muted-foreground">
                  Payment terms
                </Label>
                <Textarea
                  id="paymentTerms"
                  rows={2}
                  value={form["paymentTerms"] ?? ""}
                  onChange={set("paymentTerms")}
                  disabled={!canEdit}
                />
              </div>
              {field("bankName", "Bank")}
              {field("accountName", "Account name")}
              {field("accountNumber", "Account number")}
              {field("sortCode", "Sort code")}
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Certificate defaults" subtitle="Applied to newly issued credentials" />
            <div className="grid gap-4 px-5 pb-5 sm:grid-cols-2">
              {field("certificatePrefix", "Certificate prefix", "SCTA")}
              {field("defaultValidityMonths", "Default validity (months)", "12", "number")}
              <p className="text-xs text-muted-foreground sm:col-span-2">
                All controlled courses currently carry 12 months validity.
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
