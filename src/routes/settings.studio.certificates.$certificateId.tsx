import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { FileBadge, Lock } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/seal/app-shell";
import { EmptyState, Field, PageHeader, Panel, PanelHeader } from "@/components/seal/primitives";
import { StatusChip } from "@/components/seal/status-chip";
import { StudioShell } from "@/components/seal/studio";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getStudioCertificate, getStudioCourse, previewValues } from "@/lib/studio-data";

export const Route = createFileRoute("/settings/studio/certificates/$certificateId")({
  loader: ({ params }) => {
    const certificate = getStudioCertificate(params.certificateId);
    if (!certificate) throw notFound();
    return { name: certificate.name };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.name} — CO Studio · Seal` : "CO Studio — Seal" },
      {
        name: "description",
        content:
          "Locked A4 front and back artwork with the four overlaid certificate values in their predefined positions.",
      },
      { property: "og:title", content: "Certificate type — CO Studio · Seal" },
      { property: "og:description", content: "Front and back configuration for a controlled certificate type." },
    ],
  }),
  notFoundComponent: () => (
    <AppShell>
      <EmptyState
        icon={FileBadge}
        title="Certificate type not found"
        description="This controlled certificate is not part of the catalogue."
      />
    </AppShell>
  ),
  component: StudioCertificateDetail,
});

const VALUE_STYLE = { fontFamily: "Poppins, Inter, sans-serif", fontWeight: 600 };

function StudioCertificateDetail() {
  const { certificateId } = Route.useParams();
  const certificate = getStudioCertificate(certificateId)!;
  const course = getStudioCourse(certificate.courseId);
  const [face, setFace] = useState<"front" | "back">("front");
  const accent = "#474AF5";

  return (
    <StudioShell>
      <div className="space-y-5">
        <PageHeader
          title={certificate.name}
          description={`${certificate.code} · linked to ${course?.name ?? "no course"}`}
          crumbs={[
            { label: "Seal", to: "/" },
            { label: "Settings", to: "/settings" },
            { label: "CO Studio", to: "/settings/studio" },
            { label: "Certificates", to: "/settings/studio/certificates" },
            { label: certificate.code },
          ]}
          meta={
            <>
              <StatusChip tone="neutral" size="sm" dot={false}>
                <Lock className="size-3" /> Locked artwork
              </StatusChip>
              <span className="text-[11px] text-muted-foreground">
                Last updated {certificate.updatedAt} by {certificate.updatedBy}
              </span>
            </>
          }
          actions={
            <Button variant="seal" onClick={() => toast.success("Certificate configuration saved")}>
              Save changes
            </Button>
          }
        />

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <Panel className="p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="bar flex items-center gap-1 p-1">
                {(["front", "back"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFace(f)}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                      face === f
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">A4 portrait · page {face === "front" ? 1 : 2}</p>
            </div>

            <div className="mx-auto w-full max-w-[520px]">
              <div className="relative aspect-[1/1.414] overflow-hidden rounded-md border border-border bg-white shadow-float">
                {face === "front" ? (
                  <>
                    <div className="absolute inset-0 grid place-items-center text-center">
                      <div className="opacity-40">
                        <p className="text-[10px] tracking-[0.3em] uppercase">Locked front artwork</p>
                        <p className="mt-1 text-[10px]">{certificate.code}-front.jpg</p>
                      </div>
                    </div>
                    {/* Overlay placement is indicative — take exact positions from the supplied originals. */}
                    <div className="absolute inset-x-8 top-[42%] text-center">
                      <p
                        className="text-[clamp(13px,3.1vw,21px)] uppercase"
                        style={{ ...VALUE_STYLE, color: accent }}
                      >
                        {previewValues.learner}
                      </p>
                    </div>
                    <div className="absolute inset-x-8 bottom-[16%] flex justify-between text-left">
                      {[
                        { label: "Completed:", value: previewValues.completed },
                        { label: "Valid until:", value: previewValues.validUntil },
                        { label: "Certificate no.", value: previewValues.number },
                      ].map((v) => (
                        <div key={v.label}>
                          <p
                            className="text-[7px] uppercase"
                            style={{ ...VALUE_STYLE, color: accent }}
                          >
                            {v.label}
                          </p>
                          <p
                            className="text-[9px] uppercase"
                            style={{ ...VALUE_STYLE, color: accent }}
                          >
                            {v.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 grid place-items-center bg-surface-sunken text-center">
                    <div className="opacity-50">
                      <p className="text-[10px] tracking-[0.3em] uppercase">Fixed back artwork</p>
                      <p className="mt-1 text-[10px]">{certificate.backAsset}</p>
                      <p className="mt-3 max-w-[70%] mx-auto text-[10px]">
                        Course title, logos, signatures and printed Areas Covered are part of this
                        JPEG and are not editable.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Panel>

          <div className="space-y-5">
            <Panel>
              <PanelHeader
                title="Overlaid values"
                subtitle="Only these four values are printed onto the front"
              />
              <div className="grid gap-4 px-5 pb-5">
                <Field label="Learner name" value={previewValues.learner} />
                <Field label="Completed date" value={previewValues.completed} />
                <Field label="Valid until" value={previewValues.validUntil} />
                <Field label="Certificate number" value={previewValues.number} />
              </div>
            </Panel>

            <Panel>
              <PanelHeader title="Type styling" subtitle="Controlled and applied to every issue" />
              <div className="grid gap-4 px-5 pb-5">
                <Field label="Values" value="Poppins SemiBold · 26 pt · capitalised" />
                <Field label="Labels" value="Poppins SemiBold · 10 pt · capitalised" />
                <div className="flex items-center gap-2">
                  <span className="size-4 rounded" style={{ background: accent }} />
                  <span className="font-mono text-xs">#474AF5</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Display capitalisation is presentational only — the stored learner identity is
                  preserved exactly.
                </p>
              </div>
            </Panel>

            {course ? (
              <Panel>
                <PanelHeader title="Linked course" subtitle="Certificate relationship" />
                <div className="px-5 pb-5">
                  <p className="text-[13px] font-medium">{course.name}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Validity {course.validityMonths} months
                  </p>
                  <Button variant="outline" size="sm" className="mt-3" asChild>
                    <Link to="/settings/studio/courses/$courseId" params={{ courseId: course.id }}>
                      Open course
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
