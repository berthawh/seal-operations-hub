import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowDown, Play, Workflow, Zap } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/seal/app-shell";
import { EmptyState, Field, PageHeader, Panel, PanelHeader } from "@/components/seal/primitives";
import { StatusChip } from "@/components/seal/status-chip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { automations } from "@/lib/seal-data";

export const Route = createFileRoute("/settings/automations/$automationId")({
  loader: ({ params }) => {
    const automation = automations.find((a) => a.id === params.automationId);
    if (!automation) throw notFound();
    return { name: automation.name };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.name} — Automation · Seal` : "Automation — Seal" },
      { name: "description", content: "Edit the trigger, action and workflow for this automation." },
      { property: "og:title", content: "Automation detail — Seal" },
      { property: "og:description", content: "Trigger, action and run history for this automation." },
    ],
  }),
  errorComponent: ({ error }) => <div role="alert">{error.message}</div>,
  notFoundComponent: () => (
    <AppShell>
      <EmptyState
        icon={Workflow}
        title="Automation not found"
        description="This automation may have been deleted."
      />
    </AppShell>
  ),
  component: AutomationDetail,
});

function AutomationDetail() {
  const { automationId } = Route.useParams();
  const automation = automations.find((a) => a.id === automationId)!;
  const [enabled, setEnabled] = useState(automation.enabled);
  const [name, setName] = useState(automation.name);

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title={automation.name}
          description={`${automation.workflow} workflow · ${automation.runs} runs`}
          crumbs={[
            { label: "Seal", to: "/" },
            { label: "Settings", to: "/settings" },
            { label: "Automations", to: "/settings/automations" },
            { label: automation.name },
          ]}
          meta={
            <StatusChip tone={enabled ? "success" : "neutral"}>
              {enabled ? "Enabled" : "Paused"}
            </StatusChip>
          }
          actions={
            <>
              <Button variant="outline" onClick={() => toast.info("Test run queued")}>
                <Play className="size-4" /> Test run
              </Button>
              <Button variant="seal" onClick={() => toast.success("Automation saved")}>
                Save changes
              </Button>
            </>
          }
        />

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            <Panel>
              <PanelHeader title="Flow" subtitle="What starts this automation and what it does" />
              <div className="space-y-3 px-5 pb-5">
                <div className="rounded-2xl border border-border bg-surface-sunken p-5">
                  <div className="mb-2 flex items-center gap-2 text-xs tracking-wide text-muted-foreground uppercase">
                    <Zap className="size-3.5 text-seal" /> Trigger
                  </div>
                  <p className="text-sm font-medium">{automation.trigger}</p>
                </div>
                <div className="flex justify-center">
                  <ArrowDown className="size-4 text-muted-foreground" />
                </div>
                <div className="rounded-2xl border border-border p-5">
                  <div className="mb-2 flex items-center gap-2 text-xs tracking-wide text-muted-foreground uppercase">
                    <Workflow className="size-3.5 text-info" /> Action
                  </div>
                  <p className="text-sm font-medium">{automation.action}</p>
                </div>
              </div>
            </Panel>

            <Panel>
              <PanelHeader title="Configuration" />
              <div className="space-y-5 px-5 pb-5">
                <div className="space-y-2">
                  <Label htmlFor="aut-name">Name</Label>
                  <Input id="aut-name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aut-note">Internal note</Label>
                  <Textarea
                    id="aut-note"
                    rows={3}
                    placeholder="Why this automation exists, and who owns it."
                  />
                </div>
                <div className="flex items-center gap-4 rounded-xl border border-border p-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">Automation enabled</p>
                    <p className="text-xs text-muted-foreground">
                      Pausing keeps the configuration but stops future runs.
                    </p>
                  </div>
                  <Switch
                    checked={enabled}
                    onCheckedChange={(v) => {
                      setEnabled(v);
                      toast.success(v ? "Automation enabled" : "Automation paused");
                    }}
                  />
                </div>
              </div>
            </Panel>
          </div>

          <aside className="space-y-5">
            <Panel className="p-5">
              <PanelHeader className="p-0 pb-3" title="Details" />
              <div className="space-y-4">
                <Field label="Workflow" value={automation.workflow} />
                <Field label="Runs" value={automation.runs} />
                <Field label="Last run" value={enabled ? "2 hours ago" : "Paused"} />
                <Field label="Owner" value="Operations team" />
              </div>
            </Panel>

            <Panel className="p-5">
              <PanelHeader className="p-0 pb-3" title="Related" />
              <Button variant="soft" className="w-full justify-start" asChild>
                <Link to="/settings/automations">
                  <Workflow className="size-4" /> All automations
                </Link>
              </Button>
            </Panel>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
