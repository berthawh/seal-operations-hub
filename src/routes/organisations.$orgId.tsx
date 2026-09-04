import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Building2, CalendarDays, MapPin, ShieldCheck, Users } from "lucide-react";
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
import { StatusChip, certificateTone, sessionTone } from "@/components/seal/status-chip";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  activity,
  certificateStatusLabel,
  certificates,
  courseOf,
  courses,
  organisations,
  people,
  personOf,
  sessionStatusLabel,
  sessions,
} from "@/lib/seal-data";

export const Route = createFileRoute("/organisations/$orgId")({
  loader: ({ params }) => {
    const org = organisations.find((o) => o.id === params.orgId);
    return { name: org?.name ?? "Organisation" };
  },

  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.name} — Organisation · Seal` : "Organisation — Seal" },
      {
        name: "description",
        content:
          "Organisation workspace with people, sessions, courses, certificates and recent activity.",
      },
      { property: "og:title", content: "Organisation detail — Seal" },
      { property: "og:description", content: "People, sessions and certificates for this account." },
    ],
  }),
  errorComponent: ({ error }) => <div role="alert">{error.message}</div>,
  notFoundComponent: () => (
    <AppShell>
      <EmptyState
        icon={Building2}
        title="Organisation not found"
        description="This account may have been removed."
      />
    </AppShell>
  ),
  component: OrganisationDetail,
});

function OrganisationDetail() {
  const { orgId } = Route.useParams();
  const known = organisations.find((o) => o.id === orgId);
  const org = known ?? {
    id: orgId,
    name: "Organisation",
    shortName: "Organisation",
    sector: "Not set",
    location: "Not set",
    compliance: 0,
    people: 0,
    sessions: 0,
    certificates: 0,
  };
  const orgPeople = people.filter((p) => p.organisationId === org.id);
  const orgSessions = sessions.filter((s) => s.organisationId === org.id);
  const orgCerts = certificates.filter((c) => c.organisationId === org.id);


  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title={org.name}
          description={`${org.sector} · placeholder account record`}
          crumbs={[
            { label: "Seal", to: "/" },
            { label: "Organisations", to: "/organisations" },
            { label: org.shortName },
          ]}
          meta={
            <>
              <StatusChip tone="neutral" dot={false}>
                <MapPin className="size-3" /> {org.location}
              </StatusChip>
              <StatusChip
                tone={org.compliance > 80 ? "success" : org.compliance > 70 ? "warning" : "danger"}
              >
                {org.compliance}% compliant
              </StatusChip>
            </>
          }
          actions={
            <>
              <Button variant="outline" asChild>
                <Link to="/certificates">
                  <ShieldCheck className="size-4" /> Certificates
                </Link>
              </Button>
              <Button variant="seal" asChild>
                <Link to="/sessions/new">
                  <CalendarDays className="size-4" /> Schedule session
                </Link>
              </Button>
            </>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Panel className="p-5">
            <Metric label="People" value={org.people} hint="registered" />
          </Panel>
          <Panel className="p-5">
            <Metric label="Sessions" value={org.sessions} hint="all time" tone="seal" />
          </Panel>
          <Panel className="p-5">
            <Metric label="Certificates" value={org.certificates} hint="issued" tone="success" />
          </Panel>
          <Panel className="p-5">
            <Metric label="Compliance" value={`${org.compliance}%`} hint="current" />
            <Bar
              value={org.compliance}
              tone={org.compliance > 80 ? "success" : "warning"}
              className="mt-3"
            />
          </Panel>
        </div>

        <OrgAccessPanel orgId={orgId} />



        <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
          <Panel>
            <Tabs defaultValue="people">
              <div className="border-b border-border px-4 pt-4">
                <TabsList className="rounded-lg">
                  <TabsTrigger value="people">People</TabsTrigger>
                  <TabsTrigger value="sessions">Sessions</TabsTrigger>
                  <TabsTrigger value="courses">Courses</TabsTrigger>
                  <TabsTrigger value="certificates">Certificates</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="people" className="animate-[fade_0.3s_ease_both] divide-y divide-border">
                {orgPeople.length ? (
                  orgPeople.map((p) => (
                    <Link
                      key={p.id}
                      to="/people/$personId"
                      params={{ personId: p.id }}
                      className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/40"
                    >
                      <Avatar initials={p.initials} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{p.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{p.jobTitle}</p>
                      </div>
                      <StatusChip tone="neutral" size="sm" dot={false}>
                        {p.role}
                      </StatusChip>
                    </Link>
                  ))
                ) : (
                  <div className="p-5">
                    <EmptyState
                      icon={Users}
                      title="No people yet"
                      description="Add contacts and learners to this organisation."
                    />
                  </div>
                )}
              </TabsContent>

              <TabsContent
                value="sessions"
                className="animate-[fade_0.3s_ease_both] divide-y divide-border"
              >
                {orgSessions.map((s) => (
                  <Link
                    key={s.id}
                    to="/sessions/$sessionId"
                    params={{ sessionId: s.id }}
                    className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/40"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{courseOf(s.courseId)?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.reference} · {s.date}
                      </p>
                    </div>
                    <StatusChip tone={sessionTone[s.status]} size="sm">
                      {sessionStatusLabel[s.status]}
                    </StatusChip>
                  </Link>
                ))}
              </TabsContent>

              <TabsContent value="courses" className="animate-[fade_0.3s_ease_both] p-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  {courses
                    .filter((c) => c.status === "active")
                    .map((c) => (
                      <Link
                        key={c.id}
                        to="/courses/$courseId"
                        params={{ courseId: c.id }}
                        className="hover-lift rounded-xl border border-border p-4"
                      >
                        <p className="text-sm font-semibold">{c.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {c.code} · {c.validityMonths} month validity
                        </p>
                      </Link>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="certificates" className="animate-[fade_0.3s_ease_both] p-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  {orgCerts.map((c) => (
                    <Link
                      key={c.id}
                      to="/certificates/$certificateId"
                      params={{ certificateId: c.id }}
                      className="hover-lift rounded-xl border border-border p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {personOf(c.personId)?.name}
                          </p>
                          <p className="font-mono text-[11px] text-muted-foreground">{c.number}</p>
                        </div>
                        <StatusChip tone={certificateTone[c.status]} size="sm">
                          {certificateStatusLabel[c.status]}
                        </StatusChip>
                      </div>
                    </Link>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </Panel>

          <aside className="space-y-5">
            <Panel className="p-5">
              <PanelHeader className="p-0 pb-3" title="Organisation information" />
              <div className="space-y-4">
                <Field label="Sector" value={org.sector} />
                <Field label="Location" value={org.location} />
                <Field label="Account code" value={org.shortName} />
                <Field label="Primary contact" value="Placeholder — not supplied" />
              </div>
            </Panel>

            <Panel>
              <PanelHeader title="Recent activity" />
              <ol className="space-y-4 px-5 pb-5">
                {activity.slice(0, 4).map((a) => (
                  <li key={a.id} className="flex gap-3">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-seal" />
                    <div className="min-w-0">
                      <p className="text-sm leading-snug font-medium">{a.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{a.time}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Panel>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
