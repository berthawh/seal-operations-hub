import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CalendarPlus, KeyRound, ShieldCheck, Users } from "lucide-react";
import { AppShell } from "@/components/seal/app-shell";
import {
  Avatar,
  EmptyState,
  ListSkeleton,
  Metric,
  PageHeader,
  Panel,
  PanelHeader,
} from "@/components/seal/primitives";
import { StatusChip, certificateTone } from "@/components/seal/status-chip";
import { Button } from "@/components/ui/button";
import {
  certificateStatusLabel,
  certificates,
  courseOf,
  courses,
  people,
  personOf,
} from "@/lib/seal-data";
import { getMyPortal, listBookingRequests, trainingPosition } from "@/lib/organisations.functions";

export const Route = createFileRoute("/portal/")({
  head: () => ({
    meta: [
      { title: "Partner portal — Seal" },
      {
        name: "description",
        content:
          "Partner organisations book training places, manage the staff they send and follow certificate status.",
      },
      { property: "og:title", content: "Partner portal — Seal" },
      { property: "og:description", content: "Book places and track your team's certificates." },
    ],
  }),
  component: PortalPage,
});

function PortalPage() {
  const portalFn = useServerFn(getMyPortal);
  const listFn = useServerFn(listBookingRequests);

  const portal = useQuery({
    queryKey: ["my-portal"],
    queryFn: () => portalFn(),
    enabled: typeof window !== "undefined",
    retry: false,
  });
  const requests = useQuery({
    queryKey: ["booking-requests"],
    queryFn: () => listFn(),
    enabled: typeof window !== "undefined",
    retry: false,
  });

  const org = portal.data?.org ?? null;

  if (portal.isLoading) {
    return (
      <AppShell>
        <Panel className="p-6">
          <ListSkeleton rows={4} />
        </Panel>
      </AppShell>
    );
  }

  if (!org) {
    return (
      <AppShell>
        <EmptyState
          icon={KeyRound}
          title="No portal access"
          description="This area is for invited partner organisations. Ask the Simplecare team to send you an invitation."
        />
      </AppShell>
    );
  }

  const myRequests = requests.data ?? [];
  const orgPeople = people.filter((p) => p.organisationId === org.id);
  const orgCerts = certificates.filter((c) => c.organisationId === org.id);
  const position = trainingPosition(org.preferredCourseIds, myRequests);
  const usual = courses.filter((c) => org.preferredCourseIds.includes(c.id));

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title={org.name}
          description="Your training portal. Book places, keep your staff list current and follow certificate status."
          crumbs={[{ label: "Portal" }, { label: org.name }]}
          meta={
            <>
              <StatusChip tone="neutral" dot={false}>
                {org.orgType}
              </StatusChip>
              <StatusChip tone="info" dot={false}>
                {org.relationship}
              </StatusChip>
              {org.status ? (
                <StatusChip tone="warning" dot={false}>
                  {org.status}
                </StatusChip>
              ) : null}
            </>
          }
          actions={
            org.canBookSessions ? (
              <Button variant="seal" asChild>
                <Link to="/portal/book">
                  <CalendarPlus className="size-4" /> Book a session
                </Link>
              </Button>
            ) : null
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Panel className="p-5">
            <Metric
              label="Awaiting confirmation"
              value={myRequests.filter((r) => r.status === "requested").length}
              hint="with the training team"
            />
          </Panel>
          <Panel className="p-5">
            <Metric
              label="Confirmed"
              value={myRequests.filter((r) => r.status === "confirmed").length}
              hint="places held"
              tone="success"
            />
          </Panel>
          <Panel className="p-5">
            <Metric label="People invited" value={org.memberCount} hint="portal users" tone="seal" />
          </Panel>
          <Panel className="p-5">
            <Metric
              label="Training position"
              value={`${position}%`}
              hint={
                usual.length
                  ? `${usual.length} usual course${usual.length === 1 ? "" : "s"} covered`
                  : "of your requests confirmed"
              }
              tone={position >= 80 ? "success" : position >= 50 ? "warning" : "danger"}
            />
          </Panel>
        </div>

        <Panel>
          <PanelHeader
            title="Your bookings"
            subtitle="Every place is confirmed by the training team first"
          />
          <div className="divide-y">
            {myRequests.length ? (
              myRequests.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3 p-5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{r.courseName}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.seats} place{r.seats === 1 ? "" : "s"}
                      {r.preferredDate ? ` · ${r.preferredDate}` : ""} · {r.preferredTime}–{r.endTime}
                    </p>
                  </div>
                  <StatusChip
                    tone={
                      r.status === "confirmed"
                        ? "success"
                        : r.status === "declined"
                          ? "danger"
                          : "warning"
                    }
                    size="sm"
                  >
                    {r.status === "confirmed"
                      ? "Confirmed"
                      : r.status === "declined"
                        ? "Declined"
                        : "Requested"}
                  </StatusChip>
                </div>
              ))
            ) : (
              <div className="p-6 text-sm text-muted-foreground">
                {org.canBookSessions
                  ? "No bookings yet. Use Book a session to ask for your first places."
                  : "Booking is not enabled for your organisation yet. Contact the training team."}
              </div>
            )}
          </div>
        </Panel>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel>
            <PanelHeader title="Your staff" subtitle="People we hold training records for" />
            <div className="divide-y">
              {orgPeople.length ? (
                orgPeople.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 p-4">
                    <Avatar initials={p.initials} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{p.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{p.jobTitle}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-sm text-muted-foreground">
                  No staff recorded yet. Add names when you book places.
                </div>
              )}
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Certificates" subtitle="Issued to your staff" />
            <div className="divide-y">
              {org.canViewCertificates && orgCerts.length ? (
                orgCerts.map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{personOf(c.personId)?.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {courseOf(c.courseId)?.name}
                      </p>
                    </div>
                    <StatusChip tone={certificateTone[c.status]} size="sm">
                      {certificateStatusLabel[c.status]}
                    </StatusChip>
                  </div>
                ))
              ) : (
                <div className="p-6 text-sm text-muted-foreground">
                  {org.canViewCertificates
                    ? "No certificates issued yet."
                    : "Certificates are shared by the training team on request."}
                </div>
              )}
            </div>
          </Panel>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Panel className="flex items-center gap-3 p-5 text-sm text-muted-foreground">
            <Users className="size-4" />
            {org.canManageStaff
              ? "You can keep your staff list up to date."
              : "Staff list is managed by the training team."}
          </Panel>
          <Panel className="flex items-center gap-3 p-5 text-sm text-muted-foreground">
            <ShieldCheck className="size-4" />
            Classroom courses run 9:00am–5:00pm with a one hour break. Certificates are valid for 12
            months.
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
