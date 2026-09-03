import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CalendarDays, GraduationCap, Pencil, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/seal/app-shell";
import {
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
import {
  certificateStatusLabel,
  certificates,
  courses,
  orgOf,
  personOf,
  sessionStatusLabel,
  sessions,
} from "@/lib/seal-data";

export const Route = createFileRoute("/courses/$courseId")({
  loader: ({ params }) => {
    const course = courses.find((c) => c.id === params.courseId);
    if (!course) throw notFound();
    return { name: course.name };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.name} — Course · Seal` : "Course — Seal" },
      {
        name: "description",
        content: "Course operational detail with validity, linked sessions and issued certificates.",
      },
      { property: "og:title", content: "Course detail — Seal" },
      {
        property: "og:description",
        content: "Validity, sessions and certificates for a training course.",
      },
    ],
  }),
  errorComponent: ({ error }) => <div role="alert">{error.message}</div>,
  notFoundComponent: () => (
    <AppShell>
      <EmptyState
        icon={GraduationCap}
        title="Course not found"
        description="This course may have been removed from the catalogue."
      />
    </AppShell>
  ),
  component: CourseDetail,
});

function CourseDetail() {
  const { courseId } = Route.useParams();
  const course = courses.find((c) => c.id === courseId)!;
  const related = sessions.filter((s) => s.courseId === course.id);
  const relatedCerts = certificates.filter((c) => c.courseId === course.id);

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title={course.name}
          description={course.summary}
          crumbs={[
            { label: "Seal", to: "/" },
            { label: "Courses", to: "/courses" },
            { label: course.code },
          ]}
          meta={
            <>
              <StatusChip tone={course.status === "active" ? "success" : "neutral"}>
                {course.status}
              </StatusChip>
              <StatusChip tone="neutral" dot={false}>
                {course.code}
              </StatusChip>
              <StatusChip tone="neutral" dot={false}>
                {course.category}
              </StatusChip>
            </>
          }
          actions={
            <>
              <Button variant="outline">
                <Pencil className="size-4" /> Edit course
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
            <Metric label="Duration" value={`${course.durationHours}h`} hint="per delivery" />
          </Panel>
          <Panel className="p-5">
            <Metric
              label="Certificate validity"
              value={`${course.validityMonths}m`}
              hint="from completion"
              tone="seal"
            />
          </Panel>
          <Panel className="p-5">
            <Metric label="Sessions" value={course.sessions} hint="all time" />
          </Panel>
          <Panel className="p-5">
            <Metric label="Certificates" value={course.certificates} hint="issued" tone="success" />
          </Panel>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
          <Panel>
            <PanelHeader title="Sessions using this course" subtitle={`${related.length} total`} />
            {related.length ? (
              <div className="divide-y divide-border border-t border-border">
                {related.map((s) => (
                  <Link
                    key={s.id}
                    to="/sessions/$sessionId"
                    params={{ sessionId: s.id }}
                    className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/40"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{s.reference}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {s.date} · {orgOf(s.organisationId)?.name}
                      </p>
                    </div>
                    <div className="hidden w-24 sm:block">
                      <Bar value={s.progress} />
                    </div>
                    <StatusChip tone={sessionTone[s.status]} size="sm">
                      {sessionStatusLabel[s.status]}
                    </StatusChip>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-5">
                <EmptyState
                  icon={CalendarDays}
                  title="No sessions scheduled"
                  description="This course has not been delivered yet."
                  action={
                    <Button variant="seal" size="sm" asChild>
                      <Link to="/sessions/new">Create session</Link>
                    </Button>
                  }
                />
              </div>
            )}
          </Panel>

          <aside className="space-y-5">
            <Panel className="p-5">
              <PanelHeader className="p-0 pb-3" title="Course information" />
              <div className="space-y-4">
                <Field label="Code" value={course.code} />
                <Field label="Category" value={course.category} />
                <Field label="Status" value={course.status} />
                <Field label="Certificate validity" value={`${course.validityMonths} months`} />
              </div>
            </Panel>

            <Panel>
              <PanelHeader title="Recent certificates" subtitle={`${relatedCerts.length} issued`} />
              <div className="space-y-2 px-5 pb-5">
                {relatedCerts.length ? (
                  relatedCerts.map((c) => (
                    <Link
                      key={c.id}
                      to="/certificates/$certificateId"
                      params={{ certificateId: c.id }}
                      className="flex items-center justify-between gap-2 rounded-xl border border-border p-3 transition-colors hover:border-seal/40"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {personOf(c.personId)?.name}
                        </p>
                        <p className="font-mono text-[11px] text-muted-foreground">{c.number}</p>
                      </div>
                      <StatusChip tone={certificateTone[c.status]} size="sm">
                        {certificateStatusLabel[c.status]}
                      </StatusChip>
                    </Link>
                  ))
                ) : (
                  <EmptyState
                    icon={ShieldCheck}
                    title="No certificates"
                    description="Certificates appear once learners complete this course."
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
