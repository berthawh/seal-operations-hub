import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, MapPin, Plus } from "lucide-react";
import { AppShell } from "@/components/seal/app-shell";
import { Avatar, Bar, Field, PageHeader, Panel } from "@/components/seal/primitives";
import { StatusChip } from "@/components/seal/status-chip";
import { Button } from "@/components/ui/button";
import { organisations } from "@/lib/seal-data";

export const Route = createFileRoute("/organisations/")({
  head: () => ({
    meta: [
      { title: "Organisations — Seal" },
      {
        name: "description",
        content:
          "Customer organisations with people, sessions, certificates and compliance health at a glance.",
      },
      { property: "og:title", content: "Organisations — Seal" },
      { property: "og:description", content: "Accounts, compliance health and training activity." },
    ],
  }),
  component: OrganisationsPage,
});

function OrganisationsPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Organisations"
          description="The accounts you deliver training for, and how compliant each one currently is."
          crumbs={[{ label: "Seal", to: "/" }, { label: "Organisations" }]}
          actions={
            <Button variant="seal">
              <Plus className="size-4" /> Add organisation
            </Button>
          }
        />

        <div className="grid gap-4 lg:grid-cols-2">
          {organisations.map((o, i) => (
            <Link
              key={o.id}
              to="/organisations/$orgId"
              params={{ orgId: o.id }}
              className="hover-lift surface-card flex flex-col gap-5 p-6 sm:flex-row sm:items-center"
              style={{ animation: `rise 0.45s cubic-bezier(0.22,1,0.36,1) ${i * 50}ms both` }}
            >
              <div className="flex min-w-0 flex-1 items-start gap-4">
                <Avatar initials={o.shortName} className="size-12 rounded-2xl text-sm" />
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold">{o.name}</p>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="size-3" /> {o.location}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <StatusChip tone="neutral" size="sm" dot={false}>
                      {o.sector}
                    </StatusChip>
                    <StatusChip tone="info" size="sm" dot={false}>
                      {o.people} people
                    </StatusChip>
                    <StatusChip tone="seal" size="sm" dot={false}>
                      {o.sessions} sessions
                    </StatusChip>
                  </div>
                </div>
              </div>
              <div className="w-full shrink-0 border-t border-border pt-4 sm:w-48 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-5">
                <Field label="Certificates" value={o.certificates} />
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
                    <span>Compliance</span>
                    <span className="tabular-nums">{o.compliance}%</span>
                  </div>
                  <Bar
                    value={o.compliance}
                    tone={o.compliance > 80 ? "success" : o.compliance > 70 ? "warning" : "danger"}
                  />
                </div>
                {o.compliance < 70 ? (
                  <StatusChip tone="danger" size="sm" className="mt-3">
                    Requires attention
                  </StatusChip>
                ) : null}
              </div>
            </Link>
          ))}
        </div>

        <Panel className="flex flex-wrap items-center gap-4 bg-surface-sunken p-5">
          <Building2 className="size-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Organisation records shown here are placeholder accounts for design purposes.
          </p>
        </Panel>
      </div>
    </AppShell>
  );
}
