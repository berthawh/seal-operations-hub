import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileCheck2,
  Radar,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  Users,
} from "lucide-react";
import { AppShell, CreateMenu } from "@/components/seal/app-shell";
import {
  Bar,
  EmptyState,
  Metric,
  PageHeader,
  Panel,
  PanelHeader,
  ProgressRing,
  Avatar,
} from "@/components/seal/primitives";
import {
  StatusChip,
  certificateTone,
  sessionTone,
  trackingTone,
} from "@/components/seal/status-chip";
import { Button } from "@/components/ui/button";
import {
  activity,
  certificateStatusLabel,
  certificates,
  courseOf,
  organisations,
  orgOf,
  personOf,
  sessionStatusLabel,
  sessions,
  tracking,
  trackingStatusLabel,
} from "@/lib/seal-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Seal Training Operations" },
      {
        name: "description",
        content:
          "Operational command centre for training sessions, learners, certificates and compliance tracking.",
      },
      { property: "og:title", content: "Dashboard — Seal Training Operations" },
      {
        property: "og:description",
        content: "Monitor sessions, certificates and tracking from one command centre.",
      },
    ],
  }),
  component: Dashboard,
});

const kpis = [
  { label: "Active sessions", value: "6", hint: "2 this week", icon: CalendarDays, tone: "seal" },
  { label: "Learners in training", value: "55", hint: "across 4 organisations", icon: Users },
  { label: "Certificates issued", value: "403", hint: "+18 this month", icon: ShieldCheck },
  {
    label: "Requires attention",
    value: "6",
    hint: "2 certificates · 4 tracking",
    icon: TriangleAlert,
    tone: "warning",
  },
] as const;

function Dashboard() {
  const upcoming = sessions.filter((s) => s.status === "upcoming");
  const attention = certificates.filter((c) => c.status === "pending" || c.status === "hold");
  const openTracking = tracking.filter((t) => t.status !== "completed");

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="Good morning, Priya"
          description="Here is the state of training operations across your organisations today."
          crumbs={[{ label: "Seal" }, { label: "Dashboard" }]}
          actions={
            <>
              <Button variant="outline" asChild>
                <Link to="/tracking">
                  <Radar className="size-4" /> Tracking
                </Link>
              </Button>
              <CreateMenu />
            </>
          }
        />

        <Panel className="grid grid-cols-2 divide-border/70 sm:divide-x xl:grid-cols-4">
          {kpis.map((kpi, i) => (
            <div
              key={kpi.label}
              className="flex items-start justify-between gap-3 px-5 py-4"
              style={{ animation: `rise 0.5s cubic-bezier(0.22,1,0.36,1) ${i * 60}ms both` }}
            >
              <Metric
                label={kpi.label}
                value={kpi.value}
                hint={kpi.hint}
                tone={"tone" in kpi ? (kpi.tone as "seal" | "warning") : "default"}
              />
              <kpi.icon className="mt-0.5 size-4 shrink-0 text-muted-foreground/70" />
            </div>
          ))}
        </Panel>

        <section className="grid gap-5 xl:grid-cols-3">
          <Panel className="xl:col-span-2">
            <PanelHeader
              title="Upcoming training"
              subtitle="Next scheduled sessions across all organisations"
              action={
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/sessions">
                    View all <ChevronRight className="size-3.5" />
                  </Link>
                </Button>
              }
            />
            <div className="divide-y divide-border border-t border-border">
              {upcoming.map((s) => {
                const course = courseOf(s.courseId);
                const org = orgOf(s.organisationId);
                return (
                  <Link
                    key={s.id}
                    to="/sessions/$sessionId"
                    params={{ sessionId: s.id }}
                    className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-surface-sunken text-center">
                      <span className="text-[10px] tracking-wider text-muted-foreground uppercase">
                        {s.date.split(" ")[1]}
                      </span>
                      <span className="-mt-0.5 text-base font-bold">{s.date.split(" ")[0]}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{course?.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {s.reference} · {s.time} · {org?.name}
                      </p>
                    </div>
                    <div className="hidden items-center gap-2 sm:flex">
                      <StatusChip tone="neutral" size="sm" dot={false}>
                        {s.attendees}/{s.capacity} attendees
                      </StatusChip>
                      <StatusChip tone={sessionTone[s.status]} size="sm">
                        {sessionStatusLabel[s.status]}
                      </StatusChip>
                    </div>
                    <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:text-seal" />
                  </Link>
                );
              })}
            </div>
          </Panel>

          <Panel className="p-5">
            <PanelHeader
              className="p-0 pb-4"
              title="Training progress"
              subtitle="Completion across live sessions"
            />
            <div className="flex items-center gap-5">
              <ProgressRing value={68} size={104} stroke={10} />
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold">68% complete</p>
                  <p className="text-xs text-muted-foreground">of scheduled training this quarter</p>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Attended", value: 82, tone: "success" as const },
                    { label: "Assessed", value: 61, tone: "seal" as const },
                    { label: "Certified", value: 47, tone: "info" as const },
                  ].map((row) => (
                    <div key={row.label}>
                      <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
                        <span>{row.label}</span>
                        <span className="tabular-nums">{row.value}%</span>
                      </div>
                      <Bar value={row.value} tone={row.tone} className="w-40" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Panel>
        </section>

        <section className="grid gap-5 xl:grid-cols-3">
          <Panel>
            <PanelHeader
              title="Certificates requiring action"
              subtitle={`${attention.length} awaiting a decision`}
              action={
                <StatusChip tone="warning" size="sm">
                  Action
                </StatusChip>
              }
            />
            <div className="space-y-3 px-5 pb-5">
              {attention.map((c) => {
                const person = personOf(c.personId);
                return (
                  <Link
                    key={c.id}
                    to="/certificates/$certificateId"
                    params={{ certificateId: c.id }}
                    className="hover-lift block rounded-xl border border-border bg-surface-sunken/70 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar initials={person?.initials ?? "--"} tone="seal" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{person?.name}</p>
                          <p className="truncate font-mono text-[11px] text-muted-foreground">
                            {c.number}
                          </p>
                        </div>
                      </div>
                      <StatusChip tone={certificateTone[c.status]} size="sm">
                        {certificateStatusLabel[c.status]}
                      </StatusChip>
                    </div>
                  </Link>
                );
              })}
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link to="/certificates">Open certificate queue</Link>
              </Button>
            </div>
          </Panel>

          <Panel>
            <PanelHeader
              title="Tracking"
              subtitle="Open items across sessions"
              action={
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/tracking">Open</Link>
                </Button>
              }
            />
            <div className="space-y-3 px-5 pb-5">
              {openTracking.map((t) => (
                <div key={t.id} className="rounded-xl border border-border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{t.label}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {personOf(t.personId)?.name} · due {t.due}
                      </p>
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
          </Panel>

          <Panel>
            <PanelHeader title="Recent activity" subtitle="Last 7 days" />
            <ol className="relative space-y-4 px-5 pb-5">
              <span className="absolute top-1 bottom-6 left-[26px] w-px bg-border" />
              {activity.map((a) => (
                <li key={a.id} className="relative flex gap-3">
                  <span className="z-10 mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-full border border-border bg-surface">
                    <span className="size-1.5 rounded-full bg-seal" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm leading-snug font-medium">{a.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {a.detail} · {a.time}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Panel>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          <Panel className="lg:col-span-2">
            <PanelHeader
              title="Organisations"
              subtitle="Compliance across your customer accounts"
              action={
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/organisations">All organisations</Link>
                </Button>
              }
            />
            <div className="grid gap-3 px-5 pb-5 sm:grid-cols-2">
              {organisations.map((o) => (
                <Link
                  key={o.id}
                  to="/organisations/$orgId"
                  params={{ orgId: o.id }}
                  className="hover-lift rounded-xl border border-border p-4"
                >
                  <div className="flex items-center gap-3">
                    <Avatar initials={o.shortName} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{o.name}</p>
                      <p className="text-xs text-muted-foreground">{o.sector}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{o.sessions} sessions</span>
                    <span className="tabular-nums">{o.compliance}% compliant</span>
                  </div>
                  <Bar
                    value={o.compliance}
                    tone={o.compliance > 80 ? "success" : o.compliance > 70 ? "warning" : "danger"}
                    className="mt-2"
                  />
                </Link>
              ))}
            </div>
          </Panel>

          <div className="space-y-5">
            <Panel className="relative overflow-hidden bg-gradient-ink p-5 text-primary-foreground">
              <Sparkles className="absolute -top-4 -right-4 size-24 opacity-10" />
              <p className="text-xs tracking-widest uppercase opacity-70">Quick actions</p>
              <div className="mt-4 space-y-2">
                {[
                  { label: "Create session", to: "/sessions/new", icon: CalendarDays },
                  { label: "Create certificate", to: "/certificates/new", icon: ShieldCheck },
                  { label: "Review approvals", to: "/certificates", icon: FileCheck2 },
                  { label: "Automations", to: "/settings/automations", icon: Sparkles },
                ].map((a) => (
                  <Link
                    key={a.label}
                    to={a.to}
                    className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/12"
                  >
                    <a.icon className="size-4 opacity-80" />
                    {a.label}
                    <ChevronRight className="ml-auto size-3.5 opacity-60" />
                  </Link>
                ))}
              </div>
            </Panel>

            <Panel className="p-5">
              <PanelHeader className="p-0 pb-3" title="This week" />
              <div className="space-y-3 text-sm">
                {[
                  { icon: CheckCircle2, label: "9 certificates delivered", tone: "text-success" },
                  { icon: Clock, label: "3 sessions scheduled", tone: "text-info" },
                  { icon: TriangleAlert, label: "1 tracking item overdue", tone: "text-danger" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-3">
                    <row.icon className={`size-4 ${row.tone}`} />
                    <span>{row.label}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </section>

        <Panel className="p-5">
          <PanelHeader
            className="p-0 pb-4"
            title="Archived sessions"
            subtitle="Nothing archived in this period"
          />
          <EmptyState
            icon={CalendarDays}
            title="No archived sessions yet"
            description="Completed sessions move here 90 days after their certificates are issued."
            action={
              <Button variant="outline" size="sm" asChild>
                <Link to="/sessions">Browse sessions</Link>
              </Button>
            }
          />
        </Panel>
      </div>
    </AppShell>
  );
}
