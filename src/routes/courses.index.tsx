import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Clock, GraduationCap, Plus, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/seal/app-shell";
import { CourseTerms } from "@/components/seal/course-terms";
import { EmptyState, Field, PageHeader, Panel } from "@/components/seal/primitives";
import { StatusChip, type ChipTone } from "@/components/seal/status-chip";
import { Button } from "@/components/ui/button";
import { courses } from "@/lib/seal-data";

export const Route = createFileRoute("/courses/")({
  head: () => ({
    meta: [
      { title: "Courses — Seal" },
      {
        name: "description",
        content:
          "A visual catalogue of training courses with validity periods, status and linked sessions.",
      },
      { property: "og:title", content: "Courses — Seal" },
      { property: "og:description", content: "Training catalogue with validity and session usage." },
    ],
  }),
  component: CoursesPage,
});

const statusTone: Record<string, ChipTone> = {
  active: "success",
  draft: "neutral",
  retired: "warning",
};

function CoursesPage() {
  const active = courses.filter((c) => c.status !== "retired");
  const retired = courses.filter((c) => c.status === "retired");

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Courses"
          description="The controlled catalogue of 16 course types. Every course carries 12 months certificate validity."
          crumbs={[{ label: "Seal", to: "/" }, { label: "Courses" }]}
          actions={
            <Button variant="seal">
              <Plus className="size-4" /> New course
            </Button>
          }
          meta={
            <>
              <StatusChip tone="success" size="sm">
                {courses.filter((c) => c.status === "active").length} active
              </StatusChip>
              <StatusChip tone="neutral" size="sm">
                {courses.filter((c) => c.status === "draft").length} draft
              </StatusChip>
            </>
          }
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {active.map((c, i) => (
            <Link
              key={c.id}
              to="/courses/$courseId"
              params={{ courseId: c.id }}
              className="hover-lift surface-card group flex flex-col overflow-hidden"
              style={{ animation: `rise 0.45s cubic-bezier(0.22,1,0.36,1) ${i * 50}ms both` }}
            >
              <div className="relative h-24 bg-gradient-ink">
                <div className="absolute inset-0 opacity-25 [background:radial-gradient(circle_at_20%_120%,var(--seal),transparent_60%)]" />
                <div className="absolute bottom-3 left-4 flex items-center gap-2">
                  <span className="grid size-9 place-items-center rounded-xl bg-white/10 text-primary-foreground backdrop-blur">
                    <GraduationCap className="size-4" />
                  </span>
                  <span className="font-mono text-[11px] text-primary-foreground/70">{c.code}</span>
                </div>
                <StatusChip tone={statusTone[c.status]!} size="sm" className="absolute top-3 right-3">
                  {c.status}
                </StatusChip>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-base font-semibold">{c.name}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{c.summary}</p>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <Field
                    label="Classroom time"
                    value={
                      <span className="flex items-center gap-1.5">
                        <Clock className="size-3.5 text-muted-foreground" /> 9am – 5pm
                      </span>
                    }
                  />
                  <Field
                    label="Validity"
                    value={
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="size-3.5 text-muted-foreground" />{" "}
                        {c.validityMonths} months
                      </span>
                    }
                  />
                </div>
                <div className="mt-4 flex items-center gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
                  <span>{c.sessions} sessions</span>
                  <span className="opacity-40">·</span>
                  <span>{c.certificates} certificates</span>
                  <span className="ml-auto font-semibold text-seal opacity-0 transition-opacity group-hover:opacity-100">
                    Open
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <Panel className="p-5">
          <h2 className="text-sm font-semibold">Retired courses</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Kept for certificate history. New sessions cannot be scheduled.
          </p>
          <div className="mt-4 space-y-3">
            {retired.length ? (
              retired.map((c) => (
                <Link
                  key={c.id}
                  to="/courses/$courseId"
                  params={{ courseId: c.id }}
                  className="flex items-center gap-4 rounded-xl border border-border bg-surface-sunken/60 p-4 opacity-80 transition-opacity hover:opacity-100"
                >
                  <BookOpen className="size-4 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.code} · {c.certificates} certificates issued
                    </p>
                  </div>
                  <StatusChip tone="neutral" size="sm">
                    Retired
                  </StatusChip>
                </Link>
              ))
            ) : (
              <EmptyState
                icon={BookOpen}
                title="No retired courses"
                description="Courses you retire will be listed here."
              />
            )}
          </div>
        </Panel>

        <CourseTerms />
      </div>
    </AppShell>
  );
}
