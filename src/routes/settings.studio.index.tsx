import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BookLock, Search } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/seal/primitives";
import { StatusChip } from "@/components/seal/status-chip";
import { StudioShell } from "@/components/seal/studio";
import { Input } from "@/components/ui/input";
import { studioCourses } from "@/lib/studio-data";

export const Route = createFileRoute("/settings/studio/")({
  head: () => ({
    meta: [
      { title: "CO Studio — Controlled courses · Seal" },
      {
        name: "description",
        content:
          "CO Studio maintains Seal's controlled course catalogue, learning outcomes and certificate validity rules.",
      },
      { property: "og:title", content: "CO Studio — Controlled courses · Seal" },
      {
        property: "og:description",
        content: "Protected workspace for controlled course definitions.",
      },
    ],
  }),
  component: StudioCourses,
});

function StudioCourses() {
  const [query, setQuery] = useState("");
  const results = studioCourses.filter((c) =>
    `${c.name} ${c.code} ${c.category}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <StudioShell>
      <div className="space-y-5">
        <PageHeader
          title="Courses"
          description="The controlled catalogue of 16 course types. Operational users select these definitions; they are maintained here."
          crumbs={[
            { label: "Seal", to: "/" },
            { label: "Settings", to: "/settings" },
            { label: "CO Studio" },
          ]}
        />

        <div className="bar flex items-center gap-2 px-3 py-1.5">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the controlled catalogue"
            className="h-8 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          />
          <span className="text-[11px] text-muted-foreground">{results.length} of 16</span>
        </div>

        {results.length === 0 ? (
          <EmptyState
            icon={BookLock}
            title="No matching courses"
            description="Adjust your search to find a controlled course."
          />
        ) : (
          <div className="surface-card divide-y divide-border/70 overflow-hidden">
            {results.map((c) => (
              <Link
                key={c.id}
                to="/settings/studio/courses/$courseId"
                params={{ courseId: c.id }}
                className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/50"
              >
                <span className="w-20 shrink-0 font-mono text-[11px] text-muted-foreground">
                  {c.code}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium">{c.name}</span>
                  <span className="block text-[11px] text-muted-foreground">
                    {c.category} · {c.outcomes.length} outcomes
                  </span>
                </span>
                <StatusChip tone="neutral" size="sm" dot={false}>
                  {c.validityMonths} months
                </StatusChip>
                <span className="hidden text-[11px] text-muted-foreground sm:block">
                  {c.updatedBy}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </StudioShell>
  );
}
