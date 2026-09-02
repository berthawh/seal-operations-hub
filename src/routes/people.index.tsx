import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, Search, ShieldCheck, UserPlus, Users } from "lucide-react";
import { AppShell } from "@/components/seal/app-shell";
import { Avatar, Bar, EmptyState, PageHeader, Panel } from "@/components/seal/primitives";
import { StatusChip, type ChipTone } from "@/components/seal/status-chip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { orgOf, people } from "@/lib/seal-data";

export const Route = createFileRoute("/people/")({
  head: () => ({
    meta: [
      { title: "People — Seal" },
      {
        name: "description",
        content:
          "Directory of learners, trainers and coordinators with their sessions, training and certificates.",
      },
      { property: "og:title", content: "People — Seal" },
      { property: "og:description", content: "Learners, trainers and coordinators in one directory." },
    ],
  }),
  component: PeoplePage,
});

const roleTone: Record<string, ChipTone> = {
  Learner: "info",
  Trainer: "seal",
  Coordinator: "success",
  Administrator: "neutral",
};

function PeoplePage() {
  const [role, setRole] = useState("all");
  const [query, setQuery] = useState("");
  const visible = people.filter(
    (p) =>
      (role === "all" || p.role === role) &&
      `${p.name} ${p.jobTitle} ${orgOf(p.organisationId)?.name}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="People"
          description="Everyone involved in training delivery — who they are, where they work and what they hold."
          crumbs={[{ label: "Seal", to: "/" }, { label: "People" }]}
          actions={
            <Button variant="seal">
              <UserPlus className="size-4" /> Add person
            </Button>
          }
          meta={
            <>
              <StatusChip tone="info" size="sm">
                {people.filter((p) => p.role === "Learner").length} learners
              </StatusChip>
              <StatusChip tone="seal" size="sm">
                {people.filter((p) => p.role === "Trainer").length} trainers
              </StatusChip>
              <StatusChip tone="success" size="sm">
                {people.filter((p) => p.role === "Coordinator").length} coordinators
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
              placeholder="Search people, roles or organisations…"
              className="h-9 rounded-lg pl-9"
            />
          </div>
          <Tabs value={role} onValueChange={setRole}>
            <TabsList className="rounded-lg">
              {["all", "Learner", "Trainer", "Coordinator", "Administrator"].map((r) => (
                <TabsTrigger key={r} value={r} className="rounded-md text-xs">
                  {r === "all" ? "Everyone" : `${r}s`}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </Panel>

        {visible.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Nobody matches this filter"
            description="Try a different role or clear your search."
            action={
              <Button variant="outline" size="sm" onClick={() => setRole("all")}>
                Show everyone
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((p, i) => {
              const org = orgOf(p.organisationId);
              return (
                <Link
                  key={p.id}
                  to="/people/$personId"
                  params={{ personId: p.id }}
                  className="hover-lift surface-card p-5"
                  style={{ animation: `rise 0.45s cubic-bezier(0.22,1,0.36,1) ${i * 45}ms both` }}
                >
                  <div className="flex items-start gap-3">
                    <Avatar
                      initials={p.initials}
                      tone={p.role === "Trainer" ? "seal" : "ink"}
                      className="size-11 rounded-2xl text-sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{p.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{p.jobTitle}</p>
                    </div>
                    <StatusChip tone={roleTone[p.role]!} size="sm">
                      {p.role}
                    </StatusChip>
                  </div>

                  <p className="mt-4 truncate text-xs text-muted-foreground">{org?.name}</p>

                  <div className="mt-3">
                    <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
                      <span>Training progress</span>
                      <span className="tabular-nums">{p.progress}%</span>
                    </div>
                    <Bar value={p.progress} tone={p.progress === 100 ? "success" : "seal"} />
                  </div>

                  <div className="mt-4 flex items-center gap-3 border-t border-border pt-4 text-xs text-muted-foreground">
                    <span>{p.sessions} sessions</span>
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="size-3" /> {p.certificates}
                    </span>
                    <span className="ml-auto flex items-center gap-1">
                      <Mail className="size-3" /> {p.lastActivity}
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
