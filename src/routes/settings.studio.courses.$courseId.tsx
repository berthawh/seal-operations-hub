import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, BookLock, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/seal/app-shell";
import { EmptyState, Field, PageHeader, Panel, PanelHeader } from "@/components/seal/primitives";
import { StatusChip } from "@/components/seal/status-chip";
import { StudioShell } from "@/components/seal/studio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getStudioCertificate, getStudioCourse, type StudioOutcome } from "@/lib/studio-data";

export const Route = createFileRoute("/settings/studio/courses/$courseId")({
  loader: ({ params }) => {
    const course = getStudioCourse(params.courseId);
    if (!course) throw notFound();
    return { name: course.name };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.name} — CO Studio · Seal` : "CO Studio — Seal" },
      {
        name: "description",
        content: "Course identity, learning outcomes and the controlled certificate validity rule.",
      },
      { property: "og:title", content: "Controlled course — CO Studio · Seal" },
      { property: "og:description", content: "Maintain outcomes and validity for a controlled course." },
    ],
  }),
  notFoundComponent: () => (
    <AppShell>
      <EmptyState
        icon={BookLock}
        title="Course not found"
        description="This controlled course is not part of the catalogue."
      />
    </AppShell>
  ),
  component: StudioCourseDetail,
});

function StudioCourseDetail() {
  const { courseId } = Route.useParams();
  const course = getStudioCourse(courseId)!;
  const certificate = getStudioCertificate(course.certificateId);
  const [outcomes, setOutcomes] = useState<StudioOutcome[]>(course.outcomes);

  function move(index: number, delta: number) {
    const next = [...outcomes];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    const a = next[index]!;
    next[index] = next[target]!;
    next[target] = a;
    setOutcomes(next);
  }

  return (
    <StudioShell>
      <div className="space-y-5">
        <PageHeader
          title={course.name}
          description={`${course.code} · ${course.category}`}
          crumbs={[
            { label: "Seal", to: "/" },
            { label: "Settings", to: "/settings" },
            { label: "CO Studio", to: "/settings/studio" },
            { label: course.code },
          ]}
          meta={
            <>
              <StatusChip tone="neutral" size="sm" dot={false}>
                Controlled definition
              </StatusChip>
              <span className="text-[11px] text-muted-foreground">
                Last updated {course.updatedAt} by {course.updatedBy}
              </span>
            </>
          }
          actions={
            <Button variant="seal" onClick={() => toast.success("Course outcomes saved")}>
              Save changes
            </Button>
          }
        />

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <Panel>
            <PanelHeader
              title="Learning outcomes"
              subtitle="Structured outcomes used across Seal. Editing these does not rewrite the certificate back page."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setOutcomes([
                      ...outcomes,
                      { id: `${course.id}-o${outcomes.length + 1}-${Date.now()}`, text: "" },
                    ])
                  }
                >
                  <Plus className="size-3.5" /> Add outcome
                </Button>
              }
            >
            </PanelHeader>
            <div className="divide-y divide-border/70 border-t border-border/70">
              {outcomes.map((o, i) => (
                <div key={o.id} className="flex items-center gap-2 px-4 py-2.5">
                  <span className="w-5 shrink-0 text-[11px] text-muted-foreground">{i + 1}</span>
                  <Input
                    value={o.text}
                    placeholder="Outcome wording"
                    onChange={(e) =>
                      setOutcomes(
                        outcomes.map((x) => (x.id === o.id ? { ...x, text: e.target.value } : x)),
                      )
                    }
                    className="h-8"
                  />
                  <Button variant="ghost" size="icon-sm" onClick={() => move(i, -1)}>
                    <ArrowUp className="size-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => move(i, 1)}>
                    <ArrowDown className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setOutcomes(outcomes.filter((x) => x.id !== o.id))}
                  >
                    <Trash2 className="size-3.5 text-danger" />
                  </Button>
                </div>
              ))}
              {outcomes.length === 0 ? (
                <p className="px-4 py-6 text-center text-xs text-muted-foreground">
                  No outcomes recorded for this course yet.
                </p>
              ) : null}
            </div>
          </Panel>

          <div className="space-y-5">
            <Panel>
              <PanelHeader title="Identity" subtitle="Established course information" />
              <div className="grid gap-4 px-5 pb-5">
                <Field label="Course code" value={course.code} />
                <Field label="Category" value={course.category} />
                <Field label="Certificate validity" value={`${course.validityMonths} months`} />
                <p className="text-[11px] text-muted-foreground">
                  Validity comes from the supplied business rule and drives calculated expiry.
                </p>
              </div>
            </Panel>

            {certificate ? (
              <Panel>
                <PanelHeader title="Linked certificate" subtitle="One controlled type per course" />
                <div className="px-5 pb-5">
                  <p className="text-[13px] font-medium">{certificate.name}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Back artwork {certificate.backAsset}
                  </p>
                  <Button variant="outline" size="sm" className="mt-3" asChild>
                    <Link
                      to="/settings/studio/certificates/$certificateId"
                      params={{ certificateId: certificate.id }}
                    >
                      Open certificate
                    </Link>
                  </Button>
                </div>
              </Panel>
            ) : null}
          </div>
        </div>
      </div>
    </StudioShell>
  );
}
