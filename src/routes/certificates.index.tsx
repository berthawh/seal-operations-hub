import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Search, Send, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { AppShell, CreateMenu } from "@/components/seal/app-shell";
import { Avatar, EmptyState, Field, PageHeader, Panel } from "@/components/seal/primitives";
import { StatusChip, certificateTone, deliveryLabel } from "@/components/seal/status-chip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  certificateStatusLabel,
  certificates,
  courseOf,
  orgOf,
  personOf,
  type CertificateStatus,
} from "@/lib/seal-data";

export const Route = createFileRoute("/certificates/")({
  head: () => ({
    meta: [
      { title: "Certificates — Seal" },
      {
        name: "description",
        content:
          "Manage credentials: issue status, delivery, validity and approval queue for every certificate.",
      },
      { property: "og:title", content: "Certificates — Seal" },
      { property: "og:description", content: "Credential management, approvals and delivery." },
    ],
  }),
  component: CertificatesPage,
});

const tabs: { key: CertificateStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Awaiting approval" },
  { key: "issued", label: "Issued" },
  { key: "hold", label: "On hold" },
  { key: "draft", label: "Draft" },
  { key: "expired", label: "Expired" },
];

function CertificatesPage() {
  const [status, setStatus] = useState<CertificateStatus | "all">("all");
  const [query, setQuery] = useState("");

  const visible = certificates.filter((c) => {
    const person = personOf(c.personId);
    const matches = `${c.number} ${person?.name} ${courseOf(c.courseId)?.name}`
      .toLowerCase()
      .includes(query.toLowerCase());
    return (status === "all" || c.status === status) && matches;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Certificates"
          description="Every credential Seal has generated, with its approval and delivery state."
          crumbs={[{ label: "Seal", to: "/" }, { label: "Certificates" }]}
          actions={<CreateMenu />}
          meta={
            <>
              <StatusChip tone="warning" size="sm">
                {certificates.filter((c) => c.status === "pending").length} awaiting approval
              </StatusChip>
              <StatusChip tone="danger" size="sm">
                {certificates.filter((c) => c.status === "hold").length} on hold
              </StatusChip>
              <StatusChip tone="success" size="sm">
                {certificates.filter((c) => c.status === "issued").length} issued
              </StatusChip>
            </>
          }
        />

        <Panel className="flex flex-wrap items-center gap-3 p-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search learner, certificate number or course…"
              className="h-9 rounded-lg pl-9"
            />
          </div>
          <Tabs value={status} onValueChange={(v) => setStatus(v as CertificateStatus | "all")}>
            <TabsList className="rounded-lg">
              {tabs.map((t) => (
                <TabsTrigger key={t.key} value={t.key} className="rounded-md text-xs">
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm">
            <SlidersHorizontal className="size-3.5" /> More filters
          </Button>
        </Panel>

        {visible.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No certificates in this view"
            description="Change the filter or search term to find the credential you're looking for."
            action={
              <Button variant="outline" size="sm" onClick={() => setStatus("all")}>
                Show all certificates
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((c, i) => {
              const person = personOf(c.personId);
              const course = courseOf(c.courseId);
              const org = orgOf(c.organisationId);
              return (
                <Link
                  key={c.id}
                  to="/certificates/$certificateId"
                  params={{ certificateId: c.id }}
                  className="hover-lift surface-card group relative overflow-hidden p-5"
                  style={{ animation: `rise 0.45s cubic-bezier(0.22,1,0.36,1) ${i * 45}ms both` }}
                >
                  <span className="absolute inset-x-0 top-0 h-1 bg-gradient-seal opacity-70" />
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar initials={person?.initials ?? "--"} tone="seal" className="size-10" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{person?.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{org?.shortName}</p>
                      </div>
                    </div>
                    <StatusChip tone={certificateTone[c.status]} size="sm">
                      {certificateStatusLabel[c.status]}
                    </StatusChip>
                  </div>

                  <p className="mt-4 truncate text-sm font-medium">{course?.name}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">{c.number}</p>

                  <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4">
                    <Field label="Completed" value={c.completedOn} />
                    <Field label="Valid until" value={c.validUntil} />
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <StatusChip
                      tone={
                        c.delivery === "delivered"
                          ? "success"
                          : c.delivery === "queued"
                            ? "info"
                            : c.delivery === "bounced"
                              ? "danger"
                              : "neutral"
                      }
                      size="sm"
                      dot={false}
                    >
                      <Send className="size-3" /> {deliveryLabel[c.delivery]}
                    </StatusChip>
                    <span className="ml-auto flex items-center gap-1 text-[11px] font-semibold text-seal opacity-0 transition-opacity group-hover:opacity-100">
                      <Download className="size-3" /> Open credential
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
