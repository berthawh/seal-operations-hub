import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Building2,
  CalendarDays,
  Globe,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Smartphone,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/seal/app-shell";
import { OrgAccessPanel } from "@/components/seal/org-access-panel";

import {
  Avatar,
  EmptyState,
  Field,
  ListSkeleton,
  Metric,
  PageHeader,
  Panel,
  PanelHeader,
} from "@/components/seal/primitives";
import { StatusChip, certificateTone, sessionTone } from "@/components/seal/status-chip";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  certificateStatusLabel,
  certificates,
  courseOf,
  courses,
  people,
  personOf,
  sessionStatusLabel,
  sessions,
} from "@/lib/seal-data";
import { getOrganisation, trainingPosition } from "@/lib/organisations.functions";

export const Route = createFileRoute("/organisations/$orgId")({
  head: () => ({
    meta: [
      { title: "Organisation — Seal" },
      {
        name: "description",
        content:
          "Organisation workspace with contact details, people, sessions, certificates and recent activity.",
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

const relativeTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `${Math.max(mins, 1)} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

function OrganisationDetail() {
  const { orgId } = Route.useParams();
  const getOrgFn = useServerFn(getOrganisation);

  const query = useQuery({
    queryKey: ["organisation", orgId],
    queryFn: () => getOrgFn({ data: { id: orgId } }),
    enabled: typeof window !== "undefined",
    retry: false,
  });

  if (query.isLoading) {
    return (
      <AppShell>
        <Panel className="p-6">
          <ListSkeleton rows={5} />
        </Panel>
      </AppShell>
    );
  }

  const org = query.data?.org ?? null;
  if (!org) {
    return (
      <AppShell>
        <EmptyState
          icon={Building2}
          title={query.error ? "Sign in to see this organisation" : "Organisation not found"}
          description={
            query.error
              ? "Organisation records are only visible to signed-in team members."
              : "This account may have been removed."
          }
        />
      </AppShell>
    );
  }

  const bookings = query.data?.bookings ?? [];
  const members = query.data?.members ?? [];
  const orgPeople = people.filter((p) => p.organisationId === org.id);
  const orgSessions = sessions.filter((s) => s.organisationId === org.id);
  const orgCerts = certificates.filter((c) => c.organisationId === org.id);
  const preferred = org.preferredCourseIds.length
    ? courses.filter((c) => org.preferredCourseIds.includes(c.id))
    : [];

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title={org.name}
          description={`${org.orgType} · ${org.relationship}${org.status ? ` · ${org.status}` : ""}`}
          crumbs={[
            { label: "Seal", to: "/" },
            { label: "Organisations", to: "/organisations" },
            { label: org.shortName ?? org.name },
          ]}
          meta={
            <>
              {org.location ? (
                <StatusChip tone="neutral" dot={false}>
                  <MapPin className="size-3" /> {org.location}
                </StatusChip>
              ) : null}
              <StatusChip tone={org.portalEnabled ? "success" : "neutral"} dot={false}>
                {org.portalEnabled ? `Portal on · ${members.length} invited` : "No portal access"}
              </StatusChip>
              {bookings.filter((b) => b.status === "requested").length ? (
                <StatusChip tone="warning" dot={false}>
                  {bookings.filter((b) => b.status === "requested").length} request awaiting
                </StatusChip>
              ) : null}
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
            <Metric label="Portal users" value={members.length} hint="invited" tone="seal" />
          </Panel>
          <Panel className="p-5">
            <Metric
              label="Open requests"
              value={bookings.filter((b) => b.status === "requested").length}
              hint="awaiting decision"
            />
          </Panel>
          <Panel className="p-5">
            <Metric
              label="Confirmed bookings"
              value={bookings.filter((b) => b.status === "confirmed").length}
              hint="places held"
              tone="success"
            />
          </Panel>
          <Panel className="p-5">
            <Metric
              label="Training position"
              value={`${trainingPosition(org.preferredCourseIds, bookings)}%`}
              hint={
                preferred.length
                  ? `${preferred.length} usual course${preferred.length === 1 ? "" : "s"} covered`
                  : "of their requests confirmed"
              }
              tone={
                trainingPosition(org.preferredCourseIds, bookings) >= 80
                  ? "success"
                  : trainingPosition(org.preferredCourseIds, bookings) >= 50
                    ? "warning"
                    : "danger"
              }
            />
          </Panel>
        </div>

        <OrgAccessPanel orgId={orgId} />

        <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
          <Panel>
            <Tabs defaultValue="bookings">
              <div className="border-b border-border px-4 pt-4">
                <TabsList className="rounded-lg">
                  <TabsTrigger value="bookings">Bookings</TabsTrigger>
                  <TabsTrigger value="people">People</TabsTrigger>
                  <TabsTrigger value="sessions">Sessions</TabsTrigger>
                  <TabsTrigger value="courses">Courses</TabsTrigger>
                  <TabsTrigger value="certificates">Certificates</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent
                value="bookings"
                className="animate-[fade_0.3s_ease_both] divide-y divide-border"
              >
                {bookings.length ? (
                  bookings.map((b) => (
                    <div key={b.id} className="flex items-center justify-between gap-3 px-5 py-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{b.courseName}</p>
                        <p className="text-xs text-muted-foreground">
                          {b.seats} place{b.seats === 1 ? "" : "s"}
                          {b.preferredDate ? ` · ${b.preferredDate}` : ""} · {b.preferredTime}–
                          {b.endTime} ·{" "}
                          {relativeTime(b.createdAt)}
                        </p>
                      </div>
                      <StatusChip
                        tone={
                          b.status === "confirmed"
                            ? "success"
                            : b.status === "declined"
                              ? "danger"
                              : "warning"
                        }
                        size="sm"
                      >
                        {b.status === "confirmed"
                          ? "Confirmed"
                          : b.status === "declined"
                            ? "Declined"
                            : "Requested"}
                      </StatusChip>
                    </div>
                  ))
                ) : (
                  <div className="p-5">
                    <EmptyState
                      icon={CalendarDays}
                      title="No booking requests yet"
                      description="Requests raised from their portal appear here."
                    />
                  </div>
                )}
              </TabsContent>

              <TabsContent
                value="people"
                className="animate-[fade_0.3s_ease_both] divide-y divide-border"
              >
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
                {orgSessions.length ? (
                  orgSessions.map((s) => (
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
                  ))
                ) : (
                  <div className="p-5">
                    <EmptyState
                      icon={CalendarDays}
                      title="No sessions yet"
                      description="Schedule a session for this organisation."
                    />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="courses" className="animate-[fade_0.3s_ease_both] p-5">
                {preferred.length ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {preferred.map((c) => (
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
                ) : (
                  <EmptyState
                    icon={Building2}
                    title="No usual courses set"
                    description="Choose the courses this organisation normally books when you edit their record."
                  />
                )}
              </TabsContent>

              <TabsContent value="certificates" className="animate-[fade_0.3s_ease_both] p-5">
                {orgCerts.length ? (
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
                ) : (
                  <EmptyState
                    icon={ShieldCheck}
                    title="No certificates yet"
                    description="Certificates appear here once their staff complete training."
                  />
                )}
              </TabsContent>
            </Tabs>
          </Panel>

          <aside className="space-y-5">
            <Panel className="p-5">
              <div className="flex items-center gap-3 pb-4">
                {org.logoUrl ? (
                  <img
                    src={org.logoUrl}
                    alt=""
                    className="size-11 rounded-xl border border-border object-contain p-1"
                  />
                ) : (
                  <Avatar initials={org.shortName ?? "OR"} className="size-11 rounded-xl" />
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{org.name}</p>
                  <p className="text-xs text-muted-foreground">{org.orgType}</p>
                </div>
              </div>
              <div className="space-y-4 border-t border-border pt-4">
                <Field label="Main person to contact" value={org.contactName ?? "Not supplied"} />
                <Field
                  label="Email"
                  value={
                    org.contactEmail ? (
                      <span className="flex items-center gap-1.5">
                        <Mail className="size-3.5 text-muted-foreground" />
                        {org.contactEmail}
                      </span>
                    ) : (
                      "Not supplied"
                    )
                  }
                />
                <Field
                  label="Mobile"
                  value={
                    org.contactMobile ? (
                      <span className="flex items-center gap-1.5">
                        <Smartphone className="size-3.5 text-muted-foreground" />
                        {org.contactMobile}
                      </span>
                    ) : (
                      "Not supplied"
                    )
                  }
                />
                <Field
                  label="Landline"
                  value={
                    org.contactLandline ? (
                      <span className="flex items-center gap-1.5">
                        <Phone className="size-3.5 text-muted-foreground" />
                        {org.contactLandline}
                      </span>
                    ) : (
                      "Not supplied"
                    )
                  }
                />
                <Field
                  label="Website"
                  value={
                    org.website ? (
                      <span className="flex items-center gap-1.5">
                        <Globe className="size-3.5 text-muted-foreground" />
                        {org.website}
                      </span>
                    ) : (
                      "Not supplied"
                    )
                  }
                />
                <Field label="Location" value={org.location ?? "Not supplied"} />
                <Field label="Account code" value={org.shortName ?? "—"} />
                {org.notes ? <Field label="Notes" value={org.notes} /> : null}
              </div>
            </Panel>

            <Panel>
              <PanelHeader title="Recent activity" />
              {bookings.length ? (
                <ol className="space-y-4 px-5 pb-5">
                  {bookings.slice(0, 5).map((b) => (
                    <li key={b.id} className="flex gap-3">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-seal" />
                      <div className="min-w-0">
                        <p className="text-sm leading-snug font-medium">
                          {b.status === "confirmed"
                            ? "Booking confirmed"
                            : b.status === "declined"
                              ? "Request declined"
                              : "Places requested"}{" "}
                          · {b.courseName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {b.seats} place{b.seats === 1 ? "" : "s"} · {b.preferredTime}–{b.endTime} ·{" "}
                          {relativeTime(b.createdAt)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="px-5 pb-5 text-xs text-muted-foreground">
                  Nothing has happened on this account yet.
                </p>
              )}
            </Panel>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
