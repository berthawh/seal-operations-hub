import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, Clock, Radar } from "lucide-react";
import { AppShell } from "@/components/seal/app-shell";
import {
  Avatar,
  Bar,
  EmptyState,
  Metric,
  PageHeader,
  Panel,
  PanelHeader,
  ProgressRing,
} from "@/components/seal/primitives";
import { StatusChip, trackingTone } from "@/components/seal/status-chip";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  certificateOf,
  courseOf,
  personOf,
  sessionOf,
  tracking,
  trackingStatusLabel,
  type TrackingStatus,
} from "@/lib/seal-data";

export const Route = createFileRoute("/tracking/")({
  head: () => ({
    meta: [
      { title: "Tracking — Seal" },
      {
        name: "description",
        content:
          "Monitor outstanding training obligations, deadlines and certificate follow-ups in one workspace.",
      },
      { property: "og:title", content: "Tracking — Seal" },
      { property: "og:description", content: "What is on track, due soon, overdue or complete." },
    ],
  }),
  component: TrackingPage,
});

const filters: { id: "all" | TrackingStatus; label: string }[] = [
  { id: "all", label: "Everything" },
  { id: "overdue", label: "Overdue" },
  { id: "due_soon", label: "Due soon" },
  { id: "on_track", label: "On track" },
  { id: "completed", label: "Completed" },
];

function TrackingPage() {
  const [filter, setFilter] = useState<string>("all");
  const visible = tracking.filter((t) => filter === "all" || t.status === filter);
  const count = (s: TrackingStatus) => tracking.filter((t) => t.status === s).length;
  const completion = Math.round(
    tracking.reduce((sum, t) => sum + t.progress, 0) / Math.max(tracking.length, 1),
  );

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Tracking"
          description="Everything Seal is watching after a session ends — assessments, confirmations and renewals."
          crumbs={[{ label: "Seal", to: "/" }, { label: "Tracking" }]}
          actions={
            <Button
              variant="outline"
              onClick={() => toast.success("Reminders sent to open tracking items")}
            >
              Send reminders
            </Button>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Panel className="p-5">
            <Metric label="Overdue" value={count("overdue")} hint="needs action now" tone="danger" />
          </Panel>
          <Panel className="p-5">
            <Metric label="Due soon" value={count("due_soon")} hint="next 7 days" tone="warning" />
          </Panel>
          <Panel className="p-5">
            <Metric label="On track" value={count("on_track")} hint="no action needed" />
          </Panel>
          <Panel className="flex items-center gap-4 p-5">
            <ProgressRing value={completion} size={64} />
            <div>
              <p className="text-xs tracking-wide text-muted-foreground uppercase">
                Overall completion
              </p>
              <p className="text-sm font-medium">Across {tracking.length} tracked items</p>
            </div>
          </Panel>
        </div>

        <Panel className="flex flex-wrap items-center gap-3 p-3">
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList className="rounded-lg">
              {filters.map((f) => (
                <TabsTrigger key={f.id} value={f.id} className="rounded-md text-xs">
                  {f.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <p className="ml-auto pr-2 text-xs text-muted-foreground">
            {visible.length} of {tracking.length} items
          </p>
        </Panel>

        {visible.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="Nothing in this state"
            description="No tracked items currently match this filter."
            action={
              <Button variant="outline" size="sm" onClick={() => setFilter("all")}>
                Show everything
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {visible.map((t, i) => {
              const person = personOf(t.personId);
              const session = sessionOf(t.sessionId);
              const cert = t.certificateId ? certificateOf(t.certificateId) : undefined;
              return (
                <Panel
                  key={t.id}
                  className="hover-lift p-5"
                  style={{ animation: `rise 0.45s cubic-bezier(0.22,1,0.36,1) ${i * 45}ms both` }}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={
                        "mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl " +
                        (t.status === "overdue"
                          ? "bg-danger/10 text-danger"
                          : t.status === "due_soon"
                            ? "bg-warning/10 text-warning"
                            : t.status === "completed"
                              ? "bg-success/10 text-success"
                              : "bg-muted text-muted-foreground")
                      }
                    >
                      {t.status === "overdue" ? (
                        <AlertTriangle className="size-4" />
                      ) : t.status === "completed" ? (
                        <CheckCircle2 className="size-4" />
                      ) : (
                        <Clock className="size-4" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{t.label}</p>
                      <p className="text-xs text-muted-foreground">{t.note}</p>
                    </div>
                    <StatusChip tone={trackingTone[t.status]} size="sm">
                      {trackingStatusLabel[t.status]}
                    </StatusChip>
                  </div>

                  <div className="mt-4">
                    <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
                      <span>Progress</span>
                      <span className="tabular-nums">{t.progress}%</span>
                    </div>
                    <Bar
                      value={t.progress}
                      tone={
                        t.status === "overdue"
                          ? "danger"
                          : t.status === "completed"
                            ? "success"
                            : "seal"
                      }
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4 text-xs">
                    {person ? (
                      <Link
                        to="/people/$personId"
                        params={{ personId: person.id }}
                        className="flex items-center gap-2 hover:text-seal"
                      >
                        <Avatar initials={person.initials} className="size-6 text-[10px]" />
                        {person.name}
                      </Link>
                    ) : null}
                    {session ? (
                      <Link
                        to="/sessions/$sessionId"
                        params={{ sessionId: session.id }}
                        className="text-muted-foreground hover:text-seal"
                      >
                        {courseOf(session.courseId)?.name}
                      </Link>
                    ) : null}
                    <span className="ml-auto flex items-center gap-3">
                      {cert ? (
                        <Link
                          to="/certificates/$certificateId"
                          params={{ certificateId: cert.id }}
                          className="font-mono text-[11px] text-muted-foreground hover:text-seal"
                        >
                          {cert.number}
                        </Link>
                      ) : null}
                      <span className="text-muted-foreground">Due {t.due}</span>
                    </span>
                  </div>
                </Panel>
              );
            })}
          </div>
        )}

        <Panel>
          <PanelHeader title="Timeline" subtitle="Upcoming deadlines in order" />
          <ol className="relative space-y-5 px-6 pb-6">
            <span className="absolute top-1 bottom-6 left-[1.35rem] w-px bg-border" />
            {tracking.map((t) => (
              <li key={t.id} className="relative flex gap-4 pl-8">
                <span
                  className={
                    "absolute left-0 mt-1 size-3 rounded-full ring-4 ring-surface " +
                    (t.status === "overdue"
                      ? "bg-danger"
                      : t.status === "due_soon"
                        ? "bg-warning"
                        : t.status === "completed"
                          ? "bg-success"
                          : "bg-seal")
                  }
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{t.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {personOf(t.personId)?.name} · due {t.due}
                  </p>
                </div>
                <Radar className="size-4 shrink-0 text-muted-foreground" />
              </li>
            ))}
          </ol>
        </Panel>
      </div>
    </AppShell>
  );
}
