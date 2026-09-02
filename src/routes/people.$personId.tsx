import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Mail, ShieldCheck, Users } from "lucide-react";
import { AppShell } from "@/components/seal/app-shell";
import {
  Avatar,
  Bar,
  EmptyState,
  Field,
  Metric,
  PageHeader,
  Panel,
  PanelHeader,
} from "@/components/seal/primitives";
import {
  StatusChip,
  certificateTone,
  sessionTone,
  trackingTone,
} from "@/components/seal/status-chip";
import { Button } from "@/components/ui/button";
import {
  certificateStatusLabel,
  certificates,
  courseOf,
  orgOf,
  people,
  sessionStatusLabel,
  sessions,
  tracking,
  trackingStatusLabel,
} from "@/lib/seal-data";

export const Route = createFileRoute("/people/$personId")({
  loader: ({ params }) => {
    const person = people.find((p) => p.id === params.personId);
    if (!person) throw notFound();
    return { name: person.name };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.name} — Person · Seal` : "Person — Seal" },
      {
        name: "description",
        content: "Training and certificate history for a person involved in training operations.",
      },
      { property: "og:title", content: "Person profile — Seal" },
      { property: "og:description", content: "Sessions, certificates and activity for this person." },
    ],
  }),
  errorComponent: ({ error }) => <div role="alert">{error.message}</div>,
  notFoundComponent: () => (
    <AppShell>
      <EmptyState
        icon={Users}
        title="Person not found"
        description="This record may have been removed from the directory."
      />
    </AppShell>
  ),
  component: PersonDetail,
});

function PersonDetail() {
  const { personId } = Route.useParams();
  const person = people.find((p) => p.id === personId)!;
  const org = orgOf(person.organisationId);
  const personCerts = certificates.filter((c) => c.personId === person.id);
  const personTracking = tracking.filter((t) => t.personId === person.id);
  const relatedSessions =
    person.role === "Trainer" || person.role === "Coordinator"
      ? sessions.filter((s) => s.trainerId === person.id)
      : sessions.filter((s) => s.organisationId === person.organisationId);

  return (
    <AppShell>
      <div className="space-y-6">
        <Panel className="relative overflow-hidden">
          <div className="h-24 bg-gradient-ink">
            <div className="absolute inset-0 h-24 opacity-30 [background:radial-gradient(circle_at_85%_140%,var(--seal),transparent_55%)]" />
          </div>
          <div className="flex flex-wrap items-end gap-5 px-6 pt-0 pb-6">
            <Avatar
              initials={person.initials}
              tone="seal"
              className="-mt-8 size-20 rounded-3xl border-4 border-surface text-xl shadow-float"
            />
            <div className="min-w-0 flex-1 pt-3">
              <h1 className="text-display text-3xl leading-tight">{person.name}</h1>
              <p className="text-sm text-muted-foreground">
                {person.jobTitle} · {org?.name}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <StatusChip tone="seal">{person.role}</StatusChip>
                <StatusChip tone="neutral" dot={false}>
                  <Mail className="size-3" /> {person.email}
                </StatusChip>
                <StatusChip tone="neutral" dot={false}>
                  Active {person.lastActivity}
                </StatusChip>
              </div>
            </div>
            <div className="flex gap-2 pt-3">
              <Button variant="outline">
                <Mail className="size-4" /> Message
              </Button>
              <Button variant="seal" asChild>
                <Link to="/sessions/new">Enrol in session</Link>
              </Button>
            </div>
          </div>
        </Panel>

        <div className="grid gap-4 sm:grid-cols-3">
          <Panel className="p-5">
            <Metric label="Sessions" value={person.sessions} hint="all time" />
          </Panel>
          <Panel className="p-5">
            <Metric label="Certificates" value={person.certificates} hint="held" tone="seal" />
          </Panel>
          <Panel className="p-5">
            <Metric
              label="Training progress"
              value={`${person.progress}%`}
              hint="current programme"
              tone={person.progress === 100 ? "success" : "default"}
            />
            <Bar value={person.progress} className="mt-3" />
          </Panel>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
          <div className="space-y-5">
            <Panel>
              <PanelHeader
                title={person.role === "Learner" ? "Training history" : "Sessions delivered"}
                subtitle={`${relatedSessions.length} sessions`}
              />
              <div className="divide-y divide-border border-t border-border">
                {relatedSessions.map((s) => (
                  <Link
                    key={s.id}
                    to="/sessions/$sessionId"
                    params={{ sessionId: s.id }}
                    className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/40"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {courseOf(s.courseId)?.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {s.reference} · {s.date}
                      </p>
                    </div>
                    <StatusChip tone={sessionTone[s.status]} size="sm">
                      {sessionStatusLabel[s.status]}
                    </StatusChip>
                  </Link>
                ))}
              </div>
            </Panel>

            <Panel>
              <PanelHeader title="Certificates" subtitle={`${personCerts.length} credentials`} />
              <div className="grid gap-3 px-5 pb-5 sm:grid-cols-2">
                {personCerts.length ? (
                  personCerts.map((c) => (
                    <Link
                      key={c.id}
                      to="/certificates/$certificateId"
                      params={{ certificateId: c.id }}
                      className="hover-lift rounded-xl border border-border p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {courseOf(c.courseId)?.name}
                          </p>
                          <p className="font-mono text-[11px] text-muted-foreground">{c.number}</p>
                        </div>
                        <StatusChip tone={certificateTone[c.status]} size="sm">
                          {certificateStatusLabel[c.status]}
                        </StatusChip>
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground">
                        Valid until {c.validUntil}
                      </p>
                    </Link>
                  ))
                ) : (
                  <div className="sm:col-span-2">
                    <EmptyState
                      icon={ShieldCheck}
                      title="No certificates yet"
                      description="Credentials appear here once this person completes training."
                    />
                  </div>
                )}
              </div>
            </Panel>
          </div>

          <aside className="space-y-5">
            <Panel className="p-5">
              <PanelHeader className="p-0 pb-3" title="Details" />
              <div className="space-y-4">
                <Field label="Role" value={person.role} />
                <Field
                  label="Organisation"
                  value={
                    <Link
                      to="/organisations/$orgId"
                      params={{ orgId: person.organisationId }}
                      className="hover:text-seal"
                    >
                      {org?.name}
                    </Link>
                  }
                />
                <Field label="Email" value={person.email} />
                <Field label="Last activity" value={person.lastActivity} />
              </div>
            </Panel>

            <Panel>
              <PanelHeader title="Tracking" subtitle="Items involving this person" />
              <div className="space-y-3 px-5 pb-5">
                {personTracking.length ? (
                  personTracking.map((t) => (
                    <div key={t.id} className="rounded-xl border border-border p-4">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium">{t.label}</p>
                        <StatusChip tone={trackingTone[t.status]} size="sm">
                          {trackingStatusLabel[t.status]}
                        </StatusChip>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">Due {t.due}</p>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    icon={ShieldCheck}
                    title="Nothing outstanding"
                    description="No open tracking items for this person."
                  />
                )}
              </div>
            </Panel>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
