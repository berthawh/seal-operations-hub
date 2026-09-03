import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FileBadge, Search } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/seal/primitives";
import { StudioShell } from "@/components/seal/studio";
import { Input } from "@/components/ui/input";
import { getStudioCourse, studioCertificateTypes } from "@/lib/studio-data";

export const Route = createFileRoute("/settings/studio/certificates/")({
  head: () => ({
    meta: [
      { title: "CO Studio — Certificate types · Seal" },
      {
        name: "description",
        content:
          "Configure the 16 locked A4 certificate types: linked course, front overlay values and fixed back artwork.",
      },
      { property: "og:title", content: "CO Studio — Certificate types · Seal" },
      {
        property: "og:description",
        content: "Locked A4 certificate artwork and overlay configuration.",
      },
    ],
  }),
  component: StudioCertificates,
});

function StudioCertificates() {
  const [query, setQuery] = useState("");
  const results = studioCertificateTypes.filter((c) =>
    `${c.name} ${c.code}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <StudioShell>
      <div className="space-y-5">
        <PageHeader
          title="Certificates"
          description="16 controlled certificate types. Artwork, logos, signatures and printed Areas Covered are fixed."
          crumbs={[
            { label: "Seal", to: "/" },
            { label: "Settings", to: "/settings" },
            { label: "CO Studio", to: "/settings/studio" },
            { label: "Certificates" },
          ]}
        />

        <div className="bar flex items-center gap-2 px-3 py-1.5">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search certificate types"
            className="h-8 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          />
          <span className="text-[11px] text-muted-foreground">{results.length} of 16</span>
        </div>

        {results.length === 0 ? (
          <EmptyState
            icon={FileBadge}
            title="No matching certificate types"
            description="Adjust your search to find a controlled certificate."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((c) => {
              const course = getStudioCourse(c.courseId);
              return (
                <Link
                  key={c.id}
                  to="/settings/studio/certificates/$certificateId"
                  params={{ certificateId: c.id }}
                  className="surface-card hover-lift overflow-hidden"
                >
                  <div className="aspect-[1/1.414] border-b border-border/70 bg-surface-sunken p-4">
                    <div
                      className="flex h-full flex-col justify-between rounded-md border border-border/70 bg-white p-3"
                      style={{ color: c.accent }}
                    >
                      <p className="text-[8px] font-semibold tracking-[0.3em] uppercase">
                        Certificate
                      </p>
                      <div className="space-y-1 text-center">
                        <p className="text-[11px] font-semibold">{c.code}</p>
                        <p className="text-[8px] opacity-70">Locked artwork preview</p>
                      </div>
                      <p className="text-[8px] opacity-70">Back: {c.backAsset}</p>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="truncate text-[13px] font-medium">{c.name}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {course?.name ?? "Unlinked"} · updated {c.updatedAt}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </StudioShell>
  );
}
