import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarDays,
  Filter,
  LayoutGrid,
  MapPin,
  Rows3,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { AppShell, CreateMenu } from "@/components/seal/app-shell";
import { Bar, EmptyState, Field, PageHeader, Panel } from "@/components/seal/primitives";
import { StatusChip, sessionTone } from "@/components/seal/status-chip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  courseOf,
  orgOf,
  personOf,
  sessionStatusLabel,
  sessions,
  type SessionStatus,
} from "@/lib/seal-data";

export const Route = createFileRoute("/sessions/")({
  head: () => ({
    meta: [
      { title: "Sessions — Seal" },
      {
        name: "description",
        content:
          "Plan, monitor and progress every training session with attendance, certificate and tracking state in one view.",
      },
      { property: "og:title", content: "Sessions — Seal" },
      {
        property: "og:description",
        content: "Every training session with attendance, certificate and tracking state.",
      },
    ],
  }),
  component: SessionsPage,
});

const filters: { key: SessionStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "in_progress", label: "In progress" },
  { key: "completed", label: "Completed" },
  { key: "attention", label: "Attention" },
];

function SessionsPage() {
  const [status, setStatus] = useState<SessionStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [layout, setLayout] = useState<"grid" | "list">("grid");

  const visible = sessions.filter((s) => {
    const matchStatus = status === "all" || s.status === status;
    const text = `${s.reference} ${courseOf(s.courseId)?.name} ${orgOf(s.organisationId)?.name}`;
    return matchStatus && text.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Sessions"
          description="Every scheduled, live and completed training session across your organisations."
          crumbs={[{ label: "Seal", to: "/" }, { label: "Sessions" }]}
          actions={<CreateMenu />}
          meta={
            <>
              <StatusChip tone="info" size="sm">
                {sessions.filter((s) => s.status === "upcoming").length} upcoming
              </StatusChip>
              <StatusChip tone="seal" size="sm">
                {sessions.filter((s) => s.status === "in_progress").length} in progress
              </StatusChip>
              <StatusChip tone="warning" size="sm">
                {sessions.filter((s) => s.status === "attention").length} need attention
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
              placeholder="Search sessions, references, organisations…"
              className="h-9 rounded-lg pl-9"
            />
          </div>
          <Tabs value={status} onValueChange={(v) => setStatus(v as SessionStatus | "all")}>
            <TabsList className="rounded-lg">
              {filters.map((f) => (
                <TabsTrigger key={f.key} value={f.key} className="rounded-md text-xs">
                  {f.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Select defaultValue="date">
            <SelectTrigger className="h-9 w-[150px] rounded-lg">
              <Filter className="size-3.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Sort: date</SelectItem>
              <SelectItem value="org">Sort: organisation</SelectItem>
              <SelectItem value="progress">Sort: progress</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
            <Button
              variant={layout === "grid" ? "secondary" : "ghost"}
              size="icon-sm"
              aria-label="Grid layout"
              onClick={() => setLayout("grid")}
            >
              <LayoutGrid className="size-4" />
            </Button>
            <Button
              variant={layout === "list" ? "secondary" : "ghost"}
              size="icon-sm"
              aria-label="List layout"
              onClick={() => setLayout("list")}
            >
              <Rows3 className="size-4" />
            </Button>
          </div>
        </Panel>

        {visible.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No sessions match these filters"
            description="Try a different status, or clear your search to see all scheduled training."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStatus("all");
                  setQuery("");
                }}
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <div
            className={
              layout === "grid" ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3" : "space-y-3"
            }
          >
            {visible.map((s, i) => {
              const course = courseOf(s.courseId);
              const org = orgOf(s.organisationId);
              const trainer = personOf(s.trainerId);
              return (
                <Link
                  key={s.id}
                  to="/sessions/$sessionId"
                  params={{ sessionId: s.id }}
                  className="hover-lift surface-card block p-5"
                  style={{ animation: `rise 0.45s cubic-bezier(0.22,1,0.36,1) ${i * 45}ms both` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-[11px] text-muted-foreground">{s.reference}</p>
                      <h3 className="truncate text-base font-semibold">{course?.name}</h3>
                    </div>
                    <StatusChip tone={sessionTone[s.status]} size="sm">
                      {sessionStatusLabel[s.status]}
                    </StatusChip>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <Field
                      label="Date"
                      value={
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="size-3.5 text-muted-foreground" /> {s.date}
                        </span>
                      }
                    />
                    <Field label="Time" value={s.time} />
                    <Field
                      label="Trainer"
                      value={
                        <span className="flex items-center gap-1.5">
                          <UserRound className="size-3.5 text-muted-foreground" /> {trainer?.name}
                        </span>
                      }
                    />
                    <Field label="Organisation" value={org?.shortName} />
                  </div>

                  <div className="mt-4">
                    <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Session progress</span>
                      <span className="tabular-nums">{s.progress}%</span>
                    </div>
                    <Bar
                      value={s.progress}
                      tone={s.status === "attention" ? "warning" : "seal"}
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                    <StatusChip tone="neutral" size="sm" dot={false}>
                      {s.attendees}/{s.capacity} attendees
                    </StatusChip>
                    <StatusChip
                      tone={s.certificatesIssued > 0 ? "success" : "neutral"}
                      size="sm"
                      dot={false}
                    >
                      <ShieldCheck className="size-3" /> {s.certificatesIssued} issued
                    </StatusChip>
                    {s.trackingOpen > 0 ? (
                      <StatusChip tone="warning" size="sm">
                        {s.trackingOpen} tracking
                      </StatusChip>
                    ) : (
                      <StatusChip tone="success" size="sm">
                        Tracking clear
                      </StatusChip>
                    )}
                    <span className="ml-auto flex items-center gap-1 text-[11px] text-muted-foreground">
                      <MapPin className="size-3" /> {s.location}
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
