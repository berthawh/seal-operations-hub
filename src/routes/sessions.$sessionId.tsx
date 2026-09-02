import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  MapPin,
  MoreHorizontal,
  Radar,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/seal/app-shell";
import {
  Avatar,
  Bar,
  EmptyState,
  Field,
  PageHeader,
  Panel,
  PanelHeader,
  ProgressRing,
} from "@/components/seal/primitives";
import {
  StatusChip,
  certificateTone,
  sessionTone,
  trackingTone,
} from "@/components/seal/status-chip";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  certificateStatusLabel,
  certificates,
  courseOf,
  orgOf,
  people,
  personOf,
  sessionStatusLabel,
  sessions,
  tracking,
  trackingStatusLabel,
} from "@/lib/seal-data";

export const Route = createFileRoute("/sessions/$sessionId")({
  loader: ({ params }) => {
    const session = sessions.find((s) => s.id === params.sessionId);
    if (!session) throw notFound();
    return { reference: session.reference };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.reference} — Session workspace · Seal` : "Session — Seal" },
      {
        name: "description",
        content:
          "Session workspace covering roster, attendance, certificates, tracking and activity history.",
      },
      { property: "og:title", content: "Session workspace — Seal" },
      {
        property: "og:description",
        content: "Roster, attendance, certificates and tracking for a training session.",
      },
    ],
  }),
  errorComponent: ({ error }) => <div role="alert">{error.message}</div>,
  notFoundComponent: () => (
    <AppShell>
      <EmptyState
        icon={CalendarDays}
        title="Session not found"
        description="This session may have been removed or the reference is incorrect."
      />
    </AppShell>
  ),
  component: SessionDetail,
});

function SessionDetail() {
  const { sessionId } = Route.useParams();
  const session = sessions.find((s) => s.id === sessionId)!;
  const course = courseOf(session.courseId);
  const org = orgOf(session.organisationId);
  const trainer = personOf(session.trainerId);
  const roster = people.filter((p) => p.role === "Learner");
  const sessionCerts = certificates.filter((c) => c.sessionId === session.id);
  const sessionTracking = tracking.filter((t) => t.sessionId === session.id);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({ "per-2": true });
  const [drawer, setDrawer] = useState<string | null>(null);
  const drawerPerson = roster.find((p) => p.id === drawer);

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title={course?.name ?? "Session"}
          description={`${session.reference} · ${org?.name}`}
          crumbs={[
            { label: "Seal", to: "/" },
            { label: "Sessions", to: "/sessions" },
            { label: session.reference },
          ]}
          meta={
            <>
              <StatusChip tone={sessionTone[session.status]}>
                {sessionStatusLabel[session.status]}
              </StatusChip>
              <StatusChip tone="neutral" dot={false}>
                <CalendarDays className="size-3" /> {session.date}
              </StatusChip>
              <StatusChip tone="neutral" dot={false}>
                <Clock className="size-3" /> {session.time}
              </StatusChip>
              <StatusChip tone="neutral" dot={false}>
                <MapPin className="size-3" /> {session.location}
              </StatusChip>
            </>
          }
          actions={
            <>
              <Button
                variant="outline"
                onClick={() => toast.success("Roster confirmed", { description: session.reference })}
              >
                <CheckCircle2 className="size-4" /> Confirm attendance
              </Button>
              <Button variant="seal" asChild>
                <Link to="/certificates/new">
                  <ShieldCheck className="size-4" /> Generate certificates
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="More session actions">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-pop">
                  <DropdownMenuItem>Edit session</DropdownMenuItem>
                  <DropdownMenuItem>Duplicate session</DropdownMenuItem>
                  <DropdownMenuItem>Export roster</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-danger">Cancel session</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          }
        />

        <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
          <div className="space-y-5">
            <Panel className="p-5">
              <div className="flex flex-wrap items-center gap-6">
                <ProgressRing value={session.progress} size={92} stroke={9} />
                <div className="grid flex-1 grid-cols-2 gap-5 sm:grid-cols-4">
                  <Field label="Attendees" value={`${session.attendees}/${session.capacity}`} />
                  <Field label="Certificates" value={`${session.certificatesIssued} issued`} />
                  <Field label="Tracking" value={`${session.trackingOpen} open`} />
                  <Field label="Course code" value={course?.code} />
                </div>
              </div>
            </Panel>

            <Panel>
              <Tabs defaultValue="roster">
                <div className="border-b border-border px-4 pt-4">
                  <TabsList className="rounded-lg">
                    <TabsTrigger value="roster">
                      <Users className="size-3.5" /> Roster
                    </TabsTrigger>
                    <TabsTrigger value="certificates">
                      <ShieldCheck className="size-3.5" /> Certificates
                    </TabsTrigger>
                    <TabsTrigger value="tracking">
                      <Radar className="size-3.5" /> Tracking
                    </TabsTrigger>
                    <TabsTrigger value="activity">
                      <Activity className="size-3.5" /> Activity
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent
                  value="roster"
                  className="animate-[fade_0.3s_ease_both] divide-y divide-border"
                >
                  {roster.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/40"
                    >
                      <Avatar initials={p.initials} />
                      <button
                        onClick={() => setDrawer(p.id)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <p className="truncate text-sm font-semibold hover:text-seal">{p.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{p.jobTitle}</p>
                      </button>
                      <div className="hidden w-28 sm:block">
                        <Bar value={p.progress} tone="seal" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Present</span>
                        <Switch
                          checked={attendance[p.id] ?? false}
                          onCheckedChange={(v) => {
                            setAttendance((prev) => ({ ...prev, [p.id]: v }));
                            toast(v ? "Marked present" : "Marked absent", { description: p.name });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="certificates" className="animate-[fade_0.3s_ease_both] p-5">
                  {sessionCerts.length ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {sessionCerts.map((c) => (
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
                              <p className="font-mono text-[11px] text-muted-foreground">
                                {c.number}
                              </p>
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
                      description="Certificates are generated once attendance is confirmed for this session."
                      action={
                        <Button variant="seal" size="sm" asChild>
                          <Link to="/certificates/new">Create certificate</Link>
                        </Button>
                      }
                    />
                  )}
                </TabsContent>

                <TabsContent value="tracking" className="animate-[fade_0.3s_ease_both] p-5">
                  {sessionTracking.length ? (
                    <div className="space-y-3">
                      {sessionTracking.map((t) => (
                        <div key={t.id} className="rounded-xl border border-border p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold">{t.label}</p>
                              <p className="text-xs text-muted-foreground">{t.note}</p>
                            </div>
                            <StatusChip tone={trackingTone[t.status]} size="sm">
                              {trackingStatusLabel[t.status]}
                            </StatusChip>
                          </div>
                          <Bar
                            value={t.progress}
                            tone={t.status === "overdue" ? "danger" : "seal"}
                            className="mt-3"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Radar}
                      title="Nothing being tracked"
                      description="Tracking items appear here when a session needs follow-up after delivery."
                    />
                  )}
                </TabsContent>

                <TabsContent value="activity" className="animate-[fade_0.3s_ease_both] p-5">
                  <ol className="relative space-y-5 pl-5">
                    <span className="absolute top-1 bottom-2 left-[5px] w-px bg-border" />
                    {[
                      { t: "Session created", d: "Priya Nandan · 2 weeks ago" },
                      { t: "Trainer assigned", d: `${trainer?.name} · 12 days ago` },
                      { t: "Roster updated", d: "6 learners added · 5 days ago" },
                      { t: "Status changed", d: `${sessionStatusLabel[session.status]} · today` },
                    ].map((e) => (
                      <li key={e.t} className="relative">
                        <span className="absolute top-1.5 -left-5 size-2.5 rounded-full border-2 border-surface bg-seal" />
                        <p className="text-sm font-medium">{e.t}</p>
                        <p className="text-xs text-muted-foreground">{e.d}</p>
                      </li>
                    ))}
                  </ol>
                </TabsContent>
              </Tabs>
            </Panel>
          </div>

          <aside className="space-y-5">
            <Panel className="p-5">
              <PanelHeader className="p-0 pb-3" title="Session overview" />
              <div className="space-y-4">
                <Field
                  label="Course"
                  value={
                    <Link
                      to="/courses/$courseId"
                      params={{ courseId: session.courseId }}
                      className="hover:text-seal"
                    >
                      {course?.name}
                    </Link>
                  }
                />
                <Field
                  label="Organisation"
                  value={
                    <Link
                      to="/organisations/$orgId"
                      params={{ orgId: session.organisationId }}
                      className="hover:text-seal"
                    >
                      {org?.name}
                    </Link>
                  }
                />
                <Field
                  label="Trainer"
                  value={
                    <span className="flex items-center gap-2">
                      <UserRound className="size-3.5 text-muted-foreground" /> {trainer?.name}
                    </span>
                  }
                />
                <Field label="Certificate validity" value={`${course?.validityMonths} months`} />
              </div>
            </Panel>

            <Panel className="p-5">
              <PanelHeader className="p-0 pb-3" title="Session actions" />
              <div className="space-y-2">
                {[
                  { label: "Mark session complete", icon: CheckCircle2 },
                  { label: "Send joining instructions", icon: ClipboardList },
                  { label: "Request assessment results", icon: Activity },
                ].map((a) => (
                  <Button
                    key={a.label}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => toast.success(a.label)}
                  >
                    <a.icon className="size-4" /> {a.label}
                  </Button>
                ))}
              </div>
            </Panel>

            <Panel className="border-warning/30 bg-warning-soft/60 p-5">
              <div className="flex items-start gap-3">
                <Radar className="mt-0.5 size-4 text-warning-foreground" />
                <div>
                  <p className="text-sm font-semibold">Requires attention</p>
                  <p className="mt-1 text-xs text-warning-foreground/80">
                    {session.trackingOpen} tracking item(s) still open for this session.
                  </p>
                </div>
              </div>
            </Panel>
          </aside>
        </div>
      </div>

      <Sheet open={Boolean(drawer)} onOpenChange={(o) => !o && setDrawer(null)}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{drawerPerson?.name}</SheetTitle>
            <SheetDescription>{drawerPerson?.jobTitle}</SheetDescription>
          </SheetHeader>
          {drawerPerson ? (
            <div className="space-y-5 px-4 pb-6">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Organisation" value={orgOf(drawerPerson.organisationId)?.shortName} />
                <Field label="Role" value={drawerPerson.role} />
                <Field label="Sessions" value={drawerPerson.sessions} />
                <Field label="Certificates" value={drawerPerson.certificates} />
              </div>
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Training progress</p>
                <Bar value={drawerPerson.progress} />
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/people/$personId" params={{ personId: drawerPerson.id }}>
                  Open full profile
                </Link>
              </Button>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}
