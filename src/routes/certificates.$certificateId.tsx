import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Download, Mail, PauseCircle, RotateCcw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/seal/app-shell";
import { EmptyState, Field, PageHeader, Panel, PanelHeader } from "@/components/seal/primitives";
import { StatusChip, certificateTone, deliveryLabel } from "@/components/seal/status-chip";
import { CertificateBack, CertificateFront } from "@/components/seal/certificate-artwork";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  certificateStatusLabel,
  certificates,
  courseOf,
  orgOf,
  personOf,
  sessionOf,
} from "@/lib/seal-data";

export const Route = createFileRoute("/certificates/$certificateId")({
  loader: ({ params }) => {
    const cert = certificates.find((c) => c.id === params.certificateId);
    if (!cert) throw notFound();
    return { number: cert.number };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.number} — Certificate · Seal` : "Certificate — Seal" },
      {
        name: "description",
        content: "Credential detail with front and back preview, delivery state and issue history.",
      },
      { property: "og:title", content: "Certificate detail — Seal" },
      { property: "og:description", content: "Credential preview, delivery state and history." },
    ],
  }),
  errorComponent: ({ error }) => <div role="alert">{error.message}</div>,
  notFoundComponent: () => (
    <AppShell>
      <EmptyState
        icon={ShieldCheck}
        title="Certificate not found"
        description="This credential may have been revoked or the number is incorrect."
      />
    </AppShell>
  ),
  component: CertificateDetail,
});

function CertificateDetail() {
  const { certificateId } = Route.useParams();
  const cert = certificates.find((c) => c.id === certificateId)!;
  const person = personOf(cert.personId);
  const course = courseOf(cert.courseId);
  const org = orgOf(cert.organisationId);
  const session = sessionOf(cert.sessionId);

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title={person?.name ?? "Certificate"}
          description={`${course?.name} · ${org?.name}`}
          crumbs={[
            { label: "Seal", to: "/" },
            { label: "Certificates", to: "/certificates" },
            { label: cert.number },
          ]}
          meta={
            <>
              <StatusChip tone={certificateTone[cert.status]}>
                {certificateStatusLabel[cert.status]}
              </StatusChip>
              <StatusChip tone="neutral" dot={false}>
                {cert.number}
              </StatusChip>
              <StatusChip
                tone={cert.delivery === "delivered" ? "success" : "neutral"}
                size="md"
                dot={false}
              >
                {deliveryLabel[cert.delivery]}
              </StatusChip>
            </>
          }
          actions={
            <>
              <Button variant="outline" onClick={() => toast.success("PDF downloaded")}>
                <Download className="size-4" /> Download PDF
              </Button>
              <Button
                variant="outline"
                onClick={() => toast.success("Certificate re-sent", { description: person?.email })}
              >
                <Mail className="size-4" /> Resend
              </Button>
              {cert.status === "hold" ? (
                <Button variant="seal" onClick={() => toast.success("Certificate released")}>
                  <RotateCcw className="size-4" /> Release hold
                </Button>
              ) : (
                <Button variant="outline" onClick={() => toast.warning("Certificate on hold")}>
                  <PauseCircle className="size-4" /> Place on hold
                </Button>
              )}
            </>
          }
        />

        <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
          <Panel className="p-6">
            <Tabs defaultValue="front">
              <TabsList className="rounded-lg">
                <TabsTrigger value="front">Front</TabsTrigger>
                <TabsTrigger value="back">Back</TabsTrigger>
              </TabsList>
              <TabsContent value="front" className="animate-[fade_0.3s_ease_both] pt-5">
                <CertificateFront
                  learner={person?.name ?? ""}
                  course={course?.name ?? ""}
                  completedOn={cert.completedOn}
                  number={cert.number}
                  organisation={org?.name ?? ""}
                />
              </TabsContent>
              <TabsContent value="back" className="animate-[fade_0.3s_ease_both] pt-5">
                <CertificateBack
                  number={cert.number}
                  validUntil={cert.validUntil}
                  course={course?.name ?? ""}
                />
              </TabsContent>
            </Tabs>
          </Panel>

          <aside className="space-y-5">
            <Panel className="p-5">
              <PanelHeader className="p-0 pb-3" title="Credential" />
              <div className="space-y-4">
                <Field
                  label="Learner"
                  value={
                    <Link
                      to="/people/$personId"
                      params={{ personId: cert.personId }}
                      className="hover:text-seal"
                    >
                      {person?.name}
                    </Link>
                  }
                />
                <Field
                  label="Course"
                  value={
                    <Link
                      to="/courses/$courseId"
                      params={{ courseId: cert.courseId }}
                      className="hover:text-seal"
                    >
                      {course?.name}
                    </Link>
                  }
                />
                <Field
                  label="Session"
                  value={
                    <Link
                      to="/sessions/$sessionId"
                      params={{ sessionId: cert.sessionId }}
                      className="hover:text-seal"
                    >
                      {session?.reference}
                    </Link>
                  }
                />
                <Field label="Completed on" value={cert.completedOn} />
                <Field label="Valid until" value={cert.validUntil} />
                <Field label="Organisation" value={org?.name} />
              </div>
            </Panel>

            <Panel>
              <PanelHeader title="History" subtitle="Operational trail" />
              <ol className="relative space-y-4 px-5 pb-5 pl-9">
                <span className="absolute top-1 bottom-6 left-[26px] w-px bg-border" />
                {[
                  { t: "Generated from session", d: `${session?.reference} · ${cert.completedOn}` },
                  { t: "Preview approved", d: "Priya Nandan · 2 days ago" },
                  {
                    t: `Delivery ${deliveryLabel[cert.delivery]?.toLowerCase()}`,
                    d: person?.email ?? "",
                  },
                ].map((e) => (
                  <li key={e.t} className="relative">
                    <span className="absolute top-1.5 -left-[18px] size-2.5 rounded-full border-2 border-surface bg-seal" />
                    <p className="text-sm font-medium">{e.t}</p>
                    <p className="truncate text-xs text-muted-foreground">{e.d}</p>
                  </li>
                ))}
              </ol>
            </Panel>

            {cert.status === "expired" ? (
              <Panel className="border-danger/30 bg-danger-soft/50 p-5">
                <p className="text-sm font-semibold text-danger">Credential expired</p>
                <p className="mt-1 text-xs text-danger/80">
                  Valid until {cert.validUntil}. Schedule a refresher session to renew.
                </p>
                <Button variant="outline" size="sm" className="mt-3" asChild>
                  <Link to="/sessions/new">Schedule refresher</Link>
                </Button>
              </Panel>
            ) : null}
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
